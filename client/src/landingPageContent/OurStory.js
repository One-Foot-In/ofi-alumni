import React from 'react';
import { Container, Step, Icon, Transition, Statistic } from 'semantic-ui-react'

export default function OurStory () {
    return (
        <Container
        >
            <Step.Group
                stackable
                centered
            >
                <Transition transitionOnMount={true} animation='fade right' duration={1000}>
                    <Step>
                        <Icon name='magic' />
                        <Step.Content>
                            <Step.Title>Humble Beginnings</Step.Title>
                            <Step.Description
                                style={{
                                    maxWidth: '300px'
                                }}
                            >
                                This is how we began. Rad, right?
                            </Step.Description>
                        </Step.Content>
                    </Step>
                </Transition>
                <Transition transitionOnMount={true} animation='fade right' duration={2000}>
                    <Step active>
                        <Icon name='bullseye' />
                        <Step.Content>
                            <Step.Title>Where we are</Step.Title>
                            <Step.Description
                                style={{
                                    maxWidth: '300px'
                                }}
                            >
                                This is how our journey's been going so far. Wanna hop on board?
                            </Step.Description>
                        </Step.Content>
                    </Step>
                </Transition>
                <Transition transitionOnMount={true} animation='fade right' duration={3000}>
                    <Step>
                        <Icon name='paper plane outline' />
                        <Step.Content>
                            <Step.Title>To the mooooon</Step.Title>
                            <Step.Description
                                style={{
                                    maxWidth: '300px'
                                }}
                            >
                                Get those paper hands outta here
                            </Step.Description>
                        </Step.Content>
                    </Step>
                </Transition>
            </Step.Group>
            <Statistic.Group
                textAlign='center'
            >
                <Transition transitionOnMount={true} animation='fade right' duration={1000}>
                    <Statistic
                        color='grey'
                    >
                        <Statistic.Value>100</Statistic.Value>
                        <Statistic.Label>Members on site</Statistic.Label>
                    </Statistic>
                </Transition>
                <Transition transitionOnMount={true} animation='fade right' duration={1000}>
                    <Statistic
                        color='yellow'
                    >
                        <Statistic.Value>2</Statistic.Value>
                        <Statistic.Label>Schools onboarded</Statistic.Label>
                    </Statistic>
                </Transition>
                <Transition transitionOnMount={true} animation='fade right' duration={1000}>
                    <Statistic
                        color='orange'
                    >
                        <Statistic.Value>22</Statistic.Value>
                        <Statistic.Label>Mentorship pairings</Statistic.Label>
                    </Statistic>
                </Transition>
            </Statistic.Group>
        </Container>
    )
}