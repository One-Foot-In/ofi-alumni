import React, { Component } from 'react';
import {Button, Modal } from 'semantic-ui-react';
import PooledSingleSelectDropdown from "./PooledSingleSelectDropdown"

/*
    props:
    - modalOpen
    - closeModal
    - getInput
*/
export default class CompanySelectionModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            newCompany: '', // name when new major entered
            existingCompanyId: '', // mongoId when existing major selected
            existingCompanyName: ''
        }
        this.getCompanyInput = this.getCompanyInput.bind(this)
        this.submit = this.submit.bind(this)
    }

    getCompanyInput(selection, isNew) {
        if (selection) {
            if (isNew) {
                this.setState({
                    newCompany: selection.value,
                    existingCompanyId: '',
                    existingCompanyName: ''
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

    submit(e) {
        e.preventDefault()
        this.props.getInput(this.state.newCompany || this.state.existingCompanyName, this.state.existingCompanyId)
        this.props.closeModal()
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Select your company</Modal.Header>
                <Modal.Content>
                    <PooledSingleSelectDropdown
                        endpoint={`/drop/companies`}
                        allowAddition={true}
                        dataType={"Company"}
                        getInput={this.getCompanyInput}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        onClick={this.submit}
                        disabled={!this.state.newCompany && !this.state.existingCompanyId}
                    >
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