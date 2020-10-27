import React, { Component } from 'react';
import {Button, Modal, Icon } from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCall } from "../apis";

/*
props:
    - isAlumni: boolean
    - logout: ()
    - id
*/
export default class DeleteAccountModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            submittingRequest: false,
            modalOpen: false
        }
        this.toggleModal = this.toggleModal.bind(this)
        this.deleteAccount = this.deleteAccount.bind(this)
    }
    toggleModal() {
        this.setState({
            modalOpen: !this.state.modalOpen
        })
    }

    deleteAccount() {
        this.toggleModal()
        this.setState({
            submittingRequest: true
        }, async () => {
            let result = await makeCall({}, `/${this.props.isAlumni ? 'alumni': 'student'}/${this.props.id}`, 'delete')
            if (!result || result.error) {
                this.setState({
                    submittingRequest: false
                }, () => {
                    swal({
                        title: "Error!",
                        text: "There was an error deleting your account, please try again.",
                        icon: "error",
                    });
                })
            } else {
                this.setState({
                    submittingRequest: false
                }, () => {
                    swal({
                        title: "Done!",
                        text: "Your account has been successfully deleted! We will miss you!",
                        icon: "success",
                    }).then(() => {
                        this.props.logout();
                    })
                })
                
            }
        })
    }

    render() {
        return (
            <Button
                color="red"
                type="button"
                onClick={this.toggleModal}
            >
                Delete Account
                <Icon
                    name="trash alternate outline"
                    style={{
                        'margin': '3px'
                    }}
                />
                <Modal
                    open={this.state.modalOpen}
                >
                    <Modal.Header>Are you sure you want to delete your account?</Modal.Header>
                    <Modal.Content>
                        This action is permanent, will remove all associated data from our systems, and cannot be undone!
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            primary
                            onClick={this.deleteAccount}
                        >
                            Yes
                        </Button>
                        <Button
                            onClick={this.toggleModal}
                        >
                            No
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Button>
        )
    }
}