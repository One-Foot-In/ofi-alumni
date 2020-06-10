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
 * Parent component, contains menu and switches out active RequestCards
 * PROPS
 * userDetails - full profile of logged in user
 */
export default class RequestsView extends Component {
    constructor(props){
        super(props)
        this.state={
            activeItem: 'unconfirmed',
            unconfirmed: [],
            confirmed: [],
            completed: [],
            timeOffset: 0,
            confirmedTimes: []
        }
        this.handleStatusUpdate = this.handleStatusUpdate.bind(this)
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

    async componentWillMount() {
        let timeOffset = (-(new Date().getTimezoneOffset())/60)*100
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
        return(
            <div>
            <Menu secondary>
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
                        activeSet={this.state.activeItem}
                        requests={this.state.completed}
                    />
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
        display: []
    }
    // This allows the component to update its state should a prop value change
    async componentWillReceiveProps({requests}) {
        await this.setState({requests: requests})
        this.constructDisplay(this.state.requests)
    }
    // This ensures that the component doesn't use an old prop on menu change
    componentWillMount() {
        this.constructDisplay(this.props.requests)
    }

    constructRequest(request) {
        return (
            <Grid key={request._id}>
            <Grid.Row columns={2}>
                <Grid.Column width={4}>
                    <Image
                        size='small'
                        centered
                        rounded
                        src={request.requesterObj.imageURL}
                    />
                </Grid.Column>
                <Grid.Column>
                    <Card fluid>
                        <Card.Content>
                            <Card.Header>
                                Request From: {request.requesterObj.name}
                            </Card.Header>           
                            <Card.Meta>{request.status}</Card.Meta>
                            <Card.Description>Topic: {request.topic}</Card.Description>
                            <Card.Description>Time: {request.time[0].day} from {timeSlotOptions[request.time[0].time/100]}</Card.Description>
                            <Card.Description>Note from requester: {request.note}</Card.Description>
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
                        Approve meeting
                    </Button>
                    <Button
                        negative
                        requestid={request._id}
                        newstatus={'Rejected'}
                        onClick={this.handleClick.bind(this)}
                    >
                        Reject meeting
                    </Button>
                </Button.Group>
            )
        } else if (this.props.activeSet === 'confirmed') {
            return(
                <Button.Group>
                    <Button 
                        color='blue' 
                        as='a'
                        href={request.zoomLink} 
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Join Video Call
                    </Button>
                    <Button 
                        positive
                        requestid={request._id}
                        newstatus={'Completed'}
                        onClick={this.handleClick.bind(this)}
                    >
                        Mark as completed!
                    </Button>
                </Button.Group>
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
            })
            this.props.liftRequests(requests)
        }
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
            {this.state.display}
            </>
        )
    }
}