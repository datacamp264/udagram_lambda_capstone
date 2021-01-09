import * as React from 'react'
import {  Header, Grid, Input, Divider, Loader } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { History } from 'history'
import ReactPlayer from 'react-player/lazy'
import { VideoItemWithComments } from '../types/VideoItemWithComments'
import {
  createVideoComment,
  getVideoWithComment, updateVideoCounter
} from '../api/todos-api'

function emptyVideoItemWithComments(): VideoItemWithComments {
  return {
    userId: '',
    videoId:  '',
    createdAt:  '',
    creationDateKey:  '',
    title:  '',
    description:  '',
    watchCounter: 0,
    commentCounter: 0,
    attachmentUrl:  '',
    comments: []
  }
}

interface VideoProps {
  auth: Auth
  match: {
    params: {
      videoId: string
    }
  }
  history: History
}

interface VideoState {
  video: VideoItemWithComments
  newComment: string
  loadingVideo: boolean
}

export class ShowVideo extends React.PureComponent<VideoProps, VideoState> {
  state: VideoState = {
    video: emptyVideoItemWithComments(),
    newComment: '',
    loadingVideo: true,
  }
  handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newComment: event.target.value })
  }
  onCreateComment = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {

      const newComment = await createVideoComment(this.props.auth.getIdToken(), this.state.video.videoId,{
        text: this.state.newComment
      })
      await updateVideoCounter(this.props.auth.getIdToken(),this.props.match.params.videoId,{
        incrementVideoCount: false,
        incrementCommentCount:true
      })
      let oldstateVideo = this.state.video
      oldstateVideo.comments = [...this.state.video.comments, newComment]
      oldstateVideo.commentCounter = oldstateVideo.commentCounter+1
      this.setState({
        video: oldstateVideo,
        newComment: ''
      })
    } catch(e) {
      alert('Video creation failed')
    }
  }

  renderCreateVideoCommentInput() {
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={16} verticalAlign="middle">
            <Input action={{
                     color: 'teal',
                     labelPosition: 'left',
                     icon: 'add',
                     content: 'Add Comment',
                     onClick: this.onCreateComment
                   }}
                   fluid
                   actionPosition='left'
                   placeholder="Enter Comment..."
                   onChange={this.handleCommentChange}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  renderVideo() {
    return (
      <Grid padded>
            <Grid.Row>
              <Grid.Column width={16}>
                <ReactPlayer
                  playing={false}
                  controls={true}
                  url={this.state.video.attachmentUrl}
                />
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                Titel: {this.state.video.title}
              </Grid.Column>
              <Grid.Column width={8} floated="right">
                Description: {this.state.video.description}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                Watched: {this.state.video.watchCounter}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                Comments: {this.state.video.commentCounter}
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
      </Grid>
    )
  }

  renderCommentList() {
    return (
      <Grid padded>
        {this.state.video.comments.map((comment, pos) => {
          return (
            <Grid.Row key={comment.commentId}>
              <Grid.Column width={4} verticalAlign="middle">
                User: {comment.userId.substring(6)}
              </Grid.Column>
              <Grid.Column width={8} floated="right">
                Comment: {comment.text}
              </Grid.Column>
              <Grid.Column width={4} floated="right">
                Created: {comment.createdAt}
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


  renderALL() {
    if (this.state.loadingVideo) {
      return this.renderLoading()
    }

    return (
      <div>
      {this.renderVideo()}
      {this.renderCommentList()}
      {this.renderCreateVideoCommentInput()}
      </div>
    )
  }

  async componentDidMount() {
    try {
      const video = await getVideoWithComment(this.props.auth.getIdToken(),this.props.match.params.videoId)
      console.log('Videomount: '+ video)

      await updateVideoCounter(this.props.auth.getIdToken(),this.props.match.params.videoId,{
        incrementVideoCount: true,
        incrementCommentCount:false
      })
      video.watchCounter = video.watchCounter+1
      this.setState({
        video: video,
        loadingVideo: false
      })
    } catch (e) {
      alert(`Failed to fetch videos: ${e.message}`)
    }
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


  render() {
    return (
      <div>
        <Header as="h1">Show Video</Header>
        {this.renderALL()}

      </div>
    )
  }
}
