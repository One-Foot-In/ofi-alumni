import React, { Component } from 'react';
import {Button, Modal, Grid, Label, Icon, Dropdown } from 'semantic-ui-react';
import PooledSingleSelectDropdown from "./PooledSingleSelectDropdown"
import { makeCall } from "../apis";
import swal from "sweetalert";

/*
    Modal makes a PATCH call to update alumni information
    props:
    - modalOpen
    - closeModal
    - getInput
    - id
*/
export default class CollegeShortlistModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            // newCollege: '', // name when new college entered
            existingCollegeId: '', // mongoId when existing college selected
            existingCollegeName: '',
            // countryOptions: [],
            submitting: false,
            allcolleges: '/util/allcolleges/',
            // colleges: this.props.colleges,
        }
        // this.handleCountrySelection = this.handleCountrySelection.bind(this)
        this.getCollegeInput = this.getCollegeInput.bind(this)
        // this.deleteCountry = this.deleteCountry.bind(this)
        this.submit = this.submit.bind(this)
        this.clearState = this.clearState.bind(this)
    }

    // async componentWillMount() {
    //     let result = await makeCall(null, '/drop/countries', 'get')
    //     this.setState({countryOptions: result.options})
    // }

    // handleCountrySelection(e, {value}) {
    //     e.preventDefault()
    //     this.setState({
    //         country: value
    //     })
    // }

    // getCollegeInput(selection, isNew) {
    getCollegeInput(selection) {
        if (selection) {
            // if (isNew) {
            //     this.setState({
            //         // newCollege: selection.value,
            //         existingCollegeId: '',
            //         existingCollegeName: ''
            //     })
            // } else {
                this.setState({
                    // newCollege: '',
                    existingCollegeId: selection.value,
                    existingCollegeName: selection.text
                })
            // }
        } else {
            this.setState({
                // newCollege: '',
                existingCollegeId: '',
                existingCollegeName: ''
            })
        }
    }

    // deleteCountry(e) {
    //     e.preventDefault()
    //     this.setState({
    //         country: '',
    //         newCollege: '',
    //         existingCollegeId: '',
    //         existingCollegeName: ''
    //     })
    // }

    clearState() {
        this.setState({
            // country: '',
            // newCollege: '',
            existingCollegeId: '',
            existingCollegeName: ''
        })
    }

    findDuplicate = (newCollege) => {
        return this.props.details.collegeShortlist.some(college => college === newCollege);
    }

    submit(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                // collegeCountry: this.state.country,
                // newCollege: this.state.newCollege,
                existingCollegeId: this.state.existingCollegeId,
                existingCollegeName: this.state.existingCollegeName
            }
            try {
                const studentResult = await makeCall(payload, `/student/college/update/${this.props.id}`, 'patch')

                if (!studentResult || studentResult.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error adding your college, please try again.",
                            icon: "error",
                        });
                    })
                } 
                // else if (this.findDuplicate(studentResult)) {
                //     this.setState({
                //         submitting: false
                //     }, () => {
                //         swal({
                //             title: "Error!",
                //             text: "Duplicate college.",
                //             icon: "error",
                //         });
                //     })
                // }
                else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your college has been successfully updated!",
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
                    console.log("Error: CollegeShortlistModal#submit", e);
                })
            }
        })
        this.props.closeModal()
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Select your college</Modal.Header>
                <Modal.Content>
                    {
                        <Grid centered>
                            <Grid.Row>
                                <PooledSingleSelectDropdown
                                    endpoint={'/util/allcolleges/'}
                                    // endpoint={'/drop/colleges/'}
                                    dataType={'College'}
                                    getInputs={this.getCollegeInput}
                                    allowAddition={false}
                                /> 
                            </Grid.Row>
                        </Grid>
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button // Workspace button
                        // disabled={!this.state.newCollege && !this.state.existingCollegeId}
                        onClick={this.submit}>
                        Submit
                    </Button>
                    <Button onClick={() => { // Modal button
                        this.props.collegeShortlist.push(this.getCollegeInput)
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