import React, { Component } from 'react';
import {Button, Modal } from 'semantic-ui-react';
import SearchablePooledSingleSelectDropdown from "./SearchablePooledSingleSelectDropdown"
import { makeCall } from "../apis";
import SearchablePooledMultiSelectDropdown from './SearchablePooledMultiSelectDropdown';

/*
    props:
    - modalOpen
    - closeModal
    - getInput
*/
export default class CareerAndInterestsModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            // Job Title
            existingjobTitleId: '',
            existingjobTitleName: '',
            newJobTitle: '',
            // Company
            existingcompanyId: '',
            existingcompanyName: '',
            newCompany: '',
            // Interests
            existingInterests: [],
            newInterests: []
        }
        this.getJobTitleInput = this.getJobTitleInput.bind(this)
        this.getCompanyInput = this.getCompanyInput.bind(this)
        this.getInterestsInput = this.getInterestsInput.bind(this)
        this.submit = this.submit.bind(this)
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
                    existingCompanyName: selection.value,
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
                    existingjobTitleId: '',
                    existingjobTitleName: selection.value,
                    newJobTitle: selection.value,
                })
            } else {
                this.setState({
                    newJobTitle: '',
                    existingjobTitleId: selection.value,
                    existingjobTitleName: selection.text
                })
            }
        } else {
            this.setState({
                newJobTitle: '',
                existingjobTitleId: '',
                existingjobTitleName: ''
            })
        }
    }

    getInterestsInput(selection) {
        this.setState({
            existingInterests: selection.old,
            newInterests: selection.new,
        })
    }

    submit(e) {
        e.preventDefault()
        console.log(this.state)
        // TODO: lift jobTitle, company, and interests info into signup form
        this.props.closeModal()
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Career and Interests Modal</Modal.Header>
                <Modal.Content>
                    <SearchablePooledSingleSelectDropdown
                        endpoint={'/drop/jobTitles'}
                        dataType={'Job Title'}
                        getInput={this.getJobTitleInput}
                        allowAddition={true}
                    />
                    <SearchablePooledSingleSelectDropdown
                        endpoint={'/drop/companies'}
                        dataType={'Company'}
                        getInput={this.getCompanyInput}
                        allowAddition={true}
                    />
                    <SearchablePooledMultiSelectDropdown
                        endpoint={'/drop/interests'}
                        dataType={'Interests'}
                        getInputs={this.getInterestsInput}
                        allowAdditions={true}
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