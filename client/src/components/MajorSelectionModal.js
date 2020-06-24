import React, { Component } from 'react';
import {Button, Modal } from 'semantic-ui-react';
import PooledSingleSelectDropdown from "./PooledSingleSelectDropdown"
import { makeCall } from "../apis";

/*
    props:
    - modalOpen
    - closeModal
    - getInput
*/
export default class MajorSelectionModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            newMajor: '', // name when new major entered
            existingMajorId: '', // mongoId when existing major selected
            existingMajorName: '',
            majorOptions: []
        }
        this.getMajorInput = this.getMajorInput.bind(this)
        this.submit = this.submit.bind(this)
    }

    async componentWillMount() {
        let result = await makeCall(null, '/drop/majors', 'get')
        this.setState({majorOptions: result.options})
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

    submit(e) {
        e.preventDefault()
        this.props.getInput(this.state.newMajor || this.state.existingMajorName, this.state.existingMajorId)
        this.props.closeModal()
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Select your major</Modal.Header>
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