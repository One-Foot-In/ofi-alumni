import React, { Component } from 'react';
import { Segment, Dropdown, Card, Image, Button, Modal, Header, Grid } from 'semantic-ui-react';
import { makeCall } from '../apis'
import AlumniProfile from './AlumniProfile'

export default class AlumniVerification extends Component {
    state={
        entries: [],
        dropdownOptions: [],
        dropdownValue: this.props.gradYear,
        display: [],
    }

    async componentWillMount(){
        let result = await this.getEntries()
        this.setState({
            entries: result.unapproved.reverse()
        })
        this.populateDropdownOptions()
        this.createDisplay()
    }

    getEntries() {
        return makeCall(null, '/alumni/unapproved', 'get').catch(e => console.log(e))
    }

    constructProfile(profile) {
        return (
            <div style={{padding: 10}} key={profile._id}>
                <Card fluid>
                    <Modal closeIcon onClose={this.close} dimmer='blurring' trigger={
                        <Card.Content data-id={profile._id}>
                            <Image
                            floated='left'
                            size='mini'
                            src={profile.imageURL}
                            />
                            <Card.Header>{profile.name}</Card.Header>
                            <Card.Meta>Graduated {profile.gradYear}</Card.Meta>
                        </Card.Content>
                    }>
                        <Header>
                            <Grid>
                                <Grid.Row columns={2}>
                                    <Grid.Column>Details for {profile.name}</Grid.Column>
                                    <Grid.Column textAlign='right'>Graduated: {profile.gradYear}</Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Header>
                        <Modal.Content>
                            <AlumniProfile details={profile} isViewOnly={true} />
                        </Modal.Content>
                    </Modal>
                    <Card.Content extra>
                        <Button 
                        inverted color='green'
                        onClick={this.handleClick.bind(this)}
                        data-id={profile._id}
                        fluid
                        >
                            Approve
                        </Button>
                    </Card.Content>
                </Card>
            </div>
        )
    }

    createDisplay(value) {
        let display = []
        for (let profile of this.state.entries) {
            if ((value === profile.gradYear) || value === 'all') {
                display.push(this.constructProfile(profile))
            }
        }
        this.setState({
            dropdownValue: value,
            display: display
        })
    }

    populateDropdownOptions() {
        this.setState({
            dropdownOptions: [
                {
                    key: this.props.gradYear,
                    text: this.props.gradYear,
                    value: this.props.gradYear
                },
                {
                    key: "all",
                    text: "All Years",
                    value: "all"
                }
            ]
        })
    }
    
    handleDropdownChange = (e, { value }) => {
        this.createDisplay(value)
    }

    handleClick(e) {
        alert(e.currentTarget.dataset.id)
    }

    render(){
        return (
            <>
            <Segment inverted color='blue' tertiary>Please only verify individuals that you know personally!</Segment>
            <Dropdown 
                value={this.state.dropdownValue}
                fluid
                floating
                selection
                name='dropdownValue'
                options={this.state.dropdownOptions}
                onChange={this.handleDropdownChange}
            />
            {this.state.display}
            </>
        )
    }
}