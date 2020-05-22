import React, { Component } from 'react';
import { Button, Card, Image } from 'semantic-ui-react';
import LinkedInUpdate from "./LinkedInUpdate";

/*
props:
- imageURL: string
- name: string
- college: string
- location: string
- company: string
- jobTitle: string
- isViewOnly: bool
*/
export default class Profile extends Component {
    render(){
        const imageURL = this.props.imageURL;
        const name = this.props.name;
        const college = this.props.college;
        const location = this.props.location;
        const company = this.props.company;
        const jobTitle = this.props.jobTitle;
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
                    src={imageURL}
                />
                <Card.Content>
                    <Card.Header>{name || 'Unavailable'}</Card.Header>
                    <Card.Meta>{jobTitle || 'Unavailable'}</Card.Meta>

                    <Card.Description>College: {college || 'Unavailable'}</Card.Description>
                    <Card.Description>Location: {location || 'Unavailable'}</Card.Description>
                    <Card.Description>Company: {company || 'Unavailable'}</Card.Description>
                    
                </Card.Content>
                {canUpdate}
            </Card>
            <div padding-top="10px" />
            </div>
        )
    }
}