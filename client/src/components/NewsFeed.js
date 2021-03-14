import React, { Component } from 'react';
import { Message, Segment, Feed, Image, Header, Icon, Divider, Modal, Grid, Menu, Button } from 'semantic-ui-react'
import { makeCall } from '../apis';
import AlumniProfile from './AlumniProfile';
import StudentProfile from './StudentProfile';
import PollCarousel from './carousels/PollCarousel';
import { Event as GaEvent } from '../GaTracking'

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
        display: [],
        activeItem: 'newsfeed'
    }

    async UNSAFE_componentWillMount() {
        let newsItems = await this.getNews(this.props.userRole)
        if (newsItems.news) {
            this.setState({
                newsItems: newsItems.news.reverse()
            })
        }
        this.constructDisplay()
    }

    getNews(role) {
        return makeCall({}, '/news/getNews/'+role+'/'+this.props.userDetails._id, 'get')
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    constructDisplay() {
        let display = []
        let i = 0
        for (let feedItem of this.state.newsItems) {
            switch (feedItem.event) {
                case 'New Alumni':
                    if (feedItem.alumni[0]) {
                        display.push(<Divider key={i}/>)
                        display.push(this.createNewAlumniPost(feedItem))
                    }
                    break;
                case 'New Student':
                    if (feedItem.students[0]) {
                        display.push(<Divider key={i}/>)
                        display.push(this.createNewStudentPost(feedItem))
                    }
                    break;
                case 'Confirmed Meeting':
                    if (feedItem.students[0] && feedItem.alumni[0]) {
                        display.push(<Divider key={i}/>)
                        display.push(this.createCallConfirmedPost(feedItem))
                    }
                    break;
                case 'New Topics':
                    if (feedItem.alumni[0]) {
                        display.push(<Divider key={i}/>)
                        display.push(this.createNewTopicsPost(feedItem))
                    }
                    break;
                case 'New Article':
                    if (feedItem.alumni[0]) {
                        display.push(<Divider key={i}/>)
                        display.push(this.createNewArticlePost(feedItem))
                    }
                    break;
                case 'New Article Input':
                    if (feedItem.alumni[0] || (feedItem.supportData && feedItem.supportData.isAnonymous)) {
                        display.push(<Divider key={i}/>)
                        display.push(this.createNewArticleInputPost(feedItem))
                    }
                    break;
                default:
                    break;
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
        return(
            <Feed.Event key={feedItem._id}>
                <Feed.Label>
                    <Image src={alumniDetails.imageURL} />
                </Feed.Label>
                <Feed.Content>
                    <Feed.Summary>
                        <Modal closeIcon onClose={this.close} dimmer='blurring' trigger={
                            <Feed.User>{alumniDetails.name}</Feed.User>
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
                        </Modal> joined the network!
                            <Feed.Date>{feedItem.timeElapsed}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra>
                        {alumniDetails.name} graduated in {alumniDetails.gradYear}, and currently lives in {alumniDetails.city}, {alumniDetails.country}
                    </Feed.Extra>
                </Feed.Content>
            </Feed.Event>
        )
    }

    /*
     * EVENT: 'New Student'
     * Display to: 'STUDENT'
     * Contains: Student[0] and time ONLY
     * On Click: Opens a profile modal 
     */ 
    createNewStudentPost(feedItem) {
        let studentDetails = feedItem.students[0];

        return(
            <Feed.Event key={feedItem._id}>
                <Feed.Label>
                    <Image src={studentDetails.imageURL} />
                </Feed.Label>
                <Feed.Content>
                    <Feed.Summary>
                        <Modal closeIcon onClose={this.close} dimmer='blurring' trigger={
                            <Feed.User>{studentDetails.name}</Feed.User>
                        }>
                            <Header>
                                Details for {studentDetails.name}
                            </Header>
                            <Modal.Content>
                                <StudentProfile details={studentDetails} isViewOnly={true} />
                            </Modal.Content>
                        </Modal> joined the network! Welcome!
                            <Feed.Date>{feedItem.timeElapsed}</Feed.Date>
                    </Feed.Summary>
                </Feed.Content>
            </Feed.Event>
        )
    }

    /*
     * EVENT: 'Call Confirmed'
     * Display to: 'BOTH' or 'ALUMNI'
     * Contains: Either 2 entries in alumni or 1 entry in alumni and 1 entry in students,
     * supportData.topic,
     * grade(if there is an entry in students),
     * time (stored as string) ONLY
     * On Click: Opens student/alumni profile modal 
     */ 
    createCallConfirmedPost(feedItem) {
        try {
            const mentorDetails = feedItem.alumni[0]
            const menteeDetails = feedItem.students[0]

            return(
                <Feed.Event key={feedItem._id}>
                    <Feed.Label>
                        <Image src={mentorDetails.imageURL} />
                    </Feed.Label>
                    {menteeDetails.imageURL &&
                        <Feed.Label>
                            <Image src={menteeDetails.imageURL} />
                        </Feed.Label>
                    }
                    <Feed.Content>
                        <Feed.Summary>
                            <Modal closeIcon onClose={this.close} dimmer='blurring' trigger={
                                <Feed.User>{mentorDetails.name}</Feed.User>
                            }>
                                <Header>
                                    Details for {mentorDetails.name}
                                </Header>
                                <Modal.Content>
                                    <AlumniProfile details={mentorDetails} isViewOnly={true} />
                                </Modal.Content>
                            </Modal>
                            {` confirmed a call with `}
                            {menteeDetails.name ? (
                                <Modal closeIcon onClose={this.close} dimmer='blurring' trigger={
                                    <Feed.User>{menteeDetails.name}</Feed.User>
                                }>
                                    <Header>
                                        Details for {menteeDetails.name}
                                    </Header>
                                    <Modal.Content>
                                        <StudentProfile details={menteeDetails} isViewOnly={true} />
                                    </Modal.Content>
                                </Modal>
                                ):
                                    <>
                                    {'a student in your grade'}
                                    </>
                            }
                            {
                                (feedItem.supportData && feedItem.supportData.topic) ?
                                ` to discuss ${feedItem.supportData.topic}!`
                                : null
                            }
                                <Feed.Date>{feedItem.timeElapsed}</Feed.Date>
                        </Feed.Summary>
                    </Feed.Content>
                </Feed.Event>
            )
        } catch (e) {
            console.log("Error: NewsFeed#createCallConfirmedPost", e)
        }
    }
    /*
     * EVENT: 'New Topics'
     * Display to: 'BOTH'
     * Contains: Alumni[0] and time (stored as string) ONLY
     * On Click: Opens a profile modal that can not be interacted with
     */
    createNewTopicsPost(feedItem) {
        let alumniDetails = feedItem.alumni[0];
        var topicsString = alumniDetails.topics.join(", ")

        return(
            <Feed.Event key={feedItem._id}>
                <Feed.Label>
                    <Image src={alumniDetails.imageURL} />
                </Feed.Label>
                <Feed.Content>
                    <Feed.Summary>
                        <Modal closeIcon onClose={this.close} dimmer='blurring' trigger={
                            <Feed.User>{alumniDetails.name}</Feed.User>
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
                        </Modal> has added new topics!
                            <Feed.Date>{feedItem.timeElapsed}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra>
                        {alumniDetails.name} is now consulting on: {topicsString}
                    </Feed.Extra>
                </Feed.Content>
            </Feed.Event>
        )
    }

    /*
     * EVENT: 'New Article'
     * Display to: 'BOTH'
     * Contains: Alumni[0] and time (stored as string) ONLY
     * On Click: Opens a profile modal that can not be interacted with
     */
    createNewArticlePost(feedItem) {
        let alumniDetails = feedItem.alumni[0];
        var articleLink = `${window.location.href}workspaces/library/${feedItem.supportData.articleId}`
        return(
            <Feed.Event key={feedItem._id}>
                <Feed.Label>
                    <Image src={alumniDetails.imageURL} />
                </Feed.Label>
                <Feed.Content>
                    <Feed.Summary>
                        <Modal closeIcon onClose={this.close} dimmer='blurring' trigger={
                            <Feed.User>{alumniDetails.name}</Feed.User>
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
                        </Modal> has added a new article!
                        <Feed.Date>{feedItem.timeElapsed}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra>
                        Article: {feedItem.supportData.articlePrompt}
                    </Feed.Extra>
                    <Feed.Extra>
                        <Button
                            size='tiny'
                            primary
                            href={articleLink}
                            onClick={() => {GaEvent('DAILY_ACTIVITY', 'User clicked View article from newsfeed for New Article post', `role=${this.props.userRole} schoolId=${this.props.userDetails.school._id}`)}}
                        >
                            View Article
                        </Button>
                    </Feed.Extra>
                </Feed.Content>
            </Feed.Event>
        )
    }

    /*
     * EVENT: 'New Article Input'
     * Display to: 'BOTH'
     * Contains: Alumni[0] and time (stored as string) ONLY
     * On Click: Opens a profile modal that can not be interacted with
     */
    createNewArticleInputPost(feedItem) {
        let isAnonymous = feedItem.supportData.isAnonymous
        let alumniDetails
        if (!isAnonymous) {
            alumniDetails = feedItem.alumni[0];
        }
        var articleLink = `${window.location.href}workspaces/library/${feedItem.supportData.articleId}`

        return(
            <Feed.Event key={feedItem._id}>
                {
                    <Feed.Label>
                        {
                            isAnonymous ?
                            <Icon name='user'/> :
                            <Image src={alumniDetails.imageURL} />
                        }
                    </Feed.Label>
                }
                <Feed.Content>
                    <Feed.Summary>
                        {
                        isAnonymous ?
                            `An alumnus ` :
                            <Modal closeIcon onClose={this.close} dimmer='blurring' trigger={
                                <Feed.User>{alumniDetails.name}</Feed.User>
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
                        } has added input to an article!
                        <Feed.Date>{feedItem.timeElapsed}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Extra>
                        Article: {feedItem.supportData.articlePrompt}
                    </Feed.Extra>
                    <Feed.Extra>
                        <Button
                            size='tiny'
                            primary
                            href={articleLink}
                            onClick={() => {GaEvent('DAILY_ACTIVITY', 'User clicked View article from newsfeed for New Article Input post', `role=${this.props.userRole} schoolId=${this.props.userDetails.school._id}`)}}
                        >
                            View Article
                        </Button>
                    </Feed.Extra>
                </Feed.Content>
            </Feed.Event>
        )
    }
    
    render() {
        return(
            <>
            <Menu secondary stackable>
                <Menu.Item
                    id='newsfeed'
                    name='newsfeed'
                    active={this.state.activeItem === 'newsfeed'}
                    onClick={this.handleMenuClick}
                >
                    News Feed
                </Menu.Item>
                <Menu.Item
                    id='pollsAndAnnouncements'
                    name='Polls and Announcements'
                    active={this.state.activeItem === 'pollsAndAnnouncements'}
                    onClick={this.handleMenuClick}
                >
                    Polls and Announcements
                </Menu.Item>
            </Menu>

            {this.state.activeItem === 'pollsAndAnnouncements' &&
                <PollCarousel
                    userId={this.props.userDetails.user}
                    isAlumni={this.props.userRole === 'ALUMNI'}
                    alumniOrStudentId={this.props.userDetails._id}
                />
            }
            {this.state.activeItem === 'newsfeed' &&
                <Segment style={{'marginBottom': '1em'}}>
                    <Header>
                        <Icon name={'newspaper outline'}/>
                        <Header.Content>News</Header.Content>
                    </Header>
                    <Feed>
                        {
                            !this.state.display.length &&
                            <>
                            <Divider/>
                            <Message info>
                                <Message.Header>No news to display</Message.Header>
                                <Message.Content>Check back later!</Message.Content>
                            </Message>
                            </>
                        }
                        {this.state.display}
                    </Feed>
                </Segment>
            }
            </>
        )
    }
}