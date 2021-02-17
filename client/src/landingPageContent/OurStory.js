import React from 'react';
import { Grid, Card, Image, Transition, Segment, Header, Container } from 'semantic-ui-react'
import {darkBlack, black} from "../colors"

export default function OurStory () {
    return (
        <Container>
            <Grid>
                <Grid.Row style={{margin: '0 10px 0 10px'}}>
                    <Transition transitionOnMount={true} animation='fade down' duration={2000}>
                        <Segment
                            inverted
                            style={{backgroundColor: darkBlack}}
                        >
                            <Header as='h2'>
                                The Genesis
                            </Header>
                            <p>
                                Reshad & Mir met in 2012 through complete coincidence. Reshad had reached out to Mir on Facebook after finding him on a forum “Bangladeshis Beyond Borders” - a group with 50k users geared to students from Bangladesh who are now predominantly living in the West. Reshad reached out to Mir for some guidance on his personal statement and after a series of conversations leading up to Reshad’s applications during which they collaborated, their relationship fizzled out. 
                            </p>
                        </Segment>
                    </Transition>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column
                        centered
                    >
                        <Transition transitionOnMount={true} animation='fade down' duration={2000}>
                            <Card>
                                <Image src={require('./image_assets/reshad.jpg')} wrapped ui={false} />
                                <Card.Content>
                                <Card.Header>Reshad</Card.Header>
                                <Card.Meta>
                                    <span className='date'>Co-founder | CEO | CTO</span>
                                </Card.Meta>
                                <Card.Description>
                                    <i>
                                        <p>
                                            “I remember how confused I was during my gap year between high school graduation and college admission. Who else was on the same boat as I was? How do I present my portfolio and my statement in a way that puts my best foot forward?
                                        </p>
                                        <p>
                                            Thankfully, I was fortunate enough to have mentors, including alumni at my high school, who were able to offer help at different points along my application. I realize looking back that getting the best guidance has the ingredients of having access to relatable mentors who can give you the most relevant and recent information, knowing the right questions to ask, and knowing when to ask these questions.
                                        </p>
                                        <p>
                                            As an international student coming from limited means, I feel blessed to have had the opportunity to have completed an undergraduate education in the USA. Even as I navigate the world of opportunities post-graduation, the mentorship of near-peers is an indispensable trail map in my journey forward.
                                        </p>
                                        <p>
                                            I believe One Foot In can serve as the platform that can bring near-peer mentors and students together in a sustainable framework of mentorship, that helps students discover the best version of themselves, as they prepare for the world beyond high school.”
                                        </p>
                                    </i>
                                </Card.Description>
                                </Card.Content>
                            </Card>
                        </Transition>
                    </Grid.Column>
                    <Grid.Column
                        centered
                    >
                        <Transition transitionOnMount={true} animation='fade down' duration={2000}>
                            <Card>
                                <Image src={require('./image_assets/mir.jpg')} wrapped ui={false} />
                                <Card.Content>
                                <Card.Header>Mir</Card.Header>
                                <Card.Meta>
                                    <span className='date'>Co-founder | CFO | COO</span>
                                </Card.Meta>
                                <Card.Description>
                                    <i>
                                        <p>
                                            “I am a Bangladeshi immigrant who moved to the Bay Area last year after spending 3 years on the east coast. I co-founded One Foot In to actualize my personal mission of access, equity and equality, especially geared toward underserved populations.
                                        </p>
                                        <p>
                                            Born in Bangladesh to a lower-middle-class family, I've seen firsthand the impact that access to education can have on one's life. My father immigrated from Bangladesh to Dubai, UAE when I was merely 1 year old - with the goal to give my brother and I access to proper education as a means to elevate our socio-economic status. Everything my parents have done has been geared toward providing us opportunities that they personally didn't have. This narrative has shaped my worldview and my values and witnessing first-hand their sacrifices has instilled in me a fierce motivation to aim high personally and give back to the community.
                                        </p>
                                        <p>
                                            Throughout college and beyond, my guiding force has always been helping the community both directly and through organizational change. My first work experience was interning at a non-profit education organization in rural Ghana while in college – where my team helped school administrators think through how to best revamp their curriculum away from routine and monotony. The fulfillment from the summer experience drove me toward pursuing future leadership roles to help the community where I could.
                                        </p>
                                        <p>
                                            I am extremely fortunate and feel compelled to give back to the community (defined in the broadest way possible) and believe OFI is the engine and the machine that will help me help you!”
                                        </p>
                                    </i>
                                </Card.Description>
                                </Card.Content>
                            </Card>
                        </Transition>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>
    )
}