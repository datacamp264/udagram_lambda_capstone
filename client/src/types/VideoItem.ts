export interface VideoItem {
  userId: string
  videoId: string
  createdAt: string
  creationDateKey: string
  title: string
  description: string
  watchCounter: number
  commentCounter: number
  attachmentUrl?: string
}
