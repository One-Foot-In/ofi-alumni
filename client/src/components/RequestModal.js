import React, { Component } from 'react';
import {Button, Modal, Image, Grid, Form } from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCall } from "../apis";


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
const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']


/*
props:
    - userDetails: logged in user profile
    - role: user role
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
            timeOffset: null,
            availabilityOptions: [],
            availabilityValue: '',
            topicOptions: [],
            topicValue: '',
            note: '',
            submitting: false
        }
        this.handleValueChange = this.handleValueChange.bind(this)
        this.submitRequest = this.submitRequest.bind(this)
        this.isSubmitReady = this.isSubmitReady.bind(this)
    }

    async UNSAFE_componentWillMount() {
        await this.setState({
            alumni: this.props.alumni, 
            timeOffset: this.props.userDetails.timeZone
        })
        this.createAvailabilityOptions(this.state.alumni.availabilities)
        this.createTopicOptions(this.state.alumni.topics)
    }

    // Gets availability slots, adjusts for timezone, removes existing
    // confirmed requests, and then sorts them
    async createAvailabilityOptions(availabilities) {
        let adjustedAvailabilities = await makeCall({availabilities: availabilities,
                                                    offset: parseInt(this.state.timeOffset)}, 
                                                    '/request/applyRequesterTimezone', 
                                                    'patch')
        let confirmedTimes = await makeCall({}, '/request/getConfirmed/'+this.state.alumni._id+'/'+this.state.timeOffset, 'get')
        confirmedTimes = confirmedTimes.confirmed.map(confirmedRequest => {
            return confirmedRequest.time[0].id
        })
        let availabilityOptions = []
        for (let option of adjustedAvailabilities.availabilities) {
            if (!confirmedTimes.includes(option.id)) {
                let readableOption = option.day + ', ' + timeSlotOptions[(option.time/100)]
                availabilityOptions.push({
                    day: option.day,
                    time: option.time,
                    key: option.id,
                    text: readableOption,
                    value: option.id,
                })
            }
        }
        availabilityOptions = availabilityOptions.sort((a, b) => {
            let valueA = (10000 * dayOptions.indexOf(a.day)) + parseInt(a.time)
            let valueB = (10000 * dayOptions.indexOf(b.day)) + parseInt(b.time)
            return valueA - valueB
        })
        this.setState({availabilityOptions: availabilityOptions})
    }

    createTopicOptions(topics) {
        let topicOptions = []
        for (let topic of topics) {
            topicOptions.push({
                key: topic,
                text: topic,
                value: topic  
            })
        }
        this.setState({topicOptions: topicOptions})
    }

    submitRequest(e) {
        e.preventDefault()
        
        this.setState({
            submitting: true
        }, async () => {
            try {
                const requesterId = this.props.userDetails._id
                let timeOffset = parseInt(this.state.timeOffset)
                const payload = {
                    requesterId: requesterId,
                    mentorId: this.state.alumni._id,
                    zoomLink: this.state.alumni.zoomLink,
                    timeId: this.state.availabilityValue,
                    topic: this.state.topicValue,
                    note: this.state.note,
                    timezone: timeOffset
                }
                const result = await makeCall(payload, `/request/addRequest/`, 'post')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error submitting your request, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "You have successfully submitted your request!",
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

    isSubmitReady() {
        return this.state.topicValue || this.state.note
    }

    handleValueChange(e, {name, value}) {
        e.preventDefault();
        this.setState({
            [name]: value
        })
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Schedule a meeting with {this.state.alumni.name}!</Modal.Header>
                <Modal.Content>
                    <Grid stackable>
                        <Grid.Row columns={"equal"}>
                            <Grid.Column width={4}>
                                <Image
                                    floated='left'
                                    size='small'
                                    src={this.state.alumni.imageURL}
                                    rounded
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Form>
                                    <Form.Dropdown 
                                        label='Choose an availability:'
                                        placeholder='Day of the Week, Time'
                                        fluid
                                        selection
                                        search
                                        options={this.state.availabilityOptions} 
                                        onChange={this.handleValueChange}
                                        value={this.state.availabilityValue}
                                        noResultsMessage='No availabilities posted. You can still request a call!'
                                        name='availabilityValue'
                                    />
                                    <Form.Dropdown
                                        label={'Choose a topic offered by ' + this.state.alumni.name + ':'}
                                        placeholder='Topic'
                                        fluid
                                        selection
                                        search
                                        options={this.state.topicOptions} 
                                        onChange={this.handleValueChange}
                                        value={this.state.topicValue}
                                        noResultsMessage='No topics posted. You can still request a call!'
                                        name='topicValue'
                                    />
                                    <Form.TextArea 
                                        label={'Leave a note for ' + this.state.alumni.name + ':'}
                                        placeholder='Provide extra information here'
                                        onChange={this.handleValueChange}
                                        value={this.state.note}
                                        name='note'
                                    />
                                </Form>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        onClick={this.submitRequest}
                        disabled={!this.isSubmitReady() || this.state.submitting}
                        loading={this.state.submitting}
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
