import React, { Component } from 'react';
import {Button, Modal, Divider, Step, Segment, Grid, Label, Icon, Dropdown } from 'semantic-ui-react';
import PooledSingleSelectDropdown from "./PooledSingleSelectDropdown"
import { makeCall } from "../apis";
import swal from "sweetalert";

/*
    props:
    - modalOpen
    - closeModal
    - getInput
*/
export default class AlumniCollegeCareerUpdateModal extends Component {
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
            // College
            countryOptions: [],
            country: '',
            newCollege: '',
            existingCollegeId: '',
            existingCollegeName: '',
            collegeOptions: [],
            // form control
            submitting: false

        }
        // job title
        this.getJobTitleInput = this.getJobTitleInput.bind(this)
        // company
        this.getCompanyInput = this.getCompanyInput.bind(this)
        // college
        this.handleCountrySelection = this.handleCountrySelection.bind(this)
        this.getCollegeInput = this.getCollegeInput.bind(this)
        this.deleteCountry = this.deleteCountry.bind(this)
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

    submitReady() {
        return (
            this.state.existingJobTitleId ||
            this.state.newJobTitle ||
            this.state.existingCompanyId ||
            this.state.newCompany ||
            this.state.existingCollegeId ||
            this.state.newCollege
        ) 
    }

    submit(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                existingJobTitleId: this.state.existingJobTitleId,
                existingJobTitleName: this.state.existingJobTitleName,
                newJobTitle: this.state.newJobTitle,
                // Company
                existingCompanyId: this.state.existingCompanyId,
                existingCompanyName: this.state.existingCompanyName,
                newCompany: this.state.newCompany,
                // College
                country: this.state.country,
                newCollege: this.state.newCollege,
                existingCollegeId: this.state.existingCollegeId,
                existingCollegeName: this.state.existingCollegeName
            }
            try {
                const result = await makeCall(payload, `/alumni/collegeAndCareer/update/${this.props.id}`, 'patch')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error updating your college/career information, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your college/career information have been successfully updated!",
                            icon: "success",
                        }).then(() => {
                            this.props.closeModal();
                        })
                    })
                    
                }
            } catch (e) {
                this.setState({
                    submitting: false
                }, () => {
                    console.log("Error: AlumniCollegeCareerUpdateModal#submit", e);
                })
            }
        })
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
                                Update your job title
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
                                Update your company
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
                                    Update your college
                                </Step.Title>
                                <Step.Description>
                                    Start with selecting a country. (Only add a new entry if it doesn't exist in dropdown!)
                                </Step.Description>
                            </Step>
                        </Step.Group>
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
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        disabled={!this.submitReady()}
                        onClick={this.submit}>
                        Update
                    </Button>
                    <Button onClick={this.props.closeModal}>
                        Done
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}