import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import {getCommentsForVideoId,getOneVideoId} from "../../buisnessLogic/TodoLogic";
const logger = createLogger('getTodosHttp')

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
  const video = await getOneVideoId(videoId)
  const comments= await getCommentsForVideoId(videoId)
  logger.info('Processing video',{ additional: video});
  logger.info('Processing comments',{ additional: comments});
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      "video": {
        "userId": video.userId,
        "videoId": video.videoId,
        "createdAt": video.createdAt,
        "title": video.title,
        "description": video.description,
        "watchCounter": video.watchCounter,
        "commentCounter": video.commentCounter,
        "attachmentUrl": video.attachmentUrl,
        comments: comments
      }
    })
  }
}
