import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem } from '../models/TodoItem'
//import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'
import {TodoUpdate} from "../models/TodoUpdate";
const logger = createLogger('datalayer')

const XAWS = AWSXRay.captureAWS(AWS)
export class DataLayerTodoItem {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todoItemTable  = process.env.TODOS_TABLE,
        private readonly todoItemIndexName = process.env.INDEX_NAME) {
    }

    async checkUserAccess(userId: string,todoId: string):Promise<boolean>{
        logger.info('Checking item for user',{ additional: userId});
        const result = await this.docClient.query({
            TableName : this.todoItemTable,
            IndexName : this.todoItemIndexName,
            KeyConditionExpression: 'userId = :userId',
            FilterExpression:'todoId=:todoId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':todoId': todoId
            }
        }).promise()
        const items = result.Items
        logger.info(items.length)
        if(items.length != 1) return false;
        return true;
    }

    async getAllTItems(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all items for user',{ additional: userId});

        const result = await this.docClient.query({
            TableName : this.todoItemTable,
            IndexName : this.todoItemIndexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        const items = result.Items
        return items as TodoItem[]
    }

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Creating new item for user',{ additional: todoItem.userId});
        await this.docClient.put({
            TableName: this.todoItemTable,
            Item: todoItem
        }).promise()
        return todoItem
    }

    async deleteTodoItem(userId: string,todoId: string): Promise<boolean>{
        logger.info('Deleting item',{ additional: todoId});
        if (!await this.checkUserAccess(userId,todoId))return false;
        await this.docClient.delete({
            TableName : this.todoItemTable,
            Key: {
            userId,todoId }
        }).promise()
        return true
    }
    async updateTodoItem(userId: string,todoId: string,todoUpdateItem: TodoUpdate): Promise<boolean> {
        logger.info('Updating item',{ additional: todoId});
        if (!await this.checkUserAccess(userId,todoId))return false;
        await this.docClient.update({
            TableName:this.todoItemTable,
            Key: {
                userId,
                todoId},
            UpdateExpression: "set #n = :name, #dD = :dueDate, #d = :done",
            ExpressionAttributeValues:{
                ":name":todoUpdateItem.name,
                ":dueDate":todoUpdateItem.dueDate,
                ":done":todoUpdateItem.done
            },
            ExpressionAttributeNames:{
                "#n":"name",
                "#dD":"dueDate",
                "#d":"done"
            }
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
