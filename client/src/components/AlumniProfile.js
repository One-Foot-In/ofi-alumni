import React, { Component } from 'react';
import { Button, Card, Image, Grid, Label, Icon, Segment } from 'semantic-ui-react';
import LinkedInUpdate from "./LinkedInUpdate";
import TimePreferencesModal from './TimePreferencesModal';
import TopicPreferencesModal from './TopicPreferencesModal';
import ZoomUpdateModal from './ZoomUpdateModal';
import ImageUpdateModal from './ImageUpdateModal';
import InterestsUpdateModal from './InterestsUpdateModal';
import LocationUpdateModal from './LocationUpdateModal';
import AlumniCollegeCareerUpdateModal from './AlumniCollegeCareerUpdateModal';
import { makeCall } from "../apis";

const ALUMNI = "ALUMNI"

export const timeToSlot = {
    0: '(12am - 1am)',
    100: '(1am - 2am)',
    200: '(2am - 3am)',
    300: '(3am - 4am)',
    400: '(4am - 5am)',
    500: '(5am - 6am)',
    600: '(6am - 7am)',
    700: '(7am - 8am)',
    800: '(8am - 9am)',
    900: '(9am - 10am)',
    1000: '(10am - 11am)',
    1100: '(11am - 12m)',
    1200: '(12pm - 1pm)',
    1300: '(1pm - 2pm)',
    1400: '(2pm - 3pm)',
    1500: '(3pm - 4pm)',
    1600: '(4pm - 5pm)',
    1700: '(5pm - 6pm)',
    1800: '(6pm - 7pm)',
    1900: '(7pm - 8pm)',
    2000: '(8pm - 9pm)',
    2100: '(9pm - 10pm)',
    2200: '(10pm - 11pm)',
    2300: '(11pm - 12am)',
}

/*
props:
- details: Object containing:
    - _id: string
    - imageURL: string
    - name: string
    - collegeName: string
    - city: string
    - country: string
    - companyName: string
    - jobTitleName: string
    - email: string
    - availabilities
- isViewOnly: bool
- refreshProfile: (ROLE, id)
*/
export default class AlumniProfile extends Component {
    constructor(props) {
        super(props)
        this.state = {
            timePreferencesModalOpen: false,
            topicPreferencesModalOpen: false,
            zoomUpdateOpen: false,
            imageModalOpen: false,
            interestsModalOpen: false,
            collegeAndCareerModalOpen: false,
            locationModalOpen: false,
            removingInterest: false
        }
        this.openImageModal = this.openImageModal.bind(this)
        this.closeImageModal = this.closeImageModal.bind(this)
        this.openInterestsModal = this.openInterestsModal.bind(this)
        this.closeInterestsModal = this.closeInterestsModal.bind(this)
        this.openCollegeAndCareerModal = this.openCollegeAndCareerModal.bind(this)
        this.closeCollegeAndCareerModal = this.closeCollegeAndCareerModal.bind(this)
        this.openLocationUpdateModal = this.openLocationUpdateModal.bind(this)
        this.closeLocationUpdateModal = this.closeLocationUpdateModal.bind(this)
        this.getInterests = this.getInterests.bind(this)
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
            this.props.refreshProfile(ALUMNI, this.props.details._id)
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
            this.props.refreshProfile(ALUMNI, this.props.details._id)
        })
    }
    openCollegeAndCareerModal() {
        this.setState({
            collegeAndCareerModalOpen: true
        })
    }
    closeCollegeAndCareerModal() {
        this.setState({
            collegeAndCareerModalOpen: false
        }, () => {
            this.props.refreshProfile(ALUMNI, this.props.details._id)
        })
    }
    openLocationUpdateModal() {
        this.setState({
            locationModalOpen: true
        })
    }
    closeLocationUpdateModal() {
        this.setState({
            locationModalOpen: false
        }, () => {
            this.props.refreshProfile(ALUMNI, this.props.details._id)
        })
    }
    async removeInterest(e, interestIdToRemove) {
        e.preventDefault()
        this.setState({removingInterest: true},
            async () => {
                await makeCall({interestIdToRemove: interestIdToRemove}, `/alumni/interests/remove/${this.props.details._id}`, 'patch')
                this.setState({
                    removingInterest: false
                }, () =>
                    this.props.refreshProfile(ALUMNI, this.props.details._id)
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
                style={{'margin-right': '2px'}}
                floated="left"
                basic
                color="blue"
                onClick={this.openImageModal}
            >
                Update Image
            </Button>
            <ImageUpdateModal
                modalOpen={this.state.imageModalOpen}
                id={details._id}
                isAlumni={true}
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
                Add Interests
            </Button>
            <InterestsUpdateModal
                role={'alumni'}
                modalOpen={this.state.interestsModalOpen}
                closeModal={this.closeInterestsModal}
                id={details._id}
            />
            </>
        )

        const collegeAndCareerUpdate = (
            <>
                <Button
                    style={{'margin-left': '2px'}}
                    floated='right'
                    primary
                    color="blue"
                    onClick={this.openCollegeAndCareerModal}
                >
                    Update College/Career
                </Button>
                <AlumniCollegeCareerUpdateModal
                    modalOpen={this.state.collegeAndCareerModalOpen}
                    closeModal={this.closeCollegeAndCareerModal}
                    id={details._id}
                />
            </>
        )

        const locationUpdate = (
            <>
                <Button
                    style={{'margin-left': '2px'}}
                    floated='right'
                    basic
                    color="blue"
                    onClick={this.openLocationUpdateModal}
                >
                    Update Location
                </Button>
                <LocationUpdateModal
                    modalOpen={this.state.locationModalOpen}
                    closeModal={this.closeLocationUpdateModal}
                    id={details._id}
                />
            </>
        )
        var canUpdate;

        if (!isViewOnly) {
            canUpdate = (
                <>
                <Card.Content extra>
                    <Grid stackable centered columns={3}>
                        <Grid.Column width={4}>
                            <Button.Group vertical>
                                {linkedInUpdate}
                                {imageUpdate}
                            </Button.Group>
                        </Grid.Column>
                        <Grid.Column width={4}>
                            <Button.Group vertical>
                                {collegeAndCareerUpdate}
                                {locationUpdate}
                            </Button.Group>
                        </Grid.Column>
                        <Grid.Column width={4}>
                            <Button.Group vertical>
                                {interestsUpdate}
                            </Button.Group>
                        </Grid.Column>
                    </Grid>
                </Card.Content>
                </>
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
                    <Card.Meta>{details.jobTitleName || 'Unavailable'}</Card.Meta>

                    <Card.Description>College: {details.collegeName || 'Unavailable'}</Card.Description>
                    <Card.Description>Location: {(details.city && details.country) ? `${details.city} (${details.country})` : 'Unavailable'}</Card.Description>
                    <Card.Description>Company: {details.companyName || 'Unavailable'}</Card.Description>
                    
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