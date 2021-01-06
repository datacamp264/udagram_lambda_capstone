import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
const jwksUrl = 'https://dev-datacamp264.eu.auth0.com/.well-known/jwks.json'
const jwksClient = require('jwks-rsa');

const logger = createLogger('auth')


// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user',{ additional: event.authorizationToken});
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized',{ additional: jwtToken});

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


export async function verifyToken(authHeader: string): Promise<JwtPayload> {

  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const client = jwksClient({
    jwksUri: jwksUrl
  });
  const signingKeyObj = await client.getSigningKeyAsync(jwt.header.kid)
  return await verifyAsyncCall(token,signingKeyObj.getPublicKey())
}
async function verifyAsyncCall(token: string, signingKey: string):Promise<JwtPayload> {
  let promise = await new Promise<JwtPayload>((resolve, reject) => {
    verify(token,signingKey,(err, decoded) => {
      if(err) return reject(err);
      resolve(decoded as JwtPayload)
    } )
  }).catch(err => {throw err});
  return promise
}
function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
