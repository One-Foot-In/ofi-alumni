import React, { Component } from 'react';
import {Button, Modal } from 'semantic-ui-react';

/*
    props:
    - modalOpen
    - closeModal: ()
    - isAlumni
*/

const getAlumniTerms = () => {
    return <>
        <p>
        We are excited you are joining One Foot In! Mentors are the lifeblood of our platform. You may use our platform to connect with other alumni in your school network, and in that sense use the platform as a directory for your school’s alumni network. However, we do not by any means represent any schools or universities themselves, but rather provide a context in which members of these communities can interact.
        </p>
        <p>
        As a mentor, you are strongly encouraged to offer <strong>topics of consultancy</strong> and <strong>recurring weekly times of availability</strong> to allow students/mentees from your school network to request a call with you. You should be able to track all the requests made to you via our web portal. Please be sure to add your <strong>Zoom personal meeting room link</strong> to be able to start meetings from within our portal (You can add the Zoom meeting link post-registration using the Meeting Settings sub-tab in the Mentorship tab).  
        </p>
        <p>
        We encourage our students/mentees to connect with mentors via our web portal, and we would like to encourage you to interact with mentees the same way. While an off-channel interaction with students might make for a more informal conversation with quicker response cycles, such an interaction opens the doors for our mentors being inundated on social media / personal communication channels. We are better able to connect mentees and mentors if we are able to build our system on these records of calls, leveraging insights from the member profiles and topics associated with these call records. We are also unable to mediate violations of our community standards when calls happen outside of our web portal. 
        </p>
    </>
}

const getStudentTerms = () => {
    return <>
        <p>
        We are excited you are joining One Foot In! Our platform is built with the needs of you, the mentee, at its heart!
        </p>
        <p>
        As a student, you must acknowledge that you are over 13 years of age at the time of registration. One Foot In is not open to students under the age of 13.   
        </p>
        <p>
        Additionally, we do not by any means represent any schools or universities themselves, but rather provide a context in which members of these communities can interact. 
        </p>
        <p>
        We do not guarantee results, and will not be bound to deliver on any promises made by our mentors. The mentors on the network are their own advocates, and are expected to offer advice that is informed by their own unique life experiences and outcomes. We believe this unmediated mentorship offers the most value in terms of bringing diverse perspectives, lifepaths, and stories that lets you make an authentic connection.
        </p>
        <p>
        We strongly encourage communicating with mentors via the web portal. Understand that mentors chose to use our platform because they want to be able to serve you on their terms and at their convenience. We believe inundating the social media accounts or other means of correspondences are not a sustainable way to solicit help from mentors. We at One Foot In go to vast lengths to ensure accountability of mentors to mentees for all requests that happen via our platform. We allow students to offer feedback, both privately to One Foot In moderators and publicly for their peers to see, which adds to the accountability and quality control of the service that is offered.
        </p>
        <p>
        We also yearn to build a record of activity of mentees when interactions/calls occur through our platform. The profile we build for you via the interactions you make on our platform will help our systems to connect you to mentors who might be a good fit for your interests, and to identify opportunities for you.
        </p>
    </>
}

export default class TermsOfAgreementModal extends Component {
    constructor(props) {
        super(props)
    }
    
    render() {
        return (
            <Modal
                open={this.props.modalOpen}
                style={{overflow: 'auto', maxHeight: 600}}
            >
                <Modal.Header>Terms Of Agreement</Modal.Header>
                <Modal.Content>
                    <p>
                    Welcome to <strong>One Foot In</strong> - a platform built with the intent to connect <strong>high schoolers</strong> to <strong>near-peer alumni</strong> in their school networks and beyond!
                    Our goal is to enable students to take charge of their own potential, and guide them toward engagements that help them become a more accomplished and truer version of themselves.
                    </p>
                    <p>
                    We use cookies to personalize your experience, for example, to persist your login session.
                    </p>
                    {this.props.isAlumni ? getAlumniTerms() : getStudentTerms()}
                    <p>
                    Please note that we allow both parties to provide feedback following a call.
                    We are dedicated to creating a welcoming and safe community and we do reserve the right to ban/suspend members on grounds of <strong>inappropriate, discriminatory, or discourteous behavior</strong>.
                    </p>
                    <p>
                    Please reach out to <strong>reshadbinharun@gmail.com</strong> for any concerns, queries, or feedback you have! We would love to hear from you!
                    </p>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.close}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}