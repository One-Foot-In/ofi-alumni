import React from 'react';
import { Grid, Card, Image, Transition, Segment, Header, Container } from 'semantic-ui-react'

export default function OurStory () {
    return (
        <Container>
            <Grid>
                <Grid.Row>
                    <Transition transitionOnMount={true} animation='fade down' duration={2000}>
                        <Segment
                            padded
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
                                <Image src='https://placedog.net/640/480?random' wrapped ui={false} />
                                <Card.Content>
                                <Card.Header>Reshad</Card.Header>
                                <Card.Meta>
                                    <span className='date'>Co-founder | CEO | CTO</span>
                                </Card.Meta>
                                <Card.Description>
                                    <i>
                                        <p>
                                        “I’m a Bangladeshi citizen who tumbled through a mess of application strategies to end up in college in the Boston area in 2014! The motivation, comfort, and guidance I was able to find during the application process without a doubt helped me secure an education in the United States. Coming from a family of limited means, I was incredibly grateful for the college experience I was able to enjoy, as a result of crowdsourcing guidance from my near-peers!
                                        </p>
                                        <p>
                                            This impetus to do pay mentorship forward, and streamline the flow of information so that you, as a student, are able to get the information you need, when you need it, was the impetus for me to co-found One Foot In. I believe near-peers are the best resources when it comes to providing guidance, motivation, and any other kind of counseling when it comes to you figuring out where you want to study, how you could be better using your time, or if you just want a peek into the catalogues of all career paths that your past generations of students around the world have embarked on.
                                        </p>
                                        <p>
                                            I believe One Foot In will serve as the community that can connect you to your near-peers, and motivate you to unlock the best version of yourself. I look forward to seeing you on the platform!”
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
                                <Image src='https://placedog.net/640/480?random' wrapped ui={false} />
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