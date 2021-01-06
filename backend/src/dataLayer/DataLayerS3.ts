import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import {S3} from "aws-sdk";
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('datalayerS3')


export class DataLayerS3 {

    constructor(
        private readonly s3: S3 = new XAWS.S3(),
        private readonly imagesBucketName  = process.env.TODOS_S3_BUCKET) {
    }

    getUploadUrl(todoId: string){
        logger.info('Generating new signed URL',{ additional: todoId});
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.imagesBucketName,
            Key: todoId+'.png',
            Expires: 300
        })
    }

}

