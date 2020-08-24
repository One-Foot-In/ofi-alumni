import React, { Component } from 'react';
import { Message, Segment, Feed, Image, Header, Icon, Divider, Modal, Grid} from 'semantic-ui-react'
import { makeCall } from '../apis';
import AlumniProfile from './AlumniProfile';
import StudentProfile from './StudentProfile';

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

    constructDisplay() {
        let display = []
        let i = 0
        for (let feedItem of this.state.newsItems) {
            switch (feedItem.event) {
                case 'New Alumni':
                    display.push(<Divider key={i}/>)
                    display.push(this.createNewAlumniPost(feedItem))
                    break;
                case 'New Student':
                    display.push(<Divider key={i}/>)
                    display.push(this.createNewStudentPost(feedItem))
                    break;
                case 'Confirmed Meeting':
                    display.push(<Divider key={i}/>)
                    display.push(this.createCallConfirmedPost(feedItem))
                    break;
                case 'New Topics':
                    display.push(<Divider key={i}/>)
                    display.push(this.createNewTopicsPost(feedItem))
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
                                    {'a student in your grade '}
                                    </>
                            }
                            {' to discuss' } {feedItem.supportData && feedItem.supportData.topic}!
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
    
    render() {
        return(
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
            
        )
    }
}