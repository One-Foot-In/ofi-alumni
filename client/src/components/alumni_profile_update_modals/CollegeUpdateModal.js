import React, { Component } from 'react';
import {Button, Modal, Grid, Label, Icon, Dropdown } from 'semantic-ui-react';
import PooledSingleSelectDropdown from "../PooledSingleSelectDropdown"
import { makeCall } from "../../apis";
import swal from "sweetalert";

/*
    Modal makes a PATCH call to update alumni information
    props:
    - modalOpen
    - closeModal
    - getInput
    - id
*/
export default class CollegeUpdateModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            country: '',
            newCollege: '', // name when new college entered
            existingCollegeId: '', // mongoId when existing college selected
            existingCollegeName: '',
            countryOptions: [],
            submitting: false
        }
        this.handleCountrySelection = this.handleCountrySelection.bind(this)
        this.getCollegeInput = this.getCollegeInput.bind(this)
        this.deleteCountry = this.deleteCountry.bind(this)
        this.submit = this.submit.bind(this)
        this.clearState = this.clearState.bind(this)
    }

    async componentWillMount() {
        let result = await makeCall(null, '/drop/countries', 'get')
        this.setState({countryOptions: result.options})
    }

    handleCountrySelection(e, {value}) {
        e.preventDefault()
        this.setState({
            country: value
        })
    }

    getCollegeInput(selection, isNew) {
        if (selection) {
            if (isNew) {
                this.setState({
                    newCollege: selection.value,
                    existingCollegeId: '',
                    existingCollegeName: ''
                })
            } else {
                this.setState({
                    newCollege: '',
                    existingCollegeId: selection.value,
                    existingCollegeName: selection.text
                })
            }
        } else {
            this.setState({
                newCollege: '',
                existingCollegeId: '',
                existingCollegeName: ''
            })
        }
    }

    deleteCountry(e) {
        e.preventDefault()
        this.setState({
            country: '',
            newCollege: '',
            existingCollegeId: '',
            existingCollegeName: ''
        })
    }

    clearState() {
        this.setState({
            country: '',
            newCollege: '',
            existingCollegeId: '',
            existingCollegeName: ''
        })
    }

    submit(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                collegeCountry: this.state.country,
                newCollege: this.state.newCollege,
                existingCollegeId: this.state.existingCollegeId,
                existingCollegeName: this.state.existingCollegeName
            }
            try {
                const result = await makeCall(payload, `/alumni/college/update/${this.props.id}`, 'patch')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error updating your college, please try again.",
                            icon: "error",
                        });
                    })
                } else {
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
                    console.log("Error: CollegeUpdateModal#submit", e);
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
                        this.state.country ? 
                        <>
                            <Grid centered>
                                <Grid.Row>
                                    <Label>
                                        {this.state.country}
                                        <Icon
                                            onClick={this.deleteCountry}
                                            name='delete'
                                        />
                                    </Label>
                                </Grid.Row>
                                <Grid.Row>
                                    <PooledSingleSelectDropdown
                                        endpoint={`/drop/colleges/${this.state.country}`}
                                        allowAddition={true}
                                        dataType={"College"}
                                        getInput={this.getCollegeInput}
                                    /> 
                                </Grid.Row>
                            </Grid>
                        </> : 
                        <Dropdown
                            placeholder="Search for the country you're in"
                            style={{ 'margin': '5px', 'width': '80%'}}
                            fluid
                            search
                            selection
                            options={this.state.countryOptions}
                            value={this.state.country}
                            onChange={this.handleCountrySelection}
                        />
                    }
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={!this.state.newCollege && !this.state.existingCollegeId || this.state.submitting}
                        onClick={this.submit}>
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