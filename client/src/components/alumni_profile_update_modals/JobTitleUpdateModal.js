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
export default class JobTitleUpdateModal extends Component {
    constructor(props){
        super(props)
        console.log("job props: ", props);
        this.state = {
            newJobTitle: '', // name when new major entered
            existingJobTitleId: '', // mongoId when existing major selected
            existingJobTitleName: '',
            submitting: false
        }
        this.getJobTitleInput = this.getJobTitleInput.bind(this)
        this.submit = this.submit.bind(this)
        this.clearState = this.clearState.bind(this)
    }

    getJobTitleInput(selection, isNew) {
        if (selection) {
            if (isNew) {
                this.setState({
                    newJobTitle: selection.value,
                    existingJobTitleId: '',
                    existingJobTitleName: ''
                })
            } else {
                this.setState({
                    newJobTitle: '',
                    existingJobTitleId: selection.value,
                    existingJobTitleName: selection.text
                })
            }
        } else {
            this.setState({
                newJobTitle: '',
                existingJobTitleId: '',
                existingJobTitleName: ''
            })
        }
    }

    clearState() {
        this.setState({
            newJobTitle: '',
            existingJobTitleId: '',
            existingJobTitleName: '',
        })
    }

    submit(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                existingJobTitleId: this.state.existingJobTitleId,
                existingJobTitleName: this.state.existingJobTitleName,
                newJobTitle: this.state.newJobTitle,
            }
            try {
                const result = await makeCall(payload, `/alumni/jobTitle/update/${this.props.id}`, 'patch')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error updating your job title information, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your job title has been successfully updated!",
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
                    console.log("Error: JobTitleUpdateModal#submit", e);
                })
            }
        })
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Select your Job Title</Modal.Header>
                <Modal.Content>
                    <PooledSingleSelectDropdown
                        endpoint={`/drop/jobTitles`}
                        allowAddition={true}
                        dataType={"Job Title"}
                        getInput={this.getJobTitleInput}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={!this.state.newJobTitle && !this.state.existingJobTitleId}
                        onClick={this.submit}>
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