import React, { Component } from 'react';
import { Button, Card, Image, Label, Icon, Segment, Dimmer } from 'semantic-ui-react';
import ImageUpdateModal from './ImageUpdateModal';
import InterestsUpdateModal from './InterestsUpdateModal';
import LocationUpdateModal from './LocationUpdateModal';
import JobTitleUpdateModal from './alumni_profile_update_modals/JobTitleUpdateModal';
import CollegeUpdateModal from './alumni_profile_update_modals/CollegeUpdateModal';
import CompanyUpdateModal from './alumni_profile_update_modals/CompanyUpdateModal';
import MajorUpdateModal from './alumni_profile_update_modals/MajorUpdateModal';
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
            interestsModalOpen: false,
            locationModalOpen: false,
            jobTitleModalOpen: false,
            collegeModalOpen: false,
            companyModalOpen: false,
            majorModalOpen: false,
            removingInterest: false,
            imageActive: false
        }
        this.openImageModal = this.openImageModal.bind(this)
        this.closeImageModal = this.closeImageModal.bind(this)
        this.openInterestsModal = this.openInterestsModal.bind(this)
        this.closeInterestsModal = this.closeInterestsModal.bind(this)
        this.openLocationUpdateModal = this.openLocationUpdateModal.bind(this)
        this.closeLocationUpdateModal = this.closeLocationUpdateModal.bind(this)
        this.openJobTitleModal = this.openJobTitleModal.bind(this);
        this.closeJobTitleModal = this.closeJobTitleModal.bind(this);
        this.openCollegeModal = this.openCollegeModal.bind(this);
        this.closeCollegeModal = this.closeCollegeModal.bind(this);
        this.openCompanyModal = this.openCompanyModal.bind(this);
        this.closeCompanyModal = this.closeCompanyModal.bind(this);
        this.openMajorModal = this.openMajorModal.bind(this);
        this.closeMajorModal = this.closeMajorModal.bind(this);
        this.getInterests = this.getInterests.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleHide = this.handleHide.bind(this);
    }


    handleShow(e) {
        e.preventDefault();
        this.setState({ imageActive: true })
    }

    handleHide(e) {
        e.preventDefault();
        this.setState({ imageActive: false })
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
    openJobTitleModal() {
        this.setState({
            jobTitleModalOpen: true
        })
    }
    closeJobTitleModal() {
        this.setState({
            jobTitleModalOpen: false
        }, () => {
            this.props.refreshProfile(ALUMNI, this.props.details._id)
        })
    }
    openCollegeModal() {
        this.setState({
            collegeModalOpen: true
        })
    }
    closeCollegeModal() {
        this.setState({
            collegeModalOpen: false
        }, () => {
            this.props.refreshProfile(ALUMNI, this.props.details._id)
        })
    }
    openCompanyModal() {
        this.setState({
            companyModalOpen: true
        })
    }
    closeCompanyModal() {
        this.setState({
            companyModalOpen: false
        }, () => {
            this.props.refreshProfile(ALUMNI, this.props.details._id)
        })
    }
    openMajorModal() {
        this.setState({
            majorModalOpen: true
        })
    }
    closeMajorModal() {
        this.setState({
            majorModalOpen: false
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
        let allInterests = this.props.details.interests
        return (
            <>
                {
                    allInterests.map(interest => {
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
                {
                    !this.props.isViewOnly &&
                    <>
                        <Button
                            primary
                            color="blue"
                            type="button"
                            size="mini"
                            onClick={() => {this.setState({interestsModalOpen: true})}}
                        >
                            {allInterests.length ? `Add more Interests` : `Add Interests`}
                            <Icon
                                name="add"
                                style={{
                                    'margin': '3px'
                                }}
                            />
                        </Button>
                        <InterestsUpdateModal
                            role={'alumni'}
                            modalOpen={this.state.interestsModalOpen}
                            closeModal={this.closeInterestsModal}
                            id={this.props.details._id}
                        />
                    </>
                }
            </>
        )
    }
    render() {
        const details = this.props.details;
        const isViewOnly = this.props.isViewOnly;
        const imageUploadButton = 
            <>
                <Button
                    style={{'width': '100%', 'align-self': 'center', 'margin': '5px 0 5px 0'}}
                    basic
                    verticalAlign='bottom'
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
        const dimmableImage = 
            <Dimmer.Dimmable as={Image}
                    dimmed={this.state.imageActive}
                    onMouseEnter={this.handleShow}
                    onMouseLeave={this.handleHide}
                    centered
                    size="medium"
                    src={details.imageURL}
                >
                    <Dimmer
                        active={this.state.imageActive}
                        inverted
                        verticalAlign='bottom'
                    >
                        {imageUploadButton}
                    </Dimmer>
                <Image 
                    centered
                    rounded
                    size="medium"
                    src={details.imageURL}
                />
            </Dimmer.Dimmable>
        return (
            <div>
            <Card fluid>
                {
                    isViewOnly ?
                    <Image 
                        centered
                        rounded
                        size="medium"
                        src={details.imageURL}
                    /> :
                    dimmableImage
                }
                <Card.Content>
                    <Card.Header>{details.name || 'Unavailable'}</Card.Header>
                    <Card.Meta>{details.jobTitleName || 'Unavailable'}
                        {
                            !isViewOnly ?
                                <>
                                    <Button
                                        style={{'margin': '0 0 2px 2px'}}
                                        icon
                                        inverted
                                        size="mini"
                                        onClick={this.openJobTitleModal}
                                    >
                                        <Icon name='pencil' color="blue"/>
                                    </Button>
                                    <JobTitleUpdateModal
                                        modalOpen={this.state.jobTitleModalOpen}
                                        closeModal={this.closeJobTitleModal}
                                        id={details._id}
                                    />
                                </>
                            : null
                        }
                    </Card.Meta>
                    <Card.Description>College: {details.collegeName || 'Unavailable'}
                        {
                            !isViewOnly ? 
                            <>
                                <Button
                                    style={{'margin': '0 0 2px 2px'}}
                                    icon
                                    inverted
                                    size="mini"
                                    onClick={this.openCollegeModal}
                                >
                                    <Icon name='pencil' color="blue"/>
                                </Button>
                                <CollegeUpdateModal
                                    modalOpen={this.state.collegeModalOpen}
                                    closeModal={this.closeCollegeModal}
                                    id={details._id}
                                />
                            </> : null
                        }
                    </Card.Description>
                    <Card.Description>Location: {(details.city && details.country) ? `${details.city} (${details.country})` : 'Unavailable'}
                        {
                            !isViewOnly ? 
                            <>
                                <Button
                                    style={{'margin': '0 0 2px 2px'}}
                                    icon
                                    inverted
                                    size="mini"
                                    onClick={this.openLocationUpdateModal}
                                >
                                    <Icon name='pencil' color="blue"/>
                                </Button>
                                <LocationUpdateModal
                                    modalOpen={this.state.locationModalOpen}
                                    closeModal={this.closeLocationUpdateModal}
                                    id={details._id}
                                />
                            </> : null
                        }
                    </Card.Description>
                    <Card.Description>Company: {details.companyName || 'Unavailable'}
                        {
                            !isViewOnly ? 
                            <>
                                <Button
                                    style={{'margin': '0 0 2px 2px'}}
                                    icon
                                    inverted
                                    size="mini"
                                    onClick={this.openCompanyModal}
                                >
                                    <Icon name='pencil' color="blue"/>
                                </Button>
                                <CompanyUpdateModal
                                    modalOpen={this.state.companyModalOpen}
                                    closeModal={this.closeCompanyModal}
                                    id={details._id}
                                />
                            </> : null
                        }
                    </Card.Description>
                    <Card.Description>Major: {details.majorName || 'Unavailable'}
                        {
                            !isViewOnly ? 
                            <>
                                <Button
                                    style={{'margin': '0 0 2px 2px'}}
                                    icon
                                    inverted
                                    size="mini"
                                    onClick={this.openMajorModal}
                                >
                                    <Icon name='pencil' color="blue"/>
                                </Button>
                                <MajorUpdateModal
                                    modalOpen={this.state.majorModalOpen}
                                    closeModal={this.closeMajorModal}
                                    id={details._id}
                                />
                            </> : null
                        }
                    </Card.Description>
                    
                </Card.Content>
                <Card.Content>
                    <Card.Header>Interests</Card.Header>
                    <Segment
                        loading={this.state.removingInterest}
                    >
                        {this.getInterests()}
                    </Segment>
                </Card.Content>
            </Card>
            <div padding-top="10px" />
            </div>
        )
    }
}