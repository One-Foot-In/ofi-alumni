import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";

import React, { useState, useEffect } from "react";
import { Message, Grid, Segment, List, Label, Button } from "semantic-ui-react";
import { makeCall } from "../../apis";

/*
    pollsQueued
    userId
*/
export default function PollCarousel(props) {
    const [pollsDisplay, setPollsDisplay] = useState([])
    const [polls, setPolls] = useState([])
    const [sendingPoll, setSendingPoll] = useState(false)

    const constructPolls = () => {
        let constructedPollDisplays = []
        for (let poll of polls) {
            if (!poll.options.length && !poll.allowsInput) {
                // announcement
                constructedPollDisplays.push(
                    <Slide
                        index={polls.indexOf(poll)}
                    >
                        {constructAnnouncement(poll)}
                    </Slide>
                    )
            } else if (poll.options.length && poll.allowsInput) {
                // input-enabled poll
                constructedPollDisplays.push(
                    <Slide
                        index={polls.indexOf(poll)}
                    >
                        {constructInputEnabledPoll(poll)}
                    </Slide>
                    )
            } else {
                // non-input-enabled poll
                constructedPollDisplays.push(
                    <Slide
                        index={polls.indexOf(poll)}
                    >
                        {constructNoInputEnabledPoll(poll)}
                    </Slide>
                    )
            }
        }
        setPollsDisplay(constructedPollDisplays)
    }

    // Mounting
    useEffect(() => {
        makeCall({}, '/polls/' + props.userId, 'get')
            .then(pollsResponse => {
                if (pollsResponse) {
                    setPolls(pollsResponse.polls)
                }
            })
    }, [props])

    useEffect(() => {
        constructPolls()
    }, [polls])

    const handlePollAcknowledge = (e, {pollId}) => {
        setSendingPoll(true)
        makeCall({},
        `/acknowledgePoll/${pollId}/${props.userId}`,
        'patch'
        ).then((res) => {
            if (res.error) {
                // error
                // TODO: Add error toast
                setSendingPoll(false)
            } else {
                // refetch all polls
                makeCall({}, '/polls/' + props.userId, 'get').then((pollsResponse) => {
                    if (pollsResponse) {
                        setPolls(pollsResponse.polls)
                    }
                })
                setSendingPoll(false)
            }
        })
    }

    const handlePollOptionSelect = (e, {optionId, pollId}) => {
        setSendingPoll(true)
        makeCall({},
        `/answerPoll/${pollId}/${optionId}/${props.userId}`,
        'patch'
        ).then((res) => {
            if (res.error) {
                // error
                // TODO: Add error toast
                setSendingPoll(false)
            } else {
                // refetch all polls
                makeCall({}, '/polls/' + props.userId, 'get').then((pollsResponse) => {
                    if (pollsResponse) {
                        setPolls(pollsResponse.polls)
                    }
                })
                setSendingPoll(false)
            }
        })
    }

    const constructAnnouncement = (poll) => {
        return (
            <Segment
                style={{
                    margin: '2px'
                }}
            >
                <Message
                    tiny
                    color='green'
                >
                    {poll.prompt}
                </Message>
                <Button
                    pollId={poll._id}
                    color="green"
                    onClick={handlePollAcknowledge.bind(this)}
                >
                    Acknowledge
                </Button>
            </Segment>
        )
    }

    /*
        Currently not enabled
    */
    const constructInputEnabledPoll = (poll) => {
        return (
            <Segment
                style={{
                    margin: '2px'
                }}
            >
                <Message
                    tiny
                    color='yellow'
                >
                    {poll.prompt}
                </Message>
                <List>
                    {poll.options.map(option => {
                        return (
                            <List.Item>
                                {option.optionText}
                            </List.Item>
                        )
                    })}
                </List>
            </Segment>
        )
    }

    const constructNoInputEnabledPoll = (poll) => {
        return (
            <Segment
                style={{
                    margin: '2px'
                }}
            >
                <Message
                    tiny
                    color='yellow'
                >
                    {poll.prompt}
                </Message>
                <List
                    divided
                    selection
                >
                    {poll.options.map(option => {
                        return (
                            <List.Item
                                onClick={handlePollOptionSelect.bind(this)}
                                optionId={option._id}
                                pollId={poll._id}
                            >
                                {option.optionText}
                                {option.responders.length ?
                                    <Label
                                        color='orange'
                                        horizontal
                                        style={{
                                            marginLeft: '5px'
                                        }}
                                    >
                                        {option.responders.length}
                                    </Label>
                                    : null
                                }
                            </List.Item>
                        )
                    })}
                </List>
            </Segment>
        )
    }
    return (
        polls.length ? 
        <CarouselProvider
            naturalSlideWidth={100}
            naturalSlideHeight={125}
            totalSlides={polls.length}
        >
            <Segment
                loading={sendingPoll}
                disabled={sendingPoll}
            >
                <Grid
                    loading={sendingPoll}
                    disabled={sendingPoll}
                >
                    <Grid.Row
                        centered
                        padded
                    >
                        <Message info>
                            We have announcements for you, and we'd love your input!
                        </Message>
                    </Grid.Row>
                    <Grid.Row
                        centered
                        padded
                    >
                        <Slider
                            style={{
                                width: '50%',
                                maxHeight: '250px',
                            }}
                        >
                            {pollsDisplay}
                        </Slider>
                    </Grid.Row>
                    <Grid.Row
                        centered
                        padded
                    >
                        {
                            polls.length > 1 ?
                            <>                
                                <ButtonBack
                                    style={{marginRight: '2px'}}
                                >
                                    Back
                                </ButtonBack>
                                <ButtonNext
                                    style={{marginLeft: '2px'}}
                                >
                                    Next
                                </ButtonNext>
                            </>
                            : null
                        }
                    </Grid.Row>
                </Grid>
            </Segment>
        </CarouselProvider>
        : null
    )
}