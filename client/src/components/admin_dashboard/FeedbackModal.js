import React, { useState, useEffect } from 'react';
import { Modal, Accordion, Icon, List } from 'semantic-ui-react'
import { makeCall } from '../../apis';

export default function FeedbackModal(props) {
    const [publicFeedback, setPublicFeedback] = useState([])
    const [privateFeedback, setPrivateFeedback] = useState([])
    const [testimonial, setTestimonial] = useState([])
    const [profile, setProfile] = useState(null)
    const [currIndex, setCurrIndex] = useState(-1)

    useEffect(() => {
        makeCall({}, `/admin/feedback/${props.userDetails}/${props.profileId}`, 'get')
            .then((res) => {
                setPublicFeedback(res.public)
                setPrivateFeedback(res.private)
                setTestimonial(res.testimonial)
                setProfile(res.profile)
            });
    }, [props])

    const handleClick = (e, titleProps) => {
        const { index } = titleProps
        const activeIndex = currIndex
        const newIndex = activeIndex === index ? -1 : index
        setCurrIndex(newIndex)
    }

    const constructDisplay = (feedback) => {
        let display = [];
        for (const response of feedback) {
            display.push(<List.Item>{response}</List.Item>);
        }
        return display;
    }

    return (
        <Modal open={props.modalOpen} onClose={props.toggleModal} closeIcon>
            <Modal.Header>Feedback for {profile && profile.name}</Modal.Header>
            <Modal.Content scrolling>
                <Accordion styled>
                    {publicFeedback && 
                        <Accordion.Title
                            active={currIndex === 0}
                            index={0}
                            onClick={handleClick.bind(this)}
                        >
                            <Icon name='dropdown' />
                            Public Feedback
                        </Accordion.Title>
                    }
                    <Accordion.Content active={currIndex === 0}>
                        <List bulleted divided>
                            {constructDisplay(publicFeedback)}
                        </List>
                    </Accordion.Content>
                    {privateFeedback && 
                        <Accordion.Title
                            active={currIndex === 1}
                            index={1}
                            onClick={handleClick.bind(this)}
                        >
                            <Icon name='dropdown' />
                            Private Feedback
                        </Accordion.Title>
                    }
                    <Accordion.Content active={currIndex === 1}>
                        <List bulleted divided>
                            {constructDisplay(privateFeedback)}
                        </List>
                    </Accordion.Content>
                    {testimonial && 
                        <Accordion.Title
                            active={currIndex === 2}
                            index={2}
                            onClick={handleClick.bind(this)}
                        >
                            <Icon name='dropdown' />
                            Testimonials
                        </Accordion.Title>
                    }
                    <Accordion.Content active={currIndex === 2}>
                        <List bulleted divided>
                            {constructDisplay(testimonial)}
                        </List>
                    </Accordion.Content>
                </Accordion>
            </Modal.Content>
        </Modal>
    )
}