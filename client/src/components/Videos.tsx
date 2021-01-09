import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader, Form
} from 'semantic-ui-react'

import { createVideo, deleteVideo, getUploadUrl, getVideos, uploadFile } from '../api/todos-api'
import Auth from '../auth/Auth'
import { VideoItem } from '../types/VideoItem'

interface VideosProps {
  auth: Auth
  history: History
}
enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface VideosState {
  videos: VideoItem[]
  uploadFile: any
  newVideoTitle: string
  newVideoDescription: string
  loadingVideos: boolean
  uploadState: UploadState
}

export class Videos extends React.PureComponent<VideosProps, VideosState> {
  state: VideosState = {
    videos: [],
    uploadFile: undefined,
    newVideoTitle: '',
    newVideoDescription: '',
    loadingVideos: true,
    uploadState:UploadState.NoUpload
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newVideoTitle: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newVideoDescription: event.target.value })
  }


  onVideoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    var newVideo
    try {
      if (!this.state.uploadFile) {
        alert('File should be selected')
        return
      }
      newVideo = await createVideo(this.props.auth.getIdToken(), {
        title: this.state.newVideoTitle,
        description: this.state.newVideoDescription,
      })
      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newVideo.videoId)
      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.uploadFile)
      alert('File was uploaded!')
      this.setState({
        videos: [...this.state.videos, newVideo],
        newVideoTitle: '',
        newVideoDescription: '',
      })
    } catch(e) {
      if(this.state.uploadState === UploadState.UploadingFile|| this.state.uploadState === UploadState.FetchingPresignedUrl)
      {

        // @ts-ignore
        await deleteVideo(this.props.auth.getIdToken(),newVideo.videoId)
      }
      console.log(`Video creation failed: ${e.message}`)
      alert('Video creation failed')
    }
  }
  onShowButtonClick = (videoId: string) => {
    this.props.history.push(`/video/${videoId}/show`)
  }

  onTodoDelete = async (videoId: string,userId: string) => {
    if(!this.checkUser(userId)){
      alert('This is not your video')
      return
    }
    try {
      await deleteVideo(this.props.auth.getIdToken(), videoId)
      this.setState({
         videos: this.state.videos.filter(video => video.videoId != videoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      uploadFile: files[0]
    })
  }

  checkUser(userId: string) :boolean{
    console.log('user requesting, logedin:',this.props.auth.sub,userId)
   if(userId === this.props.auth.sub) {
     return true;
   }
   return false;
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  async componentDidMount() {
    try {
      const videos = await getVideos(this.props.auth.getIdToken())
      this.setState({
        videos,
        loadingVideos: false
      })
    } catch (e) {
      alert(`Failed to fetch videos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Videos</Header>

        {this.renderCreateVideoInput()}

        {this.renderVideos()}
      </div>
    )
  }

  renderCreateVideoInput() {
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={5} verticalAlign="middle">
            <Input type="file"
                   action={{
                     color: 'teal',
                     labelPosition: 'left',
                     icon: 'add',
                     content: 'Upload Video',
                     onClick: this.onVideoCreate
                   }}
                   fluid
                   actionPosition='left'
                   onChange={this.handleFileChange}
            />
          </Grid.Column>
          <Grid.Column width={4} verticalAlign="middle">
            <Input
              fluid
              actionPosition="left"
              placeholder="Enter Titel..."
              onChange={this.handleTitleChange}
            />
          </Grid.Column>
          <Grid.Column width={7} floated="right">
            <Input
              fluid
              placeholder="Enter description..."
              onChange={this.handleDescriptionChange}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
            {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
            {this.state.uploadState === UploadState.NoUpload && <p>No Upload</p>}
            <Divider />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }


  renderVideos() {
    if (this.state.loadingVideos) {
      return this.renderLoading()
    }

    return this.renderVideosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Videos
        </Loader>
      </Grid.Row>
    )
  }

  renderVideosList() {

    return (
      <Grid padded>
        {this.state.videos.map((video, pos) => {
          return (
            <Grid.Row key={video.videoId}>
              <Grid.Column width={3} verticalAlign="middle">
                  Titel: {video.title}
              </Grid.Column>
              <Grid.Column width={6} floated="right">
                 Description: {video.description}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                Watched: {video.watchCounter}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                Comments: {video.commentCounter}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onShowButtonClick(video.videoId)}
                >
                  <Icon name="youtube" />
                </Button>
              </Grid.Column>
                <Grid.Column width={1} floated="right">
                  <Button
                    icon
                    color="red"
                    onClick={() => this.onTodoDelete(video.videoId,video.userId)}
                  >
                    <Icon name="delete" />
                  </Button>
                </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
