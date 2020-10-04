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
export default class CompanyUpdateModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            existingCompanyId: '',
            existingCompanyName: '',
            newCompany: '',
            submitting: false
        }
        this.getCompanyInput = this.getCompanyInput.bind(this)
        this.submit = this.submit.bind(this)
        this.clearState = this.clearState.bind(this)
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

    clearState() {
        this.setState({
            existingCompanyId: '',
            existingCompanyName: '',
            newCompany: '',
        })
    }

    submit(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                existingCompanyId: this.state.existingCompanyId,
                existingCompanyName: this.state.existingCompanyName,
                newCompany: this.state.newCompany,
            }
            try {
                const result = await makeCall(payload, `/alumni/company/update/${this.props.id}`, 'patch')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error updating your company information, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your company has been successfully updated!",
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
                    console.log("Error: CompanyUpdateModal#submit", e);
                })
            }
        })
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Select your Company</Modal.Header>
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
                        disabled={!this.state.newCompany && !this.state.existingCompanyId || this.state.submitting}
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