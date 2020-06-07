import React, { Component } from 'react';
import {Button, Modal, Divider, Step, Segment } from 'semantic-ui-react';
import PooledSingleSelectDropdown from "./PooledSingleSelectDropdown"
import PooledMultiSelectDropdown from './PooledMultiSelectDropdown';
import { makeCall } from "../apis";

/*
    props:
    - modalOpen
    - closeModal
    - getInput
*/
export default class CareerAndInterestsModal extends Component {
    constructor(props){
        super(props)
        // props are currently not being used to populate input fields
        // this can be added as a future enhancement
        this.state = {
            // Job Title
            existingJobTitleId: '',
            existingJobTitleName: '',
            newJobTitle: '',
            // Company
            existingCompanyId: '',
            existingCompanyName: '',
            newCompany: '',
            // Interests
            existingInterests: [],
            newInterests: []
        }
        this.getJobTitleInput = this.getJobTitleInput.bind(this)
        this.getCompanyInput = this.getCompanyInput.bind(this)
        this.getInterestsInput = this.getInterestsInput.bind(this)
        this.submit = this.submit.bind(this)
        this.submitReady = this.submitReady.bind(this)
    }

    async componentWillMount() {
        let result = await makeCall(null, '/drop/countries', 'get')
        this.setState({countryOptions: result.options})
    }

    getCompanyInput(selection, isNew) {
        if (selection) {
            if (isNew) {
                this.setState({
                    existingCompanyId: '',
                    existingCompanyName: '',
                    newCompany: selection.value,
                })
            } else {
                this.setState({
                    newCompany: '',
                    existingCompanyId: selection.value,
                    existingCompanyName: selection.text
                })
            }
        } else {
            this.setState({
                newCompany: '',
                existingCompanyId: '',
                existingCompanyName: ''
            })
        }
    }

    getJobTitleInput(selection, isNew) {
        if (selection) {
            if (isNew) {
                this.setState({
                    existingJobTitleId: '',
                    existingJobTitleName: '',
                    newJobTitle: selection.value,
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

    getInterestsInput(selection) {
        this.setState({
            existingInterests: selection.old,
            newInterests: selection.new,
        })
    }

    submitReady() {
        return (
            this.state.existingJobTitleId ||
            this.state.newJobTitle ||
            this.state.existingCompanyId ||
            this.state.newCompany ||
            this.state.existingInterests.length ||
            this.state.newInterests.length
        ) 
    }

    submit(e) {
        e.preventDefault()
        this.props.getInput(
            {
                existingJobTitleId: this.state.existingJobTitleId,
                existingJobTitleName: this.state.existingJobTitleName,
                newJobTitle: this.state.newJobTitle
            },
            {
                existingCompanyId: this.state.existingJobTitleId,
                existingCompanyName: this.state.existingCompanyName,
                newCompany: this.state.newCompany
            },
            {
                existingInterests: this.state.existingInterests,
                newInterests: this.state.newInterests
            }
        )
        this.props.closeModal()
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Career and Interests Modal</Modal.Header>
                <Modal.Content>
                    <Segment color='green'>
                        <Step.Group>
                        <Step>
                            <Step.Title>
                                Select your job title
                            </Step.Title>
                            <Step.Description>
                                (Only add a new entry if it doesn't exist in dropdown!)
                            </Step.Description>
                        </Step>
                        </Step.Group>
                        <PooledSingleSelectDropdown
                            endpoint={'/drop/jobTitles'}
                            dataType={'Job Title'}
                            getInput={this.getJobTitleInput}
                            allowAddition={true}
                        />
                    </Segment>
                    <Divider/>
                    <Segment color='teal'>
                        <Step.Group>
                        <Step>
                            <Step.Title>
                                Select your company
                            </Step.Title>
                            <Step.Description>
                                (Only add a new entry if it doesn't exist in dropdown!)
                            </Step.Description>
                        </Step>
                        </Step.Group>
                        <PooledSingleSelectDropdown
                            endpoint={'/drop/companies'}
                            dataType={'Company'}
                            getInput={this.getCompanyInput}
                            allowAddition={true}
                        />
                    </Segment>
                    <Divider/>
                    <Segment color='blue'>
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
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={!this.submitReady()}
                        onClick={this.submit}>
                        Add
                    </Button>
                    <Button onClick={this.props.closeModal}>
                        Done
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}