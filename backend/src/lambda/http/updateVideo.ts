import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateVideoRequest } from '../../requests/UpdateVideoRequest'
import { createLogger } from '../../utils/logger'
import {updateVideo} from "../../buisnessLogic/TodoLogic";
const logger = createLogger('updateTodoHttp')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event',{ additional: event});
  const videoId = event.pathParameters.videoId
  const updatedVideo: UpdateVideoRequest = JSON.parse(event.body)
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
  const result = await updateVideo(videoId,updatedVideo)
  if (!result){
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ""
    };
  }
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: ""
  };
}
