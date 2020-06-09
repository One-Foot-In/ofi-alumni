import React, { Component } from 'react';
import { Menu, Label, Card, Grid, Image, Button, Segment } from 'semantic-ui-react';
import { makeCall } from '../apis'

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

export default class RequestsView extends Component {
    constructor(props){
        super(props)
        this.state={
            activeItem: 'unconfirmed',
            unconfirmed: [],
            confirmed: [],
            completed: [],
            timeOffset: 0,
        }
        this.handleStatusUpdate = this.handleStatusUpdate.bind(this)
    }
    
    handleStatusUpdate(requests) {
        if (requests.requests === []) return;
        this.setState({
            unconfirmed: requests.requests[0],
            confirmed: requests.requests[1],
            completed: requests.requests[2]
        })
    }

    async componentWillMount() {
        let timeOffset = (-(new Date().getTimezoneOffset())/60)*100
        let requests = await this.getRequests(timeOffset)
        this.setState({
            timeOffset: timeOffset,
            unconfirmed: requests.requests[0],
            confirmed: requests.requests[1],
            completed: requests.requests[2]
        })
    }

    getRequests(timeOffset) {
        return makeCall({}, '/request/getRequests/'+this.props.userDetails._id+'/'+timeOffset, 'get')
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
                        liftRequests={this.handleStatusUpdate}
                        timeOffset={this.state.timeOffset}
                    />
                </div>
            }
            </div>
        )
    }
}

class RequestCards extends Component {
    state={
        requests: [],
        display: []
    }
    // This allows the component to update its state should a prop value change
    async componentWillReceiveProps({requests}) {
        await this.setState({requests: requests})
        this.constructDisplay(this.props.requests)
    }
    // This ensures that the component doesn't use an old prop on menu change
    async componentWillMount() {
        await this.setState({requests: this.props.requests})
        this.constructDisplay(this.props.requests)
    }

    constructRequest(request) {
        return (
            <Grid>
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
            return (
                <Button.Group>
                    <Button
                        positive
                        requestid={request._id}
                        newstatus={'Confirmed'}
                        onClick={this.handleClick.bind(this)}
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
            }, '/request/updateStatus/' + this.props.userId + '/' + this.props.timeOffset, 'patch');
        this.props.liftRequests(requests)
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
            {this.props.activeSet === 'unconfirmed' && 
                <Segment color='blue' inverted tertiary>
                    Before approving a meeting, please make sure you haven't already scheduled
                    another meeting for the same time
                </Segment>
            }
            {this.state.display}
            </>
        )
    }
}