import React, { Component } from 'react';
import { Button, Modal, Step } from 'semantic-ui-react';
import PooledMultiSelectDropdown from "./PooledMultiSelectDropdown"
import swal from "sweetalert";
import { makeCall } from "../apis";

/*
props:
    - role: string
    - modalOpen: boolean
    - closeModal: ()
    - interests: []
    - id
*/
export default class InterestsUpdateModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            existingInterests: [],
            newInterests: [],
            submitting: false
        }
        this.handleChange = this.handleChange.bind(this)
        this.getInterestsInput = this.getInterestsInput.bind(this)
        this.submit = this.submit.bind(this)
        this.clearState = this.clearState.bind(this)
    }

    clearState() {
        this.setState({
            existingInterests: [],
            newInterests: []
        })
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
                newInterests: this.state.newInterests,
                existingInterests: this.state.existingInterests
            }
            try {
                const result = await makeCall(payload, `/${this.props.role}/interests/add/${this.props.id}`, 'patch')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error adding your interests, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your interests have been successfully added!",
                            icon: "success",
                        }).then(() => {
                            this.clearState();
                            this.props.closeModal();
                        })
                    })
                    
                }
            } catch (e) {
                this.setState({
                    submitting: false
                }, () => {
                    console.log("Error: InterestsUpdateModal#submit", e);
                })
            }
        })
    }

    getInterestsInput(selection) {
        this.setState({
            existingInterests: selection.old,
            newInterests: selection.new,
        })
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Update your interests</Modal.Header>
                <Modal.Content>
                <Step.Group>
                <Step>
                    <Step.Title>
                        Select your interests, professional or otherwise
                    </Step.Title>
                    <Step.Description>
                        (Only add new entries if they don't exist in dropdown!)
                    </Step.Description>
                </Step>
                </Step.Group>
                <PooledMultiSelectDropdown
                    endpoint={'/drop/interests'}
                    dataType={'Interest'}
                    getInputs={this.getInterestsInput}
                    allowAddition={true}
                />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        disabled={!this.state.newInterests.length && !this.state.existingInterests.length}
                        onClick={this.submit}
                    >
                        Submit
                    </Button>
                    <Button onClick={() => {
                            this.clearState();
                            this.props.closeModal()
                        }}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}