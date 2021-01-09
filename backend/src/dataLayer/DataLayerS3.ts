import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import {S3} from "aws-sdk";
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('datalayerS3')


export class DataLayerS3 {

    constructor(
        private readonly s3: S3 = new XAWS.S3(),
        private readonly imagesBucketName  = process.env.VIDEO_S3_BUCKET) {
    }

    getUploadUrl(videoId: string){
        logger.info('Generating new signed URL',{ additional: videoId});
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.imagesBucketName,
            Key: videoId,
            Expires: 300
        })
    }

}

