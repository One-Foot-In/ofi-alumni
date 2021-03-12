import React, {Component} from 'react';
import {Modal, Step, Button} from 'semantic-ui-react';
import PooledMultiSelectDropdown from "./PooledMultiSelectDropdown";
import CollegeDropDown from './CollegeDropdown';
import {makeCall} from '../apis';
import swal from 'sweetalert';

export default class AlumniCollegeUpdateModal extends Component{
    constructor(props){
        super(props);
        this.state={
            existingColleges: [],
            newColleges: [],
            submitting: false
        }
    }

    clearState = () => {
        this.setState({
            existingColleges: [],
            newColleges: []
        })
    }

    submitNewColleges = (e) => {
        e.preventDefault();
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                newColleges: this.state.newColleges,
                existingColleges: this.state.existingColleges
            }
            try{
                const result = await makeCall(payload, `alumni/collegesAcceptedInto/add/${this.props._id}`, 'PATCH')
                if (!result || result.error){
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error adding your colleges, please try again.",
                            icon: "error",
                        });
                    })
                } else{
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your colleges have been successfully added!",
                            icon: "success",
                        }).then(() => {
                            this.clearState();
                            this.props.closeModal();
                        })
                    })
                }
            } catch(e) {
                this.setState({
                    submitting: false
                }, () => {
                    console.log(e)
                })
            }
        })
    }

    getCollegeInputs = (selection) => {
        console.log(selection)
        this.setState({
            existingColleges: selection.old,
            newColleges: selection.new
        })
    }

    render(){
        return(
            <Modal open={this.props.modalOpen}>
                <Modal.Header>Updated your Colleges</Modal.Header>
                <Modal.Content>
                    <Step.Group>
                        <Step>
                            <Step.Title>
                                Select the colleges into which you were accepted
                            </Step.Title>
                            <Step.Description>
                                (Only add new entries if they don't exist in dropdown!)
                            </Step.Description>
                        </Step>
                    </Step.Group>
                    <PooledMultiSelectDropdown
                        endpoint={'/drop/colleges'}
                        dataType={'Colleges'}
                        getInputs={this.getCollegeInputs}
                        allowAddition={true}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        disabled={!this.state.newColleges.length && !this.props.existingColleges.length || this.state.submitting}
                        loading={this.state.submitting}
                        onClick={this.submitNewColleges}
                    >
                        Submit
                    </Button>
                    <Button
                        onClick={() => {
                            this.clearState();
                            this.props.closeModal()
                        }}
                    >
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}