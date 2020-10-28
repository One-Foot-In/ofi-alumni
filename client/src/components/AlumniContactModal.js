import React, { Component } from 'react';
import {Button, Modal, Image, Grid, Form } from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCall } from "../apis";

/*
DETAILS: Modal for starting/ updating a conversation between alumni
props:
    - userDetails: logged in user profile
    - role: user role
    - modalOpen: boolean
    - closeModal: ()
    - alumni (contains all data from alumni schema)
    - id
*/
export default class AlumniContactModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            alumni: null,
            message: '',
            submitting: false
        }
        this.handleValueChange = this.handleValueChange.bind(this)
        this.submitRequest = this.submitRequest.bind(this)
    }

    UNSAFE_componentWillMount() {
        this.setState({
            alumni: this.props.alumni, 
        })
    }

    submitRequest(e) {
        e.preventDefault()
        
        this.setState({
            submitting: true
        }, async () => {
            try {
                const senderId = this.props.userDetails._id
                const payload = {
                    senderId: senderId,
                    recipientId: this.state.alumni._id,
                    message: this.state.message,
                }
                const result = await makeCall(payload, '/conversations/add', 'post');
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error sending your message, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your message had been sent! You can see it in the networking tab.",
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
                <Modal.Header>Start a conversation with {this.state.alumni.name}!</Modal.Header>
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
                                    <Form.TextArea 
                                        label={'Send a message to ' + this.state.alumni.name + ':'}
                                        placeholder='Write a message that will be visible in the networking tab'
                                        onChange={this.handleValueChange}
                                        value={this.state.message}
                                        name='message'
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
                        disabled={this.state.message === '' || this.state.submitting}
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
