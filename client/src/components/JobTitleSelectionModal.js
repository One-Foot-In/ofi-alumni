import React, { Component } from 'react';
import {Button, Modal } from 'semantic-ui-react';
import PooledSingleSelectDropdown from "./PooledSingleSelectDropdown"

/*
    props:
    - modalOpen
    - closeModal: ()
    - getInput: ()
*/
export default class JobTitleSelectionModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            newJobTitle: '', // name when new major entered
            existingJobTitleId: '', // mongoId when existing major selected
            existingJobTitleName: ''
        }
        this.getJobTitleInput = this.getJobTitleInput.bind(this)
        this.submit = this.submit.bind(this)
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

    submit(e) {
        e.preventDefault()
        this.props.getInput(this.state.newJobTitle || this.state.existingJobTitleName, this.state.existingJobTitleId)
        this.props.closeModal()
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
                        onClick={this.submit}>
                        Submit
                    </Button>
                    <Button onClick={this.props.closeModal}>
                        Done
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}