import React, { Component } from 'react';
import { Button, Card, Image, Dimmer, Label, Segment, Icon } from 'semantic-ui-react';
import ImageUpdateModal from './ImageUpdateModal';
import DeleteAccountModal from './DeleteAccountModal';
import InterestsUpdateModal from './InterestsUpdateModal';
import { makeCall } from "../apis";
import FootyPoints from './FootyPoints';

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
            submittingRequest: false,
            imageActive: false
        }
        this.openImageModal = this.openImageModal.bind(this)
        this.closeImageModal = this.closeImageModal.bind(this)
        this.openInterestsModal = this.openInterestsModal.bind(this)
        this.closeInterestsModal = this.closeInterestsModal.bind(this)
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
        this.setState({submittingRequest: true},
            async () => {
                await makeCall({interestIdToRemove: interestIdToRemove}, `/student/interests/remove/${this.props.details._id}`, 'patch')
                this.setState({
                    submittingRequest: false
                }, () => 
                    this.props.refreshProfile(STUDENT, this.props.details._id)
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
                            role={'student'}
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
                    isAlumni={false}
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
                    <FootyPoints points={this.props.details.footyPoints} 
                                 style={ {'margin-left': 0,
                                          'margin-top': '3px',
                                          'margin-bottom': '2px'} } />
                    <Card.Description>Grade: {details.grade || 'Unavailable'}</Card.Description>
                </Card.Content>
                {
                    isViewOnly && !(details.interests.length) ?
                        null :
                        <Card.Content>
                            <Card.Header>Interests</Card.Header>
                            <Segment
                                loading={this.state.submittingRequest}
                            >
                                {this.getInterests()}
                            </Segment>
                        </Card.Content>
                }
                {
                    isViewOnly ?
                    null :
                    <Card.Content>
                        <DeleteAccountModal
                            logout={this.props.logout}
                            isAlumni={false}
                            id={this.props.details._id}
                        />
                    </Card.Content>
                }
            </Card>
            <div padding-top="10px" />
            </div>
        )
    }
}