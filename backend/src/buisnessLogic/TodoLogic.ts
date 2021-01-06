import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { DataLayerTodoItem } from '../dataLayer/DataLayerTodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";
import {DataLayerS3} from "../dataLayer/DataLayerS3";
const logger = createLogger('buisnesLogicLayer')
const dataLayerTodoItem = new DataLayerTodoItem()
const dataLayerS3 = new DataLayerS3()

export function getSignedUrl(tokenId: string){
  return dataLayerS3.getUploadUrl(tokenId);
}

export async function getAllTItems(jwtToken: string): Promise<TodoItem[]> {
  logger.info('Getting all items for token',{ additional: jwtToken});
  const userId = parseUserId(jwtToken)
  return dataLayerTodoItem.getAllTItems(userId)
}

export async function updateTodo(jwtToken: string,todoId: string, updateTodoRequest:UpdateTodoRequest):Promise<boolean>{
  logger.info('Updating item: ',{ additional: todoId});
  const userId = parseUserId(jwtToken)
  return await dataLayerTodoItem.updateTodoItem(userId,todoId,updateTodoRequest)
}

export async function deleteTodo(jwtToken: string,todoId: string):Promise<boolean>{
  logger.info('Deleting item: ',{ additional: todoId});
  const userId = parseUserId(jwtToken)
  return await dataLayerTodoItem.deleteTodoItem(userId,todoId)
}

export async function createTodo(
  createGroupRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  logger.info('Create Todo item for token: ',{ additional: jwtToken});
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await dataLayerTodoItem.createTodoItem({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createGroupRequest.name,
    dueDate: createGroupRequest.dueDate,
    done: false,
    attachmentUrl: `https://${process.env.TODOS_S3_BUCKET}.s3.amazonaws.com/${todoId}.png`,
  })
}
