import React, { Component } from 'react';
import { Menu, Label, Card, Grid, Image, Button, Segment } from 'semantic-ui-react';
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
export default class SchedulingsView extends Component {
    constructor(props){
        super(props)
        this.state={
            activeItem: 'confirmed',
            unconfirmed: [],
            confirmed: [],
            completed: [],
            timeOffset: 0,
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

    async componentWillMount() {
        let timeOffset = (-(new Date().getTimezoneOffset())/60)*100
        let schedulings = await this.getSchedulings(timeOffset)
        this.setState({
            timeOffset: timeOffset,
            unconfirmed: schedulings.schedulings[0],
            confirmed: schedulings.schedulings[1],
            completed: schedulings.schedulings[2],
        })
    }

    getSchedulings(timeOffset) {
        return makeCall({}, '/request/getSchedulings/'+this.props.userDetails._id +'/'+ this.props.role +'/' + timeOffset, 'get')
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    render() {
        return(
            <div>
            <Menu secondary>
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
                        userRole={this.props.role}
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
                        userRole={this.props.role}
                    />
                </div>
            }
            {this.state.activeItem === 'completed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <SchedulingCards 
                        activeSet={this.state.activeItem}
                        schedulings={this.state.completed}
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
        display: []
    }
    // This allows the component to update its state should a prop value change
    async componentWillReceiveProps({schedulings}) {
        await this.setState({schedulings: schedulings})
        this.constructDisplay(this.state.schedulings)
    }
    // This ensures that the component doesn't use an old prop on menu change
    componentWillMount() {
        this.constructDisplay(this.props.schedulings)
    }

    constructRequest(scheduling) {
        return (
            <Grid key={scheduling._id}>
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
                                Scheduling With: {scheduling.mentor.name}
                            </Card.Header>           
                            <Card.Meta>{scheduling.status}</Card.Meta>
                            <Card.Description>Topic: {scheduling.topic}</Card.Description>
                            <Card.Description>Time: {scheduling.time[0].day} from {timeSlotOptions[scheduling.time[0].time/100]}</Card.Description>
                            <Card.Description>Your Note: {scheduling.note}</Card.Description>
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
                    Cancel meeting
                </Button>
            )
        } else if (this.props.activeSet === 'confirmed') {
            return(
                <>
                <Button 
                    color='blue' 
                    as='a'
                    href={scheduling.zoomLink} 
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Join Video Call
                </Button>
                <Button.Group>
                    <Button 
                        positive
                        requestid={scheduling._id}
                        newstatus={'Completed'}
                        onClick={this.handleClick.bind(this)}
                    >
                        Mark as completed!
                    </Button>
                    <Button
                        negative
                        requestid={scheduling._id}
                        newstatus={'Rejected'}
                        onClick={this.handleClick.bind(this)}
                    >
                        Cancel meeting
                    </Button>
                </Button.Group>
                </>
            )
        }
    }

    async handleClick(e) {
        let schedulings = await makeCall({
                requestId: e.currentTarget.getAttribute('requestid'),
                newStatus: e.currentTarget.getAttribute('newstatus')
            }, '/request/updateScheduling/' + this.props.userId + '/' + this.props.userRole + '/' + this.props.timeOffset, 'patch');
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
            })
            this.props.liftSchedulings(schedulings)
        }
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
            {this.state.display}
            </>
        )
    }
}