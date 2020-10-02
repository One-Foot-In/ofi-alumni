import React, { Component } from 'react';
import {Button, Modal, Input } from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCall } from "../apis";

/*
props:
    - modalOpen: boolean
    - closeModal: ()
    - zoomLink: "https://zoom.us/j/5551112222"
    - id
*/
export default class ZoomUpdateModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            zoomLink: this.props.zoomLink,
            submitting: false
        }
        this.handleChange = this.handleChange.bind(this)
        this.submit = this.submit.bind(this)
    }

    handleChange(e) {
        e.preventDefault();
        let change = {}
        change[e.target.name] = e.target.value
        this.setState(change)
    }

    submit(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                zoomLink: this.state.zoomLink
            }
            try {
                const result = await makeCall(payload, `/alumni/zoomLink/${this.props.id}`, 'patch')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error updating your zoom link, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your zoom link was successfully updated!",
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
                    console.log("Error: ZoomUpdateModal#submit", e);
                })
            }
        })
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Enter your zoom meeting link</Modal.Header>
                <Modal.Content>
                    <Input
                        style={{width: '80%'}}
                        label='Zoom Meeting Link'
                        placeholder='https://zoom.us/j/1234567890'
                        value={this.state.zoomLink}
                        name='zoomLink'
                        onChange={this.handleChange}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        disabled={this.props.zoomLink === this.state.zoomLink || this.state.submitting} 
                        loading={this.state.submitting}
                        onClick={this.submit}
                    >
                        Submit
                    </Button>
                    <Button onClick={this.props.closeModal}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}