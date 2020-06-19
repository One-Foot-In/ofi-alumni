import React, { Component } from 'react';
import { Button, Card, Image, Grid, Label, Segment, Icon } from 'semantic-ui-react';
import LinkedInUpdate from "./LinkedInUpdate";
import ImageUpdateModal from './ImageUpdateModal';
import InterestsUpdateModal from './InterestsUpdateModal';
import { makeCall } from "../apis";

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
            imageModalOpen: false,
            interestsModalOpen: false,
            removingInterest: false
        }
        this.openImageModal = this.openImageModal.bind(this)
        this.closeImageModal = this.closeImageModal.bind(this)
        this.openInterestsModal = this.openInterestsModal.bind(this)
        this.closeInterestsModal = this.closeInterestsModal.bind(this)
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
    openInterestsModal() {
        this.setState({
            interestsModalOpen: true
        })
    }
    closeInterestsModal() {
        this.setState({
            interestsModalOpen: false
        }, () => {
            this.props.refreshProfile(STUDENT, this.props.details._id)
        })
    }
    async removeInterest(e, interestIdToRemove) {
        e.preventDefault()
        this.setState({removingInterest: true},
            async () => {
                await makeCall({interestIdToRemove: interestIdToRemove}, `/student/interests/remove/${this.props.details._id}`, 'patch')
                this.setState({
                    removingInterest: false
                }, () => 
                    this.props.refreshProfile(STUDENT, this.props.details._id)
                )
            })
    }
    getInterests() {
        return this.props.details.interests && this.props.details.interests.length && this.props.details.interests.map(interest => {
            return (
                <Label
                    key={interest._id}
                    style={{
                        'margin': '3px'
                    }}
                    color='blue'
                >
                    {interest.name}
                    {
                        !this.props.isViewOnly &&
                        <Icon
                            onClick={(e) => this.removeInterest(e, interest._id)}
                            name='delete'
                        />
                    }
                </Label>
            )
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

        const interestsUpdate = (
            <>
            <Button
                style={{'margin-left': '2px'}}
                floated='right'
                basic
                color="blue"
                onClick={this.openInterestsModal}
            >
                Add Extra-curricular Interests
            </Button>
            <InterestsUpdateModal
                role={'student'}
                modalOpen={this.state.interestsModalOpen}
                closeModal={this.closeInterestsModal}
                id={details._id}
            />
            </>
        )
        var canUpdate;

        if (!isViewOnly) {
            canUpdate = (
                <Card.Content extra>
                    <Grid stackable centered columns={2}>
                        <Grid.Column width={8}>
                            <Button.Group vertical>
                                {linkedInUpdate}
                                {imageUpdate}
                            </Button.Group>
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Button.Group vertical>
                                {interestsUpdate}
                            </Button.Group>
                        </Grid.Column>
                    </Grid>
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
                <Card.Content>
                    <Card.Header>Interests</Card.Header>
                    <Segment
                        loading={this.state.removingInterest}
                    >
                        {details.interests && details.interests.length ?
                        this.getInterests() :
                        <span>No interests added.</span>
                        }
                    </Segment>
                </Card.Content>
                {canUpdate}
            </Card>
            <div padding-top="10px" />
            </div>
        )
    }
}