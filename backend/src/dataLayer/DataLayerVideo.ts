import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
import { VideoItem } from '../models/VideoItem'
import { createLogger } from '../utils/logger'
import {VideoCommentItem} from "../models/VideoCommentItem";
const logger = createLogger('datalayer')

const XAWS = AWSXRay.captureAWS(AWS)
export class DataLayerVideo {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly videoItemTable  = process.env.VIDEO_TABLE,
        private readonly videoCommentItemTable  = process.env.VIDEO_COMMENT_TABLE,
        private readonly videoItemIndexName = process.env.VIDEO_INDEX_NAME,
        private readonly videoCommentItemIndexName = process.env.VIDEO_COMMENT_INDEX_NAME) {
    }

    async checkUserAccess(userId: string,videoId: string):Promise<boolean>{
        logger.info('Checking item for user',{ additional: userId});
        const result = await this.docClient.query({
            TableName : this.videoItemTable,
            KeyConditionExpression: 'videoId = :videoId',
            FilterExpression:'userId=:userId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':videoId': videoId
            }
        }).promise()
        const items = result.Items
        logger.info(items.length)
        if(items.length != 1) return false;
        return true;
    }

    async getOneVideoId(videoId: string): Promise<VideoItem> {
        logger.info('Getting oneVideo for videoId',{ additional: videoId});

        const result = await this.docClient.query({
            TableName : this.videoItemTable,
            KeyConditionExpression: 'videoId = :videoId',
            ExpressionAttributeValues: {
                ':videoId': videoId
            }
        }).promise()
        const item = result.Items[0]
        return item as VideoItem
    }

    async getCommentsForVideoId(videoId: string): Promise<VideoCommentItem[]> {
        logger.info('Getting comments for videoId',{ additional: videoId});

        const result = await this.docClient.query({
            TableName : this.videoCommentItemTable,
            IndexName: this.videoCommentItemIndexName,
            KeyConditionExpression: 'videoId = :videoId',
            ExpressionAttributeValues: {
                ':videoId': videoId
            }
        }).promise()
        const item = result.Items
        return item as VideoCommentItem[]
    }

    async getAllVideosForCalenderWeekYear(creationDateKey: string): Promise<VideoItem[]> {
        logger.info('Getting all items for calenderWeekYear',{ additional: creationDateKey});

        const result = await this.docClient.query({
            TableName : this.videoItemTable,
            IndexName : this.videoItemIndexName,
            KeyConditionExpression: 'creationDateKey = :creationDateKey',
            ExpressionAttributeValues: {
                ':creationDateKey': creationDateKey
            }
        }).promise()
        logger.info('Items recieved',{ additional: result.Items})
        const items = result.Items
        return items as VideoItem[]
    }

    async createVideoItem(videoItem: VideoItem): Promise<VideoItem> {
        logger.info('Creating new video for user',{ additional: videoItem.userId});
        await this.docClient.put({
            TableName: this.videoItemTable,
            Item: videoItem
        }).promise()
        return videoItem
    }

    async createVideoCommentItem(videoCommentItem: VideoCommentItem): Promise<VideoCommentItem> {
        logger.info('Creating new comment for user',{ additional: videoCommentItem.userId});
        await this.docClient.put({
            TableName: this.videoCommentItemTable,
            Item: videoCommentItem
        }).promise()
        return videoCommentItem
    }

    async deleteVideoItem(userId: string, videoId: string): Promise<boolean>{
        logger.info('Deleting video',{ additional: videoId});
        if (!await this.checkUserAccess(userId,videoId))return false;
        const comments = await this.getCommentsForVideoId(videoId)  as VideoCommentItem[]
        for(let comment of comments){
            await this.deleteCommentItem(comment.commentId);
        }
        await this.docClient.delete({
            TableName : this.videoItemTable,
            Key: {
            videoId }
        }).promise()

        return true
    }
    async deleteCommentItem(commentId: string){
        logger.info('Deleting comment',{ additional: commentId});
        await this.docClient.delete({
            TableName : this.videoCommentItemTable,
            Key: {
                commentId }
        }).promise()
    }
    async updateVideoCommentIncrement(videoId: string): Promise<boolean> {
        logger.info('Updating commentCounter',{ additional: videoId});
        await this.docClient.update({
            TableName:this.videoItemTable,
            Key: {
                videoId},
            UpdateExpression: "add commentCounter :value",
            ExpressionAttributeValues: {
                ":value": 1
            },
        }).promise()
        return true
    }
    async updateVideoIncrement(videoId: string): Promise<boolean> {
        logger.info('Updating watchCounter',{ additional: videoId});
        await this.docClient.update({
            TableName:this.videoItemTable,
            Key: {
                videoId},
            UpdateExpression: "add watchCounter :value",
            ExpressionAttributeValues: {
                ":value": 1
            },
        }).promise()
        return true
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
