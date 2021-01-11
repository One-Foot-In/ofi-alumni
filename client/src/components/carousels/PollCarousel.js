import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext } from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";

import React, { useState, useEffect } from "react";
import { Message, Grid, Segment, List, Label, Button, Feed, Image, Card } from "semantic-ui-react";
import { makeCall } from "../../apis";

/*
    userId
    isAlumni - an alumnus will see a mini-story prompt and an student will see opportunities
    alumniOrStudentId
*/
export default function PollCarousel(props) {
    const [display, setDisplay] = useState([])
    const [polls, setPolls] = useState([])
    const [opportunities, setOpportunities] = useState([])
    const [sendingRequest, setSendingRequest] = useState(false)

    const constructPolls = () => {
        let constructedDisplays = []
        for (let poll of polls) {
            if (!poll.options.length && !poll.allowsInput) {
                // announcement
                constructedDisplays.push(
                    <Slide
                        index={polls.indexOf(poll)}
                    >
                        {constructAnnouncement(poll)}
                    </Slide>
                    )
            } else if (poll.options.length && poll.allowsInput) {
                // input-enabled poll
                constructedDisplays.push(
                    <Slide
                        index={polls.indexOf(poll)}
                    >
                        {constructInputEnabledPoll(poll)}
                    </Slide>
                    )
            } else {
                // non-input-enabled poll
                constructedDisplays.push(
                    <Slide
                        index={polls.indexOf(poll)}
                    >
                        {constructNoInputEnabledPoll(poll)}
                    </Slide>
                    )
            }
        }
        for (let opportunity of opportunities) {
            constructedDisplays.push(
                <Slide
                    index={opportunities.indexOf(opportunity) + polls.length}
                >
                    {constructOpportunityCard(opportunity)}
                </Slide>
            )
        }
        setDisplay(constructedDisplays)
    }

    // Mounting
    useEffect(() => {
        makeCall({}, '/polls/' + props.userId, 'get')
            .then(pollsResponse => {
                if (pollsResponse) {
                    setPolls(pollsResponse.polls)
                }
            })
            .then(() => {
                if (props.isAlumni) {
                    // fetch story prompts
                } else {
                    // fetch opportunities
                    makeCall({}, `/student/opportunities/${props.alumniOrStudentId}`, 'get')
                        .then(opportunitiesResponse => {
                            if (opportunitiesResponse) {
                                setOpportunities(opportunitiesResponse.opportunities)
                            }
                        })
                }
            })
    }, [props])

    useEffect(() => {
        constructPolls()
    }, [polls, opportunities])

    const handlePollAcknowledge = (e, {pollId}) => {
        setSendingRequest(true)
        makeCall({},
        `/acknowledgePoll/${pollId}/${props.userId}`,
        'patch'
        ).then((res) => {
            if (res.error) {
                // error
                // TODO: Add error toast
                setSendingRequest(false)
            } else {
                // refetch all polls
                makeCall({}, '/polls/' + props.userId, 'get').then((pollsResponse) => {
                    if (pollsResponse) {
                        setPolls(pollsResponse.polls)
                    }
                })
                setSendingRequest(false)
            }
        })
    }

    const handlePollOptionSelect = (e, {optionId, pollId}) => {
        setSendingRequest(true)
        makeCall({},
        `/answerPoll/${pollId}/${optionId}/${props.userId}`,
        'patch'
        ).then((res) => {
            if (res.error) {
                // error
                // TODO: Add error toast
                setSendingRequest(false)
            } else {
                // refetch all polls
                makeCall({}, '/polls/' + props.userId, 'get').then((pollsResponse) => {
                    if (pollsResponse) {
                        setPolls(pollsResponse.polls)
                    }
                })
                setSendingRequest(false)
            }
        })
    }

    const handleOpportunityBookmarkSelect = (e, {bookmarked, opportunityId}) => {
        setSendingRequest(true)
        makeCall({
            bookmarked: bookmarked,
            opportunityId: opportunityId
        },
        `/student/opportunity/interact/${props.alumniOrStudentId}`,
        'patch'
        ).then((res) => {
            if (res.error) {
                // error
                // TODO: Add error toast
                setSendingRequest(false)
            } else {
                // refetch all polls
                makeCall({}, `/student/opportunities/${props.alumniOrStudentId}`, 'get')
                .then(opportunitiesResponse => {
                    if (opportunitiesResponse) {
                        setOpportunities(opportunitiesResponse.opportunities)
                    }
                })
                setSendingRequest(false)
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

    const constructOpportunityCard = (opportunity) => {
        return (
            <Segment
                style={{
                    margin: '2px'
                }}
            >
                <Card
                    centered
                >
                    <Card.Content>
                    <Image avatar circular src={opportunity.owner.imageURL} />
                    <Card.Meta>
                        <b>{opportunity.owner.name}</b> has posted an opportunity relevant to you!
                    </Card.Meta>
                    <Card.Description>
                        {opportunity.description}
                    </Card.Description>
                    </Card.Content>
                    {
                        (opportunity.deadline || opportunity.link) ?
                        <Card.Content extra>
                        {
                                opportunity.deadline ?
                                <Feed.Extra>
                                    Deadline: {opportunity.deadline}
                                </Feed.Extra>
                                : null
                            }
                            {
                                opportunity.link ?
                                <Feed.Like>
                                    <a href={opportunity.link}> Click here for details </a>
                                </Feed.Like>
                                : null
                            }
                        </Card.Content>
                        :
                        null
                    }
                    <Card.Content extra>    
                        <Button.Group>                
                            <Button 
                                tiny
                                basic
                                green
                                color="blue"
                                bookmarked={true}
                                opportunityId={opportunity._id}
                                onClick={handleOpportunityBookmarkSelect.bind(this)}
                            >
                                Bookmark!
                            </Button>
                            <Button
                                tiny
                                basic
                                color="red"
                                bookmarked={false}
                                opportunityId={opportunity._id}
                                onClick={handleOpportunityBookmarkSelect.bind(this)}
                            >
                                Pass!
                            </Button>
                        </Button.Group>
                    </Card.Content>
                </Card>
            </Segment>
        )
    }

    return (
        (polls.length || opportunities.length) ? 
        <CarouselProvider
            naturalSlideWidth={100}
            naturalSlideHeight={125}
            totalSlides={polls.length + opportunities.length}
        >
            <Segment
                loading={sendingRequest}
                disabled={sendingRequest}
            >
                <Grid
                    loading={sendingRequest}
                    disabled={sendingRequest}
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
                                maxHeight: '300px',
                            }}
                        >
                            {display}
                        </Slider>
                    </Grid.Row>
                    <Grid.Row
                        centered
                        padded
                    >
                        {
                            polls.length > 1 ?
                            <Button.Group>                
                                <Button 
                                    as={ButtonBack}
                                    style={{
                                        marginRight: '2px',
                                    }}
                                    tiny
                                    basic
                                    color="blue"
                                >
                                    Back
                                </Button>
                                <Button
                                    as={ButtonNext}
                                    style={{marginLeft: '2px'}}
                                    tiny
                                    basic
                                    color="blue"
                                >
                                    Next
                                </Button>
                            </Button.Group>
                            : null
                        }
                    </Grid.Row>
                </Grid>
            </Segment>
        </CarouselProvider>
        : null
    )
}