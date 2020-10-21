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
    }
    openModal(e) {
        console.log("opening modal")
        e.preventDefault();
        this.setState({
            modalOpen: true
        })
    }
    closeModal(e) {
        e.preventDefault();
        this.setState({
            modalOpen: false
        })
    }

    deleteAccount() {
        this.props.closeModal()
        this.setState({
            submittingRequest: true
        }, async () => {
            let result = await makeCall({}, `/${this.props.isAlumni ? 'alumni': 'student'}/${this.props.details._id}`, 'delete')
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
                onClick={this.openModal.bind(this)}
            >
                Delete Account
                <Icon
                    name="delete"
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
                            onClick={this.closeModal.bind(this)}
                        >
                            No
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Button>
        )
    }
}