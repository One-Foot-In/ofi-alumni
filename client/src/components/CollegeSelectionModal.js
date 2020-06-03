import React, { Component } from 'react';
import {Button, Modal, Grid, Label, Icon, Dropdown } from 'semantic-ui-react';
import SearchablePooledSingleSelectDropdown from "./SearchablePooledSingleSelectDropdown"
import { makeCall } from "../apis";

/*
    props:
    - modalOpen
    - closeModal
    - getInput
*/
export default class CollegeSelectionModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            country: '',
            newCollege: '', // name when new college entered
            existingCollegeId: '', // mongoId when existing college selected
            existingCollegeName: '',
            countryOptions: [],
            collegeOptions: []
        }
        this.handleCountrySelection = this.handleCountrySelection.bind(this)
        this.getCollegeInput = this.getCollegeInput.bind(this)
        this.deleteCountry = this.deleteCountry.bind(this)
        this.submit = this.submit.bind(this)
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

    submit(e) {
        e.preventDefault()
        this.props.getInput(this.state.country, this.state.newCollege || this.state.existingCollegeName, this.state.existingCollegeId)
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
                                    <SearchablePooledSingleSelectDropdown
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
                        onClick={this.submit}>
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