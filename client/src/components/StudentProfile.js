import React, { Component } from 'react';
import { Button, Card, Image } from 'semantic-ui-react';
import LinkedInUpdate from "./LinkedInUpdate";
import ImageUpdateModal from './ImageUpdateModal';

const STUDENT = "STUDENT"

/*
props:
- details: Object containing:
    - imageURL: string
    - name: string
    - grade: string
    - email: string
- isViewOnly: bool
*/
export default class StudentProfile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            imageModalOpen: false
        }
        this.openImageModal = this.openImageModal.bind(this)
        this.closeImageModal = this.closeImageModal.bind(this)
    }
    openImageModal() {
        this.setState({
            imageModalOpen: true
        })
    }
    closeImageModal() {
        this.setState({
            imageModalOpen: false
        }, () => {
            this.props.refreshProfile(STUDENT, this.props.details._id)
        })
    }
    render() {
        const details = this.props.details;
        const isViewOnly = this.props.isViewOnly;

        const linkedInUpdate = (
            <LinkedInUpdate
                email={details.email}
            />
        )
        const imageUpdate = (
            <>
            <Button 
                floated="right"
                basic
                color="blue"
                onClick={this.openImageModal}
            >
                Update Image
            </Button>
            <ImageUpdateModal
                modalOpen={this.state.imageModalOpen}
                id={details._id}
                isAlumni={false}
                closeModal={this.closeImageModal}
            />
            </>
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

                    <Card.Description>Grade: {details.grade || 'Unavailable'}</Card.Description>
                </Card.Content>
                {canUpdate}
            </Card>
            <div padding-top="10px" />
            </div>
        )
    }
}