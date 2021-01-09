import { VideoCommentItem } from './VideoCommentItem'

export interface VideoItemWithComments {
  userId: string
  videoId: string
  createdAt: string
  creationDateKey: string
  title: string
  description: string
  watchCounter: number
  commentCounter: number
  attachmentUrl?: string
  comments: VideoCommentItem[]
}
