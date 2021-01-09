import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateVideoCommentRequest } from '../../requests/CreateVideoCommentRequest'
import {createVideoCommentItem} from '../../buisnessLogic/TodoLogic'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createVideoCommentHttp')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event',{ additional: event});
  const videoId = event.pathParameters.videoId
  if (!videoId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ""
    }
  }
  const newVideo: CreateVideoCommentRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const item = await createVideoCommentItem(newVideo,videoId, jwtToken)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}
