import React, { Component } from 'react';
import {Button, Modal } from 'semantic-ui-react';
import PooledSingleSelectDropdown from "../PooledSingleSelectDropdown"
import { makeCall } from "../../apis";
import swal from "sweetalert";

/*
    Modal makes a PATCH call to update alumni information
    props:
    - modalOpen
    - closeModal: ()
    - getInput: ()
    - id
*/
export default class MajorUpdateModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            newMajor: '', // name when new major entered
            existingMajorId: '', // mongoId when existing major selected
            existingMajorName: '',
            submitting: false
        }
        this.getMajorInput = this.getMajorInput.bind(this)
        this.submit = this.submit.bind(this)
        this.clearState = this.clearState.bind(this)
    }

    getMajorInput(selection, isNew) {
        if (selection) {
            if (isNew) {
                this.setState({
                    newMajor: selection.value,
                    existingMajorId: '',
                    existingMajorName: ''
                })
            } else {
                this.setState({
                    newMajor: '',
                    existingMajorId: selection.value,
                    existingMajorName: selection.text
                })
            }
        } else {
            this.setState({
                newMajor: '',
                existingMajorId: '',
                existingMajorName: ''
            })
        }
    }

    clearState() {
        this.setState({
            newMajor: '',
            existingMajorId: '',
            existingMajorName: '',
        })
    }

    submit(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                existingMajorId: this.state.existingMajorId,
                existingMajorName: this.state.existingMajorName,
                newMajor: this.state.newMajor,
            }
            try {
                const result = await makeCall(payload, `/alumni/major/update/${this.props.id}`, 'patch')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error updating your major, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your major has been successfully updated!",
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
                    console.log("Error: MajorUpdateModal#submit", e);
                })
            }
        })
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Select your Major</Modal.Header>
                <Modal.Content>
                    <PooledSingleSelectDropdown
                        endpoint={`/drop/majors`}
                        allowAddition={true}
                        dataType={"Major"}
                        getInput={this.getMajorInput}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={!this.state.newMajor && !this.state.existingMajorId || this.state.submitting}
                        onClick={this.submit}
                        loading={this.state.submitting}>
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