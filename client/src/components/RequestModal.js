import React, { Component } from 'react';
import {Button, Modal, Segment, Header, Dropdown, Image, Grid} from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCall } from "../apis";

const dayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    .map(day => {
        return {
            key: day.toLowerCase(),
            text: day,
            value: day
        }
    })
export const timeSlotOptions = [
    {
        key: 'slot1',
        value: 0,
        text: '12am - 1am'
    },
    {
        key: 'slot2',
        value: 100,
        text: '1am - 2am'
    },
    {
        key: 'slot3',
        value: 200,
        text: '2am - 3am'
    },
    {
        key: 'slot4',
        value: 300,
        text: '3am - 4am'
    },
    {
        key: 'slot5',
        value: 400,
        text: '4am - 5am'
    },
    {
        key: 'slot6',
        value: 500,
        text: '5am - 6am'
    },
    {
        key: 'slot7',
        value: 600,
        text: '6am - 7am'
    },
    {
        key: 'slot8',
        value: 700,
        text: '7am - 8am'
    },
    {
        key: 'slot9',
        value: 800,
        text: '8am - 9am'
    },
    {
        key: 'slot10',
        value: 900,
        text: '9am - 10am'
    },
    {
        key: 'slot11',
        value: 1000,
        text: '10am - 11am'
    },
    {
        key: 'slot12',
        value: 1100,
        text: '11am - 12pm'
    },
    {
        key: 'slot13',
        value: 1200,
        text: '12p - 1pm'
    },
    {
        key: 'slot14',
        value: 1300,
        text: '1pm - 2pm'
    },
    {
        key: 'slot15',
        value: 1400,
        text: '2pm - 3pm'
    },
    {
        key: 'slot16',
        value: 1500,
        text: '3pm - 4pm'
    },
    {
        key: 'slot17',
        value: 1600,
        text: '4pm - 5pm'
    },
    {
        key: 'slot18',
        value: 1700,
        text: '5pm - 6pm'
    },
    {
        key: 'slot19',
        value: 1800,
        text: '6pm - 7pm'
    },
    {
        key: 'slot20',
        value: 1900,
        text: '7pm - 8pm'
    },
    {
        key: 'slot21',
        value: 2000,
        text: '8pm - 9pm'
    },
    {
        key: 'slot22',
        value: 2100,
        text: '9pm - 10pm'
    },
    {
        key: 'slot23',
        value: 2200,
        text: '10pm - 11pm'
    },
    {
        key: 'slot24',
        value: 2300,
        text: '11pm - 12am'
    },
]

/*
props:
    - modalOpen: boolean
    - closeModal: ()
    - alumni (contains all data from alumni schema)
    - id
*/
export default class RequestModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            alumni: null,
            studentId: '',
            options: [],
            value: '',
            topic: '',
            notes: '',
            submitting: false
        }
        this.handleValueChange = this.handleValueChange.bind(this)
        this.submitRequest = this.submitRequest.bind(this)
    }

    async componentWillMount() {
        await this.setState({alumni: this.props.alumni})
        this.createOptions(this.state.alumni.availabilities)
    }

    async createOptions(availabilities) {
        console.log(availabilities)
        /* 
         * Offset is in minutes, annoyingly, and in the opposite direction 
         * that you'd expect. This means that if you are in UTC -4 (EST), 
         * it returns 240 (not -240 to reflect being 4 hours behind)
         * That's why there's a tiny bit of math in the payload, to conform
         * with our date model (which makes more sense)
         */
        let timeOffset = await new Date().getTimezoneOffset()
        console.log(timeOffset)
        console.log(this.props.alumni.timeZone)
        let adjustedAvailabilities = await makeCall({availabilities: availabilities,
                                                    offset: (-(timeOffset/60)*100)}, 
                                                    '/request/applyRequesterTimezone', 
                                                    'patch')
        console.log(adjustedAvailabilities)
        this.setState({options: adjustedAvailabilities})
    }

    submitRequest(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            try {
                const result = true;
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error updating your time preferences, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your time preferences were successfully updated!",
                            icon: "success",
                        }).then(() => {
                            this.props.closeModal();
                        })
                    })
                    
                }
            } catch (e) {
                this.setState({
                    submitting: false
                }, () => {
                    console.log("Error: RequestModal#makeRequest", e);
                })
            }
        })
    }

    handleValueChange(e, {value}) {
        e.preventDefault();
        this.setState({
            value: value
        })
    }


    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Schedule a meeting with {this.state.alumni.name}!</Modal.Header>
                <Modal.Content>
                    <Grid>
                    <Grid.Row columns={"equal"}>
                    <Grid.Column width={3}>
                    <Image
                        floated='left'
                        size='small'
                        src={this.state.alumni.imageURL}
                        rounded
                    />
                    </Grid.Column>
                    <Grid.Column>
                    <Segment fluid>
                        <Header>Choose a day:</Header>
                        
                        <Dropdown
                            style={{ 'margin': '5px'}}
                            placeholder='Day'
                            fluid
                            selection
                            options={this.state.dayOptions} 
                            onChange={this.handleValueChange}
                            value={this.state.day}
                            name='day'
                        />
                    </Segment>
                    </Grid.Column>
                    </Grid.Row>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        onClick={this.submitRequest}
                    >
                        Submit Request
                    </Button>
                    <Button onClick={this.props.closeModal}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}