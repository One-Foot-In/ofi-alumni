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

    // getCollegeInput(selection, isNew) {
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

    findDuplicate = (newCollege) => {
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
                const result = await makeCall(payload, `/student/college/update/${this.props.id}`, 'patch')
                if (this.findDuplicate(this.state.existingCollegeName)) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "Duplicate college.",
                            icon: "error",
                        });
                    })
                }
                else if (!result || result.error) {
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
                
                else {
                    this.setState({
                        submitting: false,
                        goodInput: true
                    }, () => {
                        swal({
                            title: "Done!",
                            text: "Your college has been successfully updated!",
                            icon: "success",
                        })
                    })
                    console.log(this.props.collegeShortlist);
                    this.props.collegeShortlist.push(this.state.existingCollegeName);
                    console.log(this.props.collegeShortlist);
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
        var shortlist = this.props.shortlist;
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
                        // disabled={!this.state.newCollege && !this.state.existingCollegeId}
                        onClick={
                            this.submit
                            // this.props.shortlist(this.props.collegeShortlist)
                        }
                        >
                        Submit
                    </Button>
                    <Button onClick={() => { 
                        this.props.shortlist(this.props.collegeShortlist);
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