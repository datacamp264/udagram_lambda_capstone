import * as uuid from 'uuid'
import * as moment from 'moment';
import { VideoItem } from '../models/VideoItem'
import { DataLayerVideo } from '../dataLayer/DataLayerVideo'
import { CreateVideoRequest } from '../requests/CreateVideoRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'
import {UpdateVideoRequest} from "../requests/UpdateVideoRequest";
import {DataLayerS3} from "../dataLayer/DataLayerS3";
import {CreateVideoCommentRequest} from "../requests/CreateVideoCommentRequest";
import {VideoCommentItem} from "../models/VideoCommentItem";
const logger = createLogger('buisnesLogicLayer')
const dataLayerTodoItem = new DataLayerVideo()
const dataLayerS3 = new DataLayerS3()

export function getSignedUrl(tokenId: string){
  return dataLayerS3.getUploadUrl(tokenId);
}

export async function getAllTVideosForCalenderWeekYear(creationDateKey: string): Promise<VideoItem[]> {
  logger.info('Getting all items for calenderWeekYear',{ additional: creationDateKey});
  return dataLayerTodoItem.getAllVideosForCalenderWeekYear(creationDateKey)
}

export async function getOneVideoId(videoId: string): Promise<VideoItem> {
  logger.info('Getting oneVideo for videoId',{ additional: videoId});
  return dataLayerTodoItem.getOneVideoId(videoId)
}

export async function getCommentsForVideoId(videoId: string): Promise<VideoCommentItem[]> {
  logger.info('Getting oneVideo for videoId',{ additional: videoId});
  return dataLayerTodoItem.getCommentsForVideoId(videoId)
}

export async function updateVideo(videoId: string, updateVideoRequest:UpdateVideoRequest):Promise<boolean>{
  logger.info('Updating video: ',{ additional: videoId});
  let resultCommentIncrementCount = true;
  let resultVideoIncrementCount = true;
  if(updateVideoRequest.incrementCommentCount){
    resultCommentIncrementCount = await dataLayerTodoItem.updateVideoCommentIncrement(videoId)
  }
  if(updateVideoRequest.incrementVideoCount){
    resultVideoIncrementCount = await dataLayerTodoItem.updateVideoIncrement(videoId)
  }
  return resultCommentIncrementCount && resultVideoIncrementCount;
}

export async function deleteVideo(jwtToken: string, videoId: string):Promise<boolean>{
  logger.info('Deleting video: ',{ additional: videoId});
  const userId = parseUserId(jwtToken)
  return await dataLayerTodoItem.deleteVideoItem(userId,videoId)
}

export async function createVideo(
  createVideoRequest: CreateVideoRequest,
  jwtToken: string
): Promise<VideoItem> {
  logger.info('Create Video item for token: ',{ additional: jwtToken});
  const videoId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await dataLayerTodoItem.createVideoItem({
    userId: userId,
    videoId: videoId,
    createdAt: new Date().toISOString(),
    creationDateKey: createCreationDateKey(),
    title: createVideoRequest.title,
    description: createVideoRequest.description,
    watchCounter: 0,
    commentCounter:0,
    attachmentUrl: `https://${process.env.VIDEO_S3_BUCKET}.s3.amazonaws.com/${videoId}`,
  })
}

export async function createVideoCommentItem(
    createVideoCommentRequest: CreateVideoCommentRequest,
    videoId:string,
    jwtToken: string
): Promise<VideoCommentItem> {
  logger.info('Create Todo VideoComment for token: ',{ additional: jwtToken});
  const commentId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await dataLayerTodoItem.createVideoCommentItem({
    userId: userId,
    videoId: videoId,
    commentId: commentId,
    createdAt: new Date().toISOString(),
    text: createVideoCommentRequest.text
  })
}

export function createCreationDateKey():string{
  return moment().format('YYYYW');
}
