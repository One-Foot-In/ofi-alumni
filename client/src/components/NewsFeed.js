import React, { Component } from 'react';
import { Segment, Feed, Image, Header, Icon, Divider, Modal, Grid} from 'semantic-ui-react'
import { makeCall } from '../apis';
import AlumniProfile from './AlumniProfile'

/*
 * DETAILS:
 * NewsFeed component for visual display of news items created on backend
 * Each type of post will recieve its own create(EVENT TYPE)Post method,
 * called by constructDisplay
 * PROPS
 * userDetails - full profile of logged in user
 * role - used to determine which types of news will be pulled
 */
export default class NewsFeed extends Component {
    state={
        newsItems: [],
        display: []
    }

    async componentWillMount() {
        let newsItems = await this.getNews(this.props.userRole)
        await this.setState({
            newsItems: newsItems.news.reverse()
        })
        this.constructDisplay()
    }

    getNews(role) {
        return makeCall({}, '/news/getNews/'+{role}, 'get')
    }

    constructDisplay() {
        let display = []
        let i = 0
        for (let feedItem of this.state.newsItems) {
            if (feedItem.event === 'New Alumni') {
                display.push(<Divider key={i}/>)
                display.push(this.createNewAlumniPost(feedItem))
            }
            i++;
        }
        this.setState({display: display})
    }

    /*
     * EVENT: 'New Alumni'
     * Display to: 'BOTH'
     * Contains: Alumni[0] and time (stored as string) ONLY
     * On Click: Opens a profile modal that can not be interacted with
     */
    createNewAlumniPost(feedItem) {
        let alumniDetails = feedItem.alumni[0];
        let elapsedTime = new Date();
        let uploadedTime = new Date(feedItem.time);
        elapsedTime = Math.floor((elapsedTime.getTime() - uploadedTime.getTime())/3600000);
        const timestampString = (elapsedTime === 0 ? 'Just Now' : `${elapsedTime} hours ago`);

        return(
            <Modal closeIcon key={feedItem._id} onClose={this.close} dimmer='blurring' trigger={
               <Feed.Event>
                    <Feed.Label>
                        <Image src={alumniDetails.imageURL} />
                    </Feed.Label>
                    <Feed.Content>
                        <Feed.Summary>
                            <Feed.User>{alumniDetails.name}</Feed.User> joined the network!
                            <Feed.Date>{timestampString}</Feed.Date>
                        </Feed.Summary>
                        <Feed.Extra>
                            {alumniDetails.name} graduated in {alumniDetails.gradYear}, and currently lives in {alumniDetails.city}, {alumniDetails.country}
                        </Feed.Extra>
                    </Feed.Content>
                </Feed.Event>
            }>
                <Header>
                    <Grid>
                        <Grid.Row columns={2}>
                            <Grid.Column width={7}>Details for {alumniDetails.name}</Grid.Column>
                            <Grid.Column textAlign='right'>Graduated: {alumniDetails.gradYear}</Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Header>
                <Modal.Content>
                    <AlumniProfile details={alumniDetails} isViewOnly={true} />
                </Modal.Content>
            </Modal>
        )
    }
    
    render() {
        return(
            <Segment>
                <Header>
                    <Icon name={'newspaper outline'}/>
                    <Header.Content>Recent News</Header.Content>
                </Header>
                <Feed>
                    {this.state.display}
                </Feed>
            </Segment>
            
        )
    }
}