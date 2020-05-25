import React, { Component } from 'react';
import { Button, Card, Image } from 'semantic-ui-react';
import LinkedInUpdate from "./LinkedInUpdate";

/*
props:
- details: Object containing:
    - imageURL: string
    - name: string
    - college: string
    - location: string
    - company: string
    - jobTitle: string
    - email: string
- isViewOnly: bool
*/
export default class AlumniProfile extends Component {
    render(){
        const details = this.props.details;
        const isViewOnly = this.props.isViewOnly;

        const linkedInUpdate = (
            <LinkedInUpdate/>
        )
        const imageUpdate = (
            <Button floated="right" basic color="blue">
                Update Image
            </Button>
        )
        var canUpdate;

        if (!isViewOnly) {
            canUpdate = (
                <Card.Content extra>
                    {linkedInUpdate}
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