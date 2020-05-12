import React, { Component } from 'react';
import { Button, Card, Image } from 'semantic-ui-react';

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
            <Button primary>
                Update info with LinkedIn
            </Button>
        )
        const imageUpdate = (
            <Button floated="right" basic color="blue">
                Update Image
            </Button>
        )
        var canUpdate;

        if (isViewOnly) {
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
                    <Card.Header>{name}</Card.Header>
                    <Card.Meta>{jobTitle}</Card.Meta>

                    <Card.Description>College: {college}</Card.Description>
                    <Card.Description>Location: {location}</Card.Description>
                    <Card.Description>Company: {company}</Card.Description>
                    
                </Card.Content>
                {canUpdate}
            </Card>
            <div padding-top="10px" />
            </div>
        )
    }
}