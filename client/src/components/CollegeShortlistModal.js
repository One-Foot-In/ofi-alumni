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
            existingCollegeId: '', // mongoId when existing college selected
            existingCollegeName: '',
            countryOptions: [],
            submitting: false,
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

    getCollegeInput(selection) {
        if (selection) {
            this.setState({
                existingCollegeId: selection.value,
                existingCollegeName: selection.text
            })
        } else {
            this.setState({
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
            existingCollegeId: '',
            existingCollegeName: ''
        })
    }

    isDuplicateCollegeEntry = (newCollege) => {
        return this.props.collegeShortlist.some(college => 
            (college.name + " (" + this.state.country + ")").localeCompare(newCollege) === 0);
    }

    submit(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            let payload = {
                collegeCountry: this.state.country,
                existingCollegeId: this.state.existingCollegeId,
                existingCollegeName: this.state.existingCollegeName
            }
            try {
                const result = await makeCall(payload, `/student/collegeShortlist/update/${this.props.id}`, 'patch')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error adding your college, please try again.",
                            icon: "error",
                        });
                    })
                    this.props.closeModal();
                } 
                else {
                    this.setState({
                        submitting: false,
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your college shortlist has been successfully updated!",
                            icon: "success",
                        })
                    })
                    this.props.addToShortlist(this.state.existingCollegeName);
                    this.props.closeModal();
                }
            } catch (e) {
                this.setState({
                    submitting: false
                }, () => {
                    console.log("Error: CollegeShortlistModal#submit", e);
                })
            }
        })
    }

    render() {
        var shortlist = this.props.addToShortlist;
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
                                        allowAddition={false}
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
                        primary
                        disabled={this.isDuplicateCollegeEntry(this.state.existingCollegeName)}
                        onClick={this.submit}
                        >
                        Submit
                    </Button>
                    <Button onClick={() => { 
                        this.clearState();
                        this.props.closeModal();
                    }}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}