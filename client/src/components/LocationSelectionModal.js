import React, { Component } from 'react';
import {Button, Modal, Input, Dropdown, Label, Grid, Icon } from 'semantic-ui-react';
import { makeCall } from "../apis";

/*
props:
    - getInput: (country, city)
    - modalOpen: boolean
    - closeModal: ()
*/
export default class LocationSelectionModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            country: '',
            city: '',
            options: []
        }
        this.handleCountrySelection = this.handleCountrySelection.bind(this)
        this.handleCityChange = this.handleCityChange.bind(this)
        this.deleteCountry = this.deleteCountry.bind(this)
        this.submit = this.submit.bind(this)
    }

    async componentWillMount() {
        let result = await makeCall(null, '/drop/countries', 'get')
        this.setState({options: result.options})
    }

    handleCountrySelection(e, {value}) {
        e.preventDefault()
        this.setState({
            country: value
        })
    }

    handleCityChange(e) {
        e.preventDefault()
        console.log(e.target.value)
        this.setState({
            city: e.target.value 
        })
    }

    submit(e) {
        e.preventDefault()
        this.props.getInput(this.state.country, this.state.city)
        this.props.closeModal()
    }

    deleteCountry(e) {
        e.preventDefault()
        this.setState({
            country: '',
            city: ''
        })
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Select your location</Modal.Header>
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
                                    <Input 
                                        label='City'
                                        name='city'
                                        onChange={this.handleCityChange}
                                        value={this.state.city}
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
                            options={this.state.options}
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
                    <Button 
                        onClick={this.props.closeModal}>
                        Done
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}