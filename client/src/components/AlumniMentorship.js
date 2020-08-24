import React, { Component } from 'react';
import { Message, Form, Modal, Menu, Label, Card, Grid, Image, List, Button, Header, Segment } from 'semantic-ui-react';
import { makeCall } from '../apis'
import swal from 'sweetalert'
import TopicPreferencesModal from './TopicPreferencesModal'
import TimePreferencesModal from './TimePreferencesModal'
import ZoomUpdateModal from './ZoomUpdateModal'

export const timeSlotOptions = [
    '12am - 1am',
    '1am - 2am',
    '2am - 3am',
    '3am - 4am',
    '4am - 5am',
    '5am - 6am',
    '6am - 7am',
    '7am - 8am',
    '8am - 9am',
    '9am - 10am',
    '10am - 11am',
    '11am - 12pm',
    '12p - 1pm',
    '1pm - 2pm',
    '2pm - 3pm',
    '3pm - 4pm',
    '4pm - 5pm',
    '5pm - 6pm',
    '6pm - 7pm',
    '7pm - 8pm',
    '8pm - 9pm',
    '9pm - 10pm',
    '10pm - 11pm',
    '11pm - 12am'
]

export const timeToSlot = {
    0: '(12am - 1am)',
    100: '(1am - 2am)',
    200: '(2am - 3am)',
    300: '(3am - 4am)',
    400: '(4am - 5am)',
    500: '(5am - 6am)',
    600: '(6am - 7am)',
    700: '(7am - 8am)',
    800: '(8am - 9am)',
    900: '(9am - 10am)',
    1000: '(10am - 11am)',
    1100: '(11am - 12pm)',
    1200: '(12pm - 1pm)',
    1300: '(1pm - 2pm)',
    1400: '(2pm - 3pm)',
    1500: '(3pm - 4pm)',
    1600: '(4pm - 5pm)',
    1700: '(5pm - 6pm)',
    1800: '(6pm - 7pm)',
    1900: '(7pm - 8pm)',
    2000: '(8pm - 9pm)',
    2100: '(9pm - 10pm)',
    2200: '(10pm - 11pm)',
    2300: '(11pm - 12am)',
}

const ALUMNI = 'ALUMNI'

/*
 * DETAILS:
 * Parent component, contains menu and switches out active RequestCards
 * PROPS
 * userDetails - full profile of logged in user
 */
export default class AlumniMentorship extends Component {
    constructor(props){
        super(props)
        this.state={
            activeItem: 'unconfirmed',
            unconfirmed: [],
            confirmed: [],
            completed: [],
            timeOffset: 0,
            confirmedTimes: [],
            userDetails: null,
            timePreferencesModalOpen: false,
            topicPreferencesModalOpen: false,
            zoomUpdateOpen: false
        }
        this.handleStatusUpdate = this.handleStatusUpdate.bind(this)
        this.openTimePreferencesModal = this.openTimePreferencesModal.bind(this)
        this.closeTimePreferencesModal = this.closeTimePreferencesModal.bind(this)
        this.openTopicPreferencesModal = this.openTopicPreferencesModal.bind(this)
        this.closeTopicPreferencesModal = this.closeTopicPreferencesModal.bind(this)
        this.openZoomUpdateModal = this.openZoomUpdateModal.bind(this)
        this.closeZoomUpdateModal = this.closeZoomUpdateModal.bind(this)
    }

    closeTimePreferencesModal() {
        this.setState({
            timePreferencesModalOpen: false
        }, () => {
            this.props.refreshProfile(ALUMNI, this.props.userDetails._id)
        })
    }
    openTimePreferencesModal() {
        this.setState({
            timePreferencesModalOpen: true
        })
    }
    closeTopicPreferencesModal() {
        this.setState({
            topicPreferencesModalOpen: false
        }, () => {
            this.props.refreshProfile(ALUMNI, this.props.userDetails._id)
        })
    }
    openTopicPreferencesModal() {
        this.setState({
            topicPreferencesModalOpen: true
        })
    }
    closeZoomUpdateModal() {
        this.setState({
            zoomUpdateOpen: false
        }, () => {
            this.props.refreshProfile(ALUMNI, this.props.userDetails._id)
        })
    }
    openZoomUpdateModal() {
        this.setState({
            zoomUpdateOpen: true
        })
    }
    
    async handleStatusUpdate(requests) {
        if (requests.requests === []) return;
        let confirmedTimes = await this.populateConfirmedTimes(requests.requests[1])
        this.setState({
            unconfirmed: requests.requests[0],
            confirmed: requests.requests[1],
            completed: requests.requests[2],
            confirmedTimes: confirmedTimes,
        })
    }

    async UNSAFE_componentWillMount() {
        let timeOffset = this.props.userDetails.timeZone
        let requests = await this.getRequests(timeOffset)
        let confirmedTimes = await this.populateConfirmedTimes(requests.requests[1])
        this.setState({
            timeOffset: timeOffset,
            unconfirmed: requests.requests[0],
            confirmed: requests.requests[1],
            completed: requests.requests[2],
            confirmedTimes: confirmedTimes
        })
    }

    getRequests(timeOffset) {
        return makeCall({}, '/request/getRequests/'+this.props.userDetails._id+'/'+timeOffset, 'get')
    }

    populateConfirmedTimes(requests) {
       return requests.map(confirmedRequest => {
            return (confirmedRequest.time[0].id)
        })
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    render() {
        let details = this.props.userDetails
        let availabilities = details.availabilities;
        let topics = details.topics;
        let zoomLink = details.zoomLink;
        availabilities = availabilities.map(timeSlot => {
            timeSlot.text = `${timeSlot.day} ${timeToSlot[timeSlot.time]}`
            return timeSlot
        })

        const timeAvailabilitiesUpdate = (
            <>
            <Button
                primary
                style={{'margin-right': '5px'}}
                compact
                floated='right'
                color="blue"
                onClick={this.openTimePreferencesModal}
            >
                Update Times
            </Button>
            <TimePreferencesModal
                modalOpen={this.state.timePreferencesModalOpen}
                timePreferences={availabilities || []}
                closeModal={this.closeTimePreferencesModal}
                id={details._id}
            />
            </>
        )

        const topicAvailabilitiesUpdate = (
            <>
            <Button
                primary
                style={{'margin-left': '2px'}}
                compact
                floated='right'
                color="blue"
                onClick={this.openTopicPreferencesModal}
            >
                Update Topics
            </Button>
            <TopicPreferencesModal
                modalOpen={this.state.topicPreferencesModalOpen}
                topicPreferences={topics || []}
                closeModal={this.closeTopicPreferencesModal}
                id={details._id}
            />
            </>
        )

        const zoomLinkUpdate = (
            <>
             <Button
                primary
                style={{'margin-right': '5px'}}
                floated='right'
                color="blue"
                compact
                onClick={this.openZoomUpdateModal}
            >
                Update Video Meeting Link
            </Button>
            <ZoomUpdateModal
                modalOpen={this.state.zoomUpdateOpen}
                zoomLink={zoomLink || ''}
                closeModal={this.closeZoomUpdateModal}
                id={details._id}
            />
            </>
        )

        let topicListItems = []
        for (let topic of details.topics) {
            topicListItems.push(
                <List.Item key={topic}>{topic}</List.Item>
            )
        }

        const timeDisplay = availabilities.map(time => {
            return (
            <Label
                key={time.text}
                style={{'margin': '2px'}}
            >
                {time.text}
            </Label>
            )
        })

        return(
            <div>
            <Menu secondary stackable>
                <Menu.Item
                    id='unconfirmed'
                    name='Unconfirmed Meetings'
                    active={this.state.activeItem === 'unconfirmed'}
                    onClick={this.handleMenuClick}
                >
                    Unconfirmed Meetings
                    {   (this.state.unconfirmed !== []) &&
                        <Label color='teal'>{this.state.unconfirmed.length}</Label>
                    }
                </Menu.Item>
                <Menu.Item
                    id='confirmed'
                    name='Confirmed Meetings'
                    active={this.state.activeItem === 'confirmed'}
                    onClick={this.handleMenuClick}
                >
                    Confirmed Meetings
                    {   (this.state.confirmed !== []) &&
                        <Label color='teal'>{this.state.confirmed.length}</Label>
                    }
                </Menu.Item>
                <Menu.Item
                    id='completed'
                    name='Completed Meetings'
                    active={this.state.activeItem === 'completed'}
                    onClick={this.handleMenuClick}
                />
                <Menu.Item 
                    id='settings'
                    name='Meeting Settings'
                    active={this.state.activeItem === 'settings'}
                    onClick={this.handleMenuClick}
                />
            </Menu>
            {this.state.activeItem === 'unconfirmed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <RequestCards 
                        confirmedTimes={this.state.confirmedTimes}
                        activeSet={this.state.activeItem}
                        requests={this.state.unconfirmed}
                        liftRequests={this.handleStatusUpdate}
                        timeOffset={this.state.timeOffset}
                        userId={this.props.userDetails._id}
                    />
                </div>
            }
            {this.state.activeItem === 'confirmed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <RequestCards 
                        activeSet={this.state.activeItem}
                        requests={this.state.confirmed}
                        liftRequests={this.handleStatusUpdate}
                        timeOffset={this.state.timeOffset}
                        userId={this.props.userDetails._id}
                    />
                </div>
            }
            {this.state.activeItem === 'completed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <RequestCards 
                        liftRequests={this.handleStatusUpdate}
                        userId={this.props.userDetails._id}
                        timeOffset={this.state.timeOffset}
                        activeSet={this.state.activeItem}
                        requests={this.state.completed}
                    />
                </div>
            }
            {this.state.activeItem ==='settings' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <Segment>
                        <Grid verticalAlign='middle' divided={'vertically'}>
                            <Grid.Row columns={'equal'}>
                                <Grid.Column>
                                    <Header as='h3'> Current Meeting Link:</Header>
                                    {details.zoomLink}
                                </Grid.Column>
                                <Grid.Column width={4} verticalAlign={'top'}>
                                    {zoomLinkUpdate}
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={'equal'}>
                                <Grid.Column width={6}>
                                    <Header as='h3'> Current Topic Availabilities:</Header>
                                    <List divided bulleted>{topicListItems}</List>
                                </Grid.Column>
                                <Grid.Column></Grid.Column>
                                <Grid.Column width={4} verticalAlign={'top'}>
                                    {topicAvailabilitiesUpdate}
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={'equal'}>
                                <Grid.Column>
                                <Header as='h3'> Current Time Availabilities:</Header>
                                    {timeDisplay}
                                </Grid.Column>
                                <Grid.Column width={4} verticalAlign={'top'}>
                                    {timeAvailabilitiesUpdate}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Segment>
                </div>
            }
            </div>
        )
    }
}


/*
 * DETAILS
 * Child component - takes array of requests, constructs display
 *                   shows valid actions for a given set
 * PROPS
 * Always:
 * activeSet (string) - Shows what set is currently being used
 * requests - array of relevant requests
 * 
 * Sometimes:
 * userId - mongo ID for profile (used to update records)
 * liftRequests (method) - lifts results of an update to parent component
 * timeOffset
 * confirmedTimes - array of meeting times that have already been confirmed
 *                  used to disable approval, preventing double booking
 */
class RequestCards extends Component {
    state={
        requests: [],
        display: [],
        showFeedbackModal: false,
        showAlumniNoteModal: false,
        requestDetails: null,
        finalNote: '',
        alumniNote: ''
    }
    // This allows the component to update its state should a prop value change
    async UNSAFE_componentWillReceiveProps({requests}) {
        await this.setState({requests: requests})
        this.constructDisplay(this.state.requests)
    }
    // This ensures that the component doesn't use an old prop on menu change
    UNSAFE_componentWillMount() {
        this.constructDisplay(this.props.requests)
    }

    constructRequest(request) {
        const cardHeader = (this.props.activeSet !== 'completed'? 'Meeting requested by: ' : 'Completed call with: ')
        return (
            <Grid key={request._id} columns={'equal'}>
            <Grid.Row columns={2}>
                <Grid.Column width={4}>
                    <Image
                        size='small'
                        centered
                        rounded
                        src={request.student.imageURL}
                    />
                </Grid.Column>
                <Grid.Column>
                    <Card fluid>
                        <Card.Content>
                            <Card.Header>
                                {cardHeader} {request.student.name}
                            </Card.Header>           
                            <Card.Meta>{request.status}</Card.Meta>
                            <Card.Description><b>Topic:</b> {request.topic}</Card.Description>
                            <Card.Description><b>Time:</b> {request.time[0].day} from {timeSlotOptions[request.time[0].time/100]}</Card.Description>
                            { request.studentNote &&
                                <Card.Description><b>Note from student:</b> {request.studentNote}</Card.Description>
                            }
                            { request.alumniNote &&
                                <Card.Description><b>Your pre-meeting note:</b> {request.alumniNote}</Card.Description>
                            }
                            { request.finalNote &&
                                <Card.Description><b>Your final note:</b> {request.finalNote}</Card.Description>
                            }
                            { request.publicFeedback &&
                                <Card.Description><b>Feedback for you:</b> {request.publicFeedback}</Card.Description>
                            }
                            <br />
                        </Card.Content>
                        {this.buttonDisplay(request)}
                    </Card>
                </Grid.Column>
            </Grid.Row>
            </Grid>
        )
    }

    buttonDisplay(request) {
        if (this.props.activeSet === 'unconfirmed') {
            let disableApprove = this.props.confirmedTimes.includes(request.time[0].id)
            return (
                <Button.Group>
                    <Button
                        positive
                        requestid={request._id}
                        newstatus={'Confirmed'}
                        onClick={this.handleClick.bind(this)}
                        disabled={disableApprove}
                    >
                        Approve
                    </Button>
                    <Button
                        negative
                        requestid={request._id}
                        newstatus={'Rejected'}
                        onClick={this.handleClick.bind(this)}
                    >
                        Reject
                    </Button>
                </Button.Group>
            )
        } else if (this.props.activeSet === 'confirmed') {
            return(
                <>
                {!request.alumniNote && 
                    <Button
                        color='standard'
                        onClick={this.toggleAlumniNoteModal.bind(this)}
                        requestid={request._id}
                    >
                        Leave a pre-meeting note
                    </Button>
                }
                    
                <Button.Group compact>
                    <Button 
                        color='blue' 
                        as='a'
                        href={request.zoomLink} 
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Join Call
                    </Button>
                    <Button 
                        positive
                        requestid={request._id}
                        newstatus={'Completed'}
                        onClick={this.handleClick.bind(this)}
                    >
                        Mark Completed!
                    </Button>
                </Button.Group>
                </>
            )
        } else if (this.props.activeSet === 'completed' && !request.finalNote) {
            return(
                <Button
                    color='teal'
                    requestId={request._id}
                    onClick={this.toggleFeedbackModal.bind(this)}
                >
                    Leave a note!
                </Button>
            )
        }
    }

    async handleClick(e) {
        let requests = await makeCall({
                requestId: e.currentTarget.getAttribute('requestid'),
                newStatus: e.currentTarget.getAttribute('newstatus')
            }, '/request/updateRequest/' + this.props.userId + '/' + this.props.timeOffset, 'patch');
        if (!requests || requests.error) {
            swal({
                title: "Error!",
                text: "There was an error updating this request, please try again.",
                icon: "error",
            });
        } else {
            swal({
                title: "Done!",
                text: "Successfully updated this request!",
                icon: "success"
            }).then(() => {
                this.props.liftRequests(requests)
            })
        }
    }

    toggleFeedbackModal(e) {
        let requestDetails = this.props.requests.find(request => request._id === e.currentTarget.getAttribute('requestid'))
        let finalNote = null
        if (requestDetails) {
            finalNote = requestDetails.finalNote
        }
        this.setState({
            showFeedbackModal: !this.state.showFeedbackModal,
            requestDetails: requestDetails,
            finalNote: finalNote
        })
    }

    toggleAlumniNoteModal(e) {
        let requestDetails = this.props.requests.find(request => request._id === e.currentTarget.getAttribute('requestid'))
        let alumniNote = null
        if (requestDetails) {
            alumniNote = requestDetails.alumniNote
        }
        this.setState({
            showAlumniNoteModal: !this.state.showAlumniNoteModal,
            requestDetails: requestDetails,
            alumniNote: alumniNote
        })
    }

    async submitAlumniNote(e) {
        let requests = await makeCall({
            requestId: this.state.requestDetails._id,
            alumniNote: this.state.alumniNote
        }, `/request/leaveAlumniNote/${this.props.userId}/${this.props.timeOffset}`, 'patch')
        this.setState({showAlumniNoteModal: !this.state.showAlumniNoteModal})
        this.props.liftRequests(requests)
    }


    async submitFinalNote(e) {
        let requests = await makeCall({
            requestId: this.state.requestDetails._id,
            finalNote: this.state.finalNote
        }, `/request/leaveFinalNote/${this.props.userId}/${this.props.timeOffset}`, 'patch')
        this.setState({showFeedbackModal: !this.state.showFeedbackModal})
        this.props.liftRequests(requests)
    }

    handleValueChange(e, {name, value}) {
        e.preventDefault();
        this.setState({
            [name]: value
        })
    }

    constructDisplay(requests) {
        let display = []
        for (let request of requests) {
            display.push(this.constructRequest(request))
        }
        this.setState({display: display})
    }

    render() {
        return(
            <>
            {this.state.showFeedbackModal && 
                <Modal open={this.state.showFeedbackModal}>
                    <Modal.Header>Leave a final note for {this.state.requestDetails.student.name}</Modal.Header>
                    <Modal.Content>
                    <Grid stackable>
                        <Grid.Row columns={"equal"}>
                            <Grid.Column width={4}>
                                <Image
                                    floated='left'
                                    size='small'
                                    src={this.state.requestDetails.student.imageURL}
                                    rounded
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Form>
                                    <Form.TextArea 
                                        label={'Leave a note for ' + this.state.requestDetails.student.name + ':'}
                                        placeholder='Provide a recap or leave any other useful notes here!'
                                        onChange={this.handleValueChange.bind(this)}
                                        value={this.state.finalNote}
                                        name='finalNote'
                                    />
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.toggleFeedbackModal.bind(this)}>
                            Done
                        </Button>
                        <Button onClick={this.submitFinalNote.bind(this)} disabled={!this.state.finalNote} primary>
                            Submit
                        </Button>
                    </Modal.Actions>
                </Modal>
            }
            {this.state.showAlumniNoteModal &&
                <Modal open={this.state.showAlumniNoteModal}>
                    <Modal.Header>Leave a pre-meeting note for {this.state.requestDetails.student.name}</Modal.Header>
                    <Modal.Content>
                    <Grid stackable>
                        <Grid.Row columns={"equal"}>
                            <Grid.Column width={4}>
                                <Image
                                    floated='left'
                                    size='small'
                                    src={this.state.requestDetails.student.imageURL}
                                    rounded
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Form>
                                    <Form.TextArea 
                                        label={'Leave a note for ' + this.state.requestDetails.student.name + ':'}
                                        placeholder='Include useful readings and other useful preparations here!'
                                        onChange={this.handleValueChange.bind(this)}
                                        value={this.state.alumniNote}
                                        name='alumniNote'
                                    />
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.toggleFeedbackModal.bind(this)}>
                            Done
                        </Button>
                        <Button onClick={this.submitAlumniNote.bind(this)} disabled={!this.state.alumniNote} primary>
                            Submit
                        </Button>
                    </Modal.Actions>
                </Modal>
            }
            {!this.state.display.length &&
                <Message info>
                <Message.Header>No {this.props.activeSet} meetings!</Message.Header>
                {
                    this.props.activeSet === 'unconfirmed' &&
                    <Message.Content>Check back later!</Message.Content>
                }
                {
                    this.props.activeSet === 'confirmed' &&
                    <Message.Content>Confirm requests in the unconfirmed meetings tab!</Message.Content>
                }
                </Message>
            }
            {this.state.display}
            </>
        )
    }
}