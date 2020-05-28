import React, { Component } from 'react';
import {Button, Modal, Dropdown } from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCall } from "../apis";

/*
props:
    - modalOpen: boolean
    - closeModal: ()
    - topicPreferences: [
        "College Shortlisting"
    ]
    - id
*/
export default class TopicPreferencesModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            topics: this.props.topicPreferences,
            topicOptions: [],
            submitting: false
        }
        this.hasNewPreferences = this.hasNewPreferences.bind(this)
        this.handleTopicSelection = this.handleTopicSelection.bind(this)
        this.submitPreferences = this.submitPreferences.bind(this)
    }

    async componentWillMount() {
        let topicOptions = await makeCall(null, `/alumni/topicOptions`, 'get')
        this.setState({
            topicOptions: topicOptions.topics.map(option => {
                return {
                    key: option,
                    value: option,
                    text: option
                }
            })
        })
    }

    hasNewPreferences() {
        if (this.state.topics.length !== this.props.topicPreferences.length) {
            return true
        }
        return !this.state.topics.every(newTopic => this.props.topicPreferences.includes(newTopic))
    }

    handleTopicSelection(e, {value}) {
        e.preventDefault()
        this.setState({
            topics: value
        })
    }

    submitPreferences(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                topicPreferences: this.state.topics
            }
            try {
                const result = await makeCall(payload, `/alumni/topicPreferences/${this.props.id}`, 'patch')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error updating your topic preferences, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your topic preferences were successfully updated!",
                            icon: "success",
                        }).then(() => {
                            this.props.closeModal();
                            window.location.reload();
                        })
                    })
                    
                }
            } catch (e) {
                this.setState({
                    submitting: false
                }, () => {
                    console.log("Error: TopicPreferencesModal#submitPreferences", e);
                })
            }
        })
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Select your topic availabilities!</Modal.Header>
                <Modal.Content>
                    <Dropdown
                        style={{ 'margin': '5px'}}
                        placeholder='Select topics you would like to consult on.'
                        fluid
                        multiple
                        selection
                        options={this.state.topicOptions}
                        value={this.state.topics}
                        onChange={this.handleTopicSelection}
                        name='topics'
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        disabled={!this.hasNewPreferences()}
                        onClick={this.submitPreferences}
                    >
                        Submit New Preferences
                    </Button>
                    <Button onClick={this.props.closeModal}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}