import React, { useState, useEffect } from 'react';
import { Container, Statistic, Transition, Segment, Step, Icon, Header, Image } from 'semantic-ui-react'
import { makeCall } from '../apis';
import {black, darkBlack, grey} from "../colors"

export default function JoinUs (props) {
    const [counts, setCounts] = useState({})
    const [sendingRequest, setSendingRequest] = useState(false)
    const fetchCounts = () => {
        return makeCall({}, `/totalCounts`, 'get')
            .then(countsResponse => {
                if (countsResponse) {
                    setCounts(countsResponse)
                    setSendingRequest(false)
                } else {
                    // TODO: error
                    // Add error toast when we introduce toasts to system
                    setSendingRequest(false)
                }
            })
    }

    // Mounting
    useEffect(() => {
        setSendingRequest(true)
        fetchCounts()
    }, [props])
    return (
        <Container>
            <Segment
                loading={sendingRequest}
                textAlign='center'
                style={{backgroundColor: grey}}
            >
                <Transition transitionOnMount={true} animation='fade right' duration={1000}>
                    <Statistic.Group
                        textAlign='center'
                    >
                        <Statistic
                            color='grey'
                        >
                            <Statistic.Value>{counts.studentsCount}</Statistic.Value>
                            <Statistic.Label>Students</Statistic.Label>
                        </Statistic>
                        <Statistic
                            color='yellow'
                        >
                            <Statistic.Value>{counts.alumniCount}</Statistic.Value>
                            <Statistic.Label>Alumni Mentors</Statistic.Label>
                        </Statistic>
                        <Statistic
                            color='orange'
                        >
                            <Statistic.Value>{counts.schoolsCount}</Statistic.Value>
                            <Statistic.Label>Schools</Statistic.Label>
                        </Statistic>
                    </Statistic.Group>
                </Transition>
            </Segment>
            <Transition transitionOnMount={true} animation='fade down' duration={2000}>
                <Segment
                    textAlign='center'
                    inverted
                    style={{backgroundColor: darkBlack}}
                >
                    <Header as='h2'>
                        What you'll get
                    </Header>
                    <Image floated='left' src={require('./image_assets/what_you_will_get.png')} size='large' />
                    <p>
                        First and foremost - you’ll have access to your school’s alumni network. Because individual schools vary immensely in terms of how well they maintain this, we want to unlock massive dormant opportunities in these connections. Our product also lets students interact with these mentors (and other students) through our native application. Soon, students will be able to access mentors from other schools in their region and those outside their regions as well. In essence, we’re part LinkedIn (for the connections), part Facebook (the interactional component) and part admissions forums (for the content and information). Power of three trends bundled in one purpose-built platform, made by folks with a deep mission and comprising mentors that have opted in proactively to give back equates to a powerful self-reinforcing engine that hopefully enables students to reach their fullest potential. 
                    </p>
                </Segment>
            </Transition>
            <Transition transitionOnMount={true} animation='fade down' duration={2000}>
                <Segment
                    inverted
                    style={{backgroundColor: black}}
                >
                    <Header as='h2'>
                        Why we think you could benefit from it
                    </Header>
                    <Step.Group
                        stackable
                        centered
                        vertical
                    >
                        <Step>
                            <Icon name='unlock' color='grey'/>
                            <Step.Content>
                                <Step.Title>Access</Step.Title>
                                <Step.Description>
                                    We aim to surface the most critical information needed to succeed in your later years of high school and in the journey to applying for college 
                                </Step.Description>
                            </Step.Content>
                        </Step>
                        <Step>
                            <Icon name='handshake' color='yellow'/>
                            <Step.Content>
                                <Step.Title>Mentorship</Step.Title>
                                <Step.Description>
                                    Our alumni base while holistic are self-selective in terms of involvement and purpose. Alumni opt-into the service if they so wish and get as involved as they find fit - removing the risk of being connected with disengaged mentors 
                                </Step.Description>
                            </Step.Content>
                        </Step>
                        <Step>
                            <Icon name='connectdevelop' color='orange'/>
                            <Step.Content>
                                <Step.Title>Network</Step.Title>
                                <Step.Description>
                                    Your school may not have done a great job (or maybe they have) in keeping your alumni directory up to date but our self-reinforcing model by design is conducive to being as complete and up-to-date as possible. Further, you’ll have access to students and mentors from other schools enabling you to grow your personal network
                                </Step.Description>
                            </Step.Content>
                        </Step>
                        <Step>
                            <Icon name='briefcase' color='yellow'/>
                            <Step.Content>
                                <Step.Title>Other Opportunities</Step.Title>
                                <Step.Description>
                                    We believe learning is a continuum and a lifelong journey. We enable mentors to engage students, and students to engage other students for anything and everything that fits under our general terms of service (volunteer work opportunities, shadowing professionals, projects, etc.)
                                </Step.Description>
                            </Step.Content>
                        </Step>
                    </Step.Group>
                </Segment>
            </Transition>
        </Container>
    )
}