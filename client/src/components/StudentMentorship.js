import React, { Component } from 'react';
import { Modal, Form, Menu, Label, Card, Grid, Image, Button, Message } from 'semantic-ui-react';
import { makeCall } from '../apis'
import swal from 'sweetalert'

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

/*
 * DETAILS:
 * Parent component, contains menu and switches out active SchedulingCards
 * PROPS
 * userDetails - full profile of logged in user
 */
export default class StudentMentorship extends Component {
    constructor(props){
        super(props)
        this.state={
            activeItem: 'confirmed',
            unconfirmed: [],
            confirmed: [],
            completed: [],
            timeOffset: 0,
            userDetails: null
        }
        this.handleStatusUpdate = this.handleStatusUpdate.bind(this)
    }
    
    async handleStatusUpdate(schedulings) {
        if (schedulings.schedulings === []) return;
        this.setState({
            unconfirmed: schedulings.schedulings[0],
            confirmed: schedulings.schedulings[1],
            completed: schedulings.schedulings[2],
        })
    }

    async UNSAFE_componentWillMount() {
        let timeOffset = this.props.userDetails.timeZone
        let schedulings = await this.getSchedulings(timeOffset)
        this.setState({
            timeOffset: timeOffset,
            unconfirmed: schedulings.schedulings[0],
            confirmed: schedulings.schedulings[1],
            completed: schedulings.schedulings[2],
        })
    }
    getSchedulings(timeOffset) {
        return makeCall({}, '/request/getSchedulings/'+ this.props.userDetails._id +'/' + timeOffset, 'get')
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    render() {
        return(
            <div>
            <Menu secondary stackable>
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
                    id='completed'
                    name='Completed Meetings'
                    active={this.state.activeItem === 'completed'}
                    onClick={this.handleMenuClick}
                />
            </Menu>
            {this.state.activeItem === 'confirmed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <SchedulingCards 
                        activeSet={this.state.activeItem}
                        schedulings={this.state.confirmed}
                        liftSchedulings={this.handleStatusUpdate}
                        timeOffset={this.state.timeOffset}
                        userId={this.props.userDetails._id}
                    />
                </div>
            }
            {this.state.activeItem === 'unconfirmed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <SchedulingCards 
                        activeSet={this.state.activeItem}
                        schedulings={this.state.unconfirmed}
                        liftSchedulings={this.handleStatusUpdate}
                        timeOffset={this.state.timeOffset}
                        userId={this.props.userDetails._id}
                    />
                </div>
            }
            {this.state.activeItem === 'completed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <SchedulingCards 
                        activeSet={this.state.activeItem}
                        schedulings={this.state.completed}
                        liftSchedulings={this.handleStatusUpdate}
                        timeOffset={this.state.timeOffset}
                        userId={this.props.userDetails._id}
                    />
                </div>
            }
            </div>
        )
    }
}


/*
 * DETAILS
 * Child component - takes array of schedulings, constructs display
 *                   shows valid actions for a given set
 * PROPS
 * Always:
 * activeSet (string) - Shows what set is currently being used
 * schedulings - array of relevant requests
 * 
 * Sometimes:
 * userId - mongo ID for profile (used to update records)
 * userRole - user's role in the mongoDB
 * liftSchedulings (method) - lifts results of an update to parent component
 * timeOffset
 */
class SchedulingCards extends Component {
    state={
        schedulings: [],
        display: [],
        schedulingDetails: [],
        publicFeedback: '',
        privateFeedback: '',
        testimonial: '',
        showFeedbackModal: false
    }
    // This allows the component to update its state should a prop value change
    async UNSAFE_componentWillReceiveProps({schedulings}) {
        await this.setState({schedulings: schedulings})
        this.constructDisplay(this.state.schedulings)
    }
    // This ensures that the component doesn't use an old prop on menu change
    UNSAFE_componentWillMount() {
        this.constructDisplay(this.props.schedulings)
    }

    constructRequest(scheduling) {
        const cardHeader = (this.props.activeSet !== 'completed'? 'Meeting with: ' : 'Completed call with: ')
        return (
            <Grid key={scheduling._id} columns={'equal'}>
            <Grid.Row columns={2}>
                <Grid.Column width={4}>
                    <Image
                        size='small'
                        centered
                        rounded
                        src={scheduling.mentor.imageURL}
                    />
                </Grid.Column>
                <Grid.Column>
                    <Card fluid>
                        <Card.Content>
                            <Card.Header>
                                {cardHeader} {scheduling.mentor.name}
                            </Card.Header>           
                            <Card.Meta>{scheduling.status}</Card.Meta>
                            <Card.Description><b>Topic:</b> {scheduling.topic}</Card.Description>
                            <Card.Description><b>Time:</b> {scheduling.time[0].day} from {timeSlotOptions[scheduling.time[0].time/100]}</Card.Description>
                            {scheduling.studentNote &&
                                <Card.Description><b>Your Note:</b> {scheduling.studentNote}</Card.Description>
                            }
                            {scheduling.alumniNote &&
                                <Card.Description><b>Pre-meeting note from your mentor:</b> {scheduling.alumniNote}</Card.Description>
                            }
                            {scheduling.finalNote &&
                                <Card.Description><b>Final note from your mentor:</b> {scheduling.finalNote}</Card.Description>
                            }
                            {scheduling.publicFeedback &&
                                <Card.Description><b>Feedback for mentor:</b> {scheduling.publicFeedback}</Card.Description>
                            }
                            {scheduling.privateFeedback &&
                                <Card.Description><b>Your private feedback:</b> {scheduling.privateFeedback}</Card.Description>
                            }
                            {scheduling.testimonial &&
                                <Card.Description><b>Your testimonial:</b> {scheduling.testimonial}</Card.Description>
                            }
                            <br />
                        </Card.Content>
                            {this.buttonDisplay(scheduling)}
                    </Card>
                </Grid.Column>
            </Grid.Row>
            </Grid>
        )
    }

    buttonDisplay(scheduling) {
        if (this.props.activeSet === 'unconfirmed') {
            return (
                <Button
                    fluid
                    negative
                    requestid={scheduling._id}
                    newstatus={'Rejected'}
                    onClick={this.handleClick.bind(this)}
                >
                    Cancel
                </Button>
            )
        } else if (this.props.activeSet === 'confirmed') {
            return(
                <>
                <Button.Group compact>
                    <Button 
                        color='blue' 
                        as='a'
                        href={scheduling.zoomLink} 
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Join Call
                    </Button>
                    <Button
                        negative
                        requestid={scheduling._id}
                        newstatus={'Rejected'}
                        onClick={this.handleClick.bind(this)}
                    >
                        Cancel
                    </Button>
                </Button.Group>
                </>
            )
        } else if (this.props.activeSet === 'completed' && (!scheduling.publicFeedback && !scheduling.privateFeedback && !scheduling.testimonial)) {
            return(
                <Button
                    color='teal'
                    requestid={scheduling._id}
                    onClick={this.toggleFeedbackModal.bind(this)}
                >
                    Provide feedback!
                </Button>
            )
        }
    }

    async handleClick(e) {
        let schedulings = await makeCall({
                requestId: e.currentTarget.getAttribute('requestid'),
                newStatus: e.currentTarget.getAttribute('newstatus')
            }, '/request/updateScheduling/' + this.props.userId + '/' + this.props.timeOffset, 'patch');
        if (!schedulings || schedulings.error) {
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
                this.props.liftSchedulings(schedulings)
            })
        }
    }

    toggleFeedbackModal(e) {
        let schedulingDetails = this.props.schedulings.find(request => request._id === e.currentTarget.getAttribute('requestid'))
        let publicFeedback = null
        let privateFeedback = null
        let testimonial = null
        if (schedulingDetails) {
            publicFeedback = schedulingDetails.publicFeedback
            privateFeedback = schedulingDetails.privateFeedback
            testimonial = schedulingDetails.testimonial
        }
        this.setState({
            showFeedbackModal: !this.state.showFeedbackModal,
            schedulingDetails: schedulingDetails,
            publicFeedback: publicFeedback,
            privateFeedback: privateFeedback,
            testimonial: testimonial
        })
    }

    async submitFinalNote(e) {
        let requests = await makeCall({
            requestId: this.state.schedulingDetails._id,
            publicFeedback: this.state.publicFeedback,
            privateFeedback: this.state.privateFeedback,
            testimonial: this.state.testimonial
        }, `/request/leaveFeedback/${this.props.userId}/${this.props.timeOffset}`, 'patch')
        this.setState({showFeedbackModal: !this.state.showFeedbackModal})
        this.props.liftSchedulings(requests)
    }

    handleValueChange(e, {name, value}) {
        e.preventDefault();
        this.setState({
            [name]: value
        })
    }

    constructDisplay(schedulings) {
        let display = []
        for (let scheduling of schedulings) {
            display.push(this.constructRequest(scheduling))
        }
        this.setState({display: display})
    }

    render() {
        return(
            <>
            {this.state.showFeedbackModal &&
                <Modal open={this.state.showFeedbackModal}>
                    <Modal.Header>Provide feedback for {this.state.schedulingDetails.mentor.name}</Modal.Header>
                    <Modal.Content>
                    <Grid stackable>
                        <Grid.Row columns={"equal"}>
                            <Grid.Column width={4}>
                                <Image
                                    floated='left'
                                    size='small'
                                    src={this.state.schedulingDetails.mentor.imageURL}
                                    rounded
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Form>
                                    <Form.TextArea 
                                        label={'Leave a note for ' + this.state.schedulingDetails.mentor.name + ':'}
                                        placeholder={`How was your mentor able to help you? Is there something the mentor could do to be more helpful? (${this.state.schedulingDetails.mentor.name} will be able to see this)`}
                                        onChange={this.handleValueChange.bind(this)}
                                        value={this.state.publicFeedback}
                                        name='publicFeedback'
                                    />
                                    <Form.TextArea 
                                        label={'Leave an anonymous review for ' + this.state.schedulingDetails.mentor.name + ':'}
                                        placeholder={`(Only you and OFI admins will be able to see this)`}
                                        onChange={this.handleValueChange.bind(this)}
                                        value={this.state.privateFeedback}
                                        name='privateFeedback'
                                    />
                                    <Form.TextArea 
                                        label={'Leave a testimonial for ' + this.state.schedulingDetails.mentor.name + ':'}
                                        placeholder={`If you think that your mentor did an outstanding job, leave a note here to share with the community!`}
                                        onChange={this.handleValueChange.bind(this)}
                                        value={this.state.testimonial}
                                        name='testimonial'
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
                        <Button onClick={this.submitFinalNote.bind(this)} primary disabled={!this.state.publicFeedback && !this.state.privateFeedback}>
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
                    <Message.Content>Make new schedulings in the alumni directory!</Message.Content>
                }
                {
                    this.props.activeSet === 'confirmed' &&
                    <Message.Content>Check back later!</Message.Content>
                }
                </Message>
            }
            {this.state.display}
            </>
        )
    }
}