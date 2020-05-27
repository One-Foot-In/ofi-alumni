import React, { Component } from 'react';
import { Button, Card, Image } from 'semantic-ui-react';
import LinkedInUpdate from "./LinkedInUpdate";
import TimePreferencesModal from './TimePreferencesModal';

/*
props:
- details: Object containing:
    - _id: string
    - imageURL: string
    - name: string
    - college: string
    - location: string
    - company: string
    - jobTitle: string
    - email: string
    - availabilities
- isViewOnly: bool
*/
export default class AlumniProfile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            preferencesModalOpen: false
        }
        this.openPreferencesModal = this.openPreferencesModal.bind(this)
        this.closePreferencesModal = this.closePreferencesModal.bind(this)
    }
    closePreferencesModal() {
        this.setState({
            preferencesModalOpen: false
        })
    }
    openPreferencesModal() {
        this.setState({
            preferencesModalOpen: true
        })
    }
    render(){
        const details = this.props.details;
        const isViewOnly = this.props.isViewOnly;

        const linkedInUpdate = (
            <LinkedInUpdate
                email={details.email}
            />
        )
        const imageUpdate = (
            <Button floated="right" basic color="blue">
                Update Image
            </Button>
        )
        const timeAvailabilitiesUpdate = (
            <>
            <Button
                floated='right'
                basic
                color="blue"
                onClick={this.openPreferencesModal}
            >
                Update Time Availabilities
            </Button>
            <TimePreferencesModal
                modalOpen={this.state.preferencesModalOpen}
                timePreferences={details.availabilities || []}
                closeModal={this.closePreferencesModal}
                id={details._id}
            />
            </>
        )
        var canUpdate;

        if (!isViewOnly) {
            canUpdate = (
                <Card.Content extra>
                    {linkedInUpdate}
                    {timeAvailabilitiesUpdate}
                    {imageUpdate}
                </Card.Content>
            )
        } else {
            canUpdate = <div />
        }

        return (
            <div>
            <Card fluid>
                <Image 
                    centered
                    rounded
                    size="medium"
                    src={details.imageURL}
                />
                <Card.Content>
                    <Card.Header>{details.name || 'Unavailable'}</Card.Header>
                    <Card.Meta>{details.profession || 'Unavailable'}</Card.Meta>

                    <Card.Description>College: {details.college || 'Unavailable'}</Card.Description>
                    <Card.Description>Location: {details.location || 'Unavailable'}</Card.Description>
                    <Card.Description>Company: {details.company || 'Unavailable'}</Card.Description>
                    
                </Card.Content>
                {canUpdate}
            </Card>
            <div padding-top="10px" />
            </div>
        )
    }
}