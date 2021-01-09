import { apiEndpoint } from '../config'
import Axios from 'axios'
import moment from 'moment'
import { CreateVideoRequest } from '../types/CreateVideoRequest'
import { VideoItem } from '../types/VideoItem'
import { UpdateVideoRequest } from '../types/UpdateVideoRequest'
import { VideoItemWithComments } from '../types/VideoItemWithComments'
import { CreateVideoCommentRequest } from '../types/CreateVideoCommentRequest'
import { VideoCommentItem } from '../types/VideoCommentItem'

export async function getVideos(idToken: string): Promise<VideoItem[]> {
  console.log('Fetching videos')
  const actCWWeek=createCreationDateKey()
  const response = await Axios.get(`${apiEndpoint}/videos/${actCWWeek}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Videos:', response.data)
  return response.data.items
}

export async function getVideoWithComment(idToken: string, videoId: string): Promise<VideoItemWithComments> {
  console.log('Fetching video with comment: ',videoId)
  const response = await Axios.get(`${apiEndpoint}/video/${videoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Video with Comment:', response.data)
  return response.data.video
}

export async function createVideo(
  idToken: string,
  newVideo: CreateVideoRequest
): Promise<VideoItem> {
  const response = await Axios.post(`${apiEndpoint}/video`,  JSON.stringify(newVideo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function createVideoComment(
  idToken: string,
  videoId: string,
  newVideoComment: CreateVideoCommentRequest
): Promise<VideoCommentItem> {
  const response = await Axios.post(`${apiEndpoint}/video/${videoId}/comment`,  JSON.stringify(newVideoComment), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function updateVideoCounter(
  idToken: string,
  videoId: string,
  updatedVideo: UpdateVideoRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/video/${videoId}`, JSON.stringify(updatedVideo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteVideo(
  idToken: string,
  videoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/video/${videoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}


export async function getUploadUrl(
  idToken: string,
  videoId: string
): Promise<string> {
  console.log('get URL for video: ' +videoId)
  const response = await Axios.post(`${apiEndpoint}/video/${videoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  console.log('uploadurl: ' + response.data.uploadUrl)
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}

function createCreationDateKey():string{
  return moment().format('YYYYW');
}
