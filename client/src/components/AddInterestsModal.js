import React, { Component } from 'react';
import { Button, Modal, Step } from 'semantic-ui-react';
import PooledMultiSelectDropdown from "./PooledMultiSelectDropdown"

/*
This Interests Modal lifts the interest selections made by the user, for use by the parent component
props:
    - modalOpen: boolean
    - closeModal: ()
    - getInput: ()
    - title: string
*/
export default class AddInterestsModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            existingInterests: [],
            newInterests: []
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
        this.props.getInput(this.state.existingInterests, this.state.newInterests)
        this.clearState()
        this.props.closeModal()
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
                <Modal.Header>Add interests</Modal.Header>
                <Modal.Content>
                <Step.Group>
                <Step>
                    <Step.Title>
                        {this.props.title}
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
                        Add Interests
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