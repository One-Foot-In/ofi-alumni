import React from 'react';
import { Container, Step, Icon, Transition, Header, Segment } from 'semantic-ui-react'

export default function AboutUs() {
    return (
        <Container>
            <Segment.Group stacked>
                <Transition transitionOnMount={true} animation='fade down' duration={1000}>
                    <Segment>
                        <Header as='h2'>
                            The Problem
                        </Header>
                        <p>
                        Access to quality education is as much of a financial problem as it is about access to the right information. We live in an increasingly globalized world where the rapid proliferation of the internet and online forums have opened up channels of communication with a quantum leap over the past decade and consequently the average person is now fewer degrees of separation away from each other than ever before. It is now easier to access the world’s information and connect with people across the globe than ever before and yet there are silos and closed networks where the participants are structurally marginalized. We believe this problem is particularly pronounced when it comes to education and are on a mission to attack it. 
                        </p>
                        <p>
                            We target primarily students that have access to the infrastructure and often the means to pursue the best education (often through the myriads of generous scholarships from philanthropists and institutions alike) but lack the following:
                        </p>
                        <Step.Group
                            stackable
                            centered
                            vertical
                        >
                            <Step>
                                <Icon name='check' color='green'/>
                                <Step.Content>
                                    <Step.Description>
                                        A <b>trust-worthy</b> platform without the noise (this rules out the most common social media platforms) 
                                    </Step.Description>
                                </Step.Content>
                            </Step>
                            <Step>
                                <Icon name='check' color='green'/>
                                <Step.Content>
                                    <Step.Description>
                                        A platform where they can connect with folks they can <b>relate with</b> (this rules out outsourced, and expensive third-party professional services)
                                    </Step.Description>
                                </Step.Content>
                            </Step>
                            <Step>
                                <Icon name='check' color='green'/>
                                <Step.Content>
                                    <Step.Description>
                                        A platform that is driven first-and-foremost by the <b>alignment</b> of incentives vs. financial gains
                                    </Step.Description>
                                </Step.Content>
                            </Step>
                        </Step.Group>
                    </Segment>
                </Transition>
                <Transition transitionOnMount={true} animation='fade down' duration={2000}>
                    <Segment>
                        <Header as='h2'>
                            The Solution
                        </Header>
                        <p>
                            Enter One Foot In -- a near-peer mentor network where students are able to interact with alumni from their own schools and other schools in similar domains, all in a moderated platform, with access to the most crucial information and a way to connect with like-minded folks and mentors alike in a mission-driven domain. 
                        </p>
                        <p>
                            Our aim is to empower students where their own counselors fall short - a problem particularly prominent in schools that are not sufficiently funded or those that have prioritized other avenues with their limited budgets. 
                        </p>
                        <p>
                            We believe people inherently want to do good. We think this is even more true for those that have gone through the process themselves and feel compelled to pay it forward. Combine that with a small financial incentive, and we believe this can be an extremely powerful engine for democratizing information and access to mentorship. 
                        </p>
                    </Segment>
                </Transition>
                <Transition transitionOnMount={true} animation='fade down' duration={2000}>
                    <Segment>
                        <Header as='h2'>
                            Why now
                        </Header>
                        <p>
                            2020 has been a pivotal year in many ways, and diversity & inclusion have fortunately been in the spotlight on numerous occasions as we rethink if our nation and our world is systematically structured to enable anyone, from any background to have fair access to opportunity and access to the most basic human needs - safety, education, necessities, shelter, healthcare, and justice.
                        </p>
                        <p>
                            Questions around educational reform in the US have taken a front seat with secular shifts in how we operate in a post-pandemic world and with changes in our leadership. Frequently, we at One Foot In have found ourselves approached by students with key questions around when and how to go college, where to apply, if it’s even worth it if classes are remote, how campuses are being impact and what they’re doing to control outbreak within their boundaries, what the pulse on employment and sectors hiring is, etc. While we were able to handle these questions ourselves for a smaller volume of requests, ability to make the platform scalable across hundreds of schools across countries and continents has always been our #1 mission. We believe alumni from each of these schools are not only the best folks to guide prospective college students with these questions because of their proximity (in years) to the process but are also the folks that our students feel most comfortable with.
                        </p>
                    </Segment>
                </Transition>
                <Transition transitionOnMount={true} animation='fade down' duration={2000}>
                    <Segment>
                        <Header as='h2'>
                            Where we come in
                        </Header>
                        <p>
                            We’ve been at it at OFI for almost 4 years with the central mantra to provide access to information to high school students but Covid has made us think long and hard about our approach. While the goal has always remained the same, we’ve been flexible in our approach.
                        </p>
                        <p>
                            In version 1.0, we were laser-focused on helping students with their personal statements. We had chosen this as our wedge since it’s the one component of college applications that was repeatedly most overlooked and most under-emphasized. Students were consistently writing impersonal, half-baked essays to no fault of their own but rather a lack of emphasis from their counsellors and teachers alike. We offered our services through a network of mentors who we vetted for competence and motivation and after seeing solid success and hearing testimonials, we expanded our offerings to the entire college process - OFI version 2.0. This is when we expanded our network of mentors to 15+ dedicated folks and approached one school at a time, selling the product to school administrators and counselors. 
                        </p>
                        <p>
                            However, Covid has us taught us 3 things:
                        </p>
                        <Step.Group
                            stackable
                            centered
                            vertical
                        >
                            <Step>
                                <Icon name='users' color='grey'/>
                                <Step.Content>
                                    <Step.Description>
                                        At times of stress and generally for the most important life decisions, people are more receptive to mentorship from whom they share some common ground with
                                    </Step.Description>
                                </Step.Content>
                            </Step>
                            <Step>
                                <Icon name='university' color='yellow'/>
                                <Step.Content>
                                    <Step.Description>
                                        Education is a continuum and in an increasingly online world, studies, work and personal development can coexist and we want to enable that through long-term deep relationship building
                                    </Step.Description>
                                </Step.Content>
                            </Step>
                            <Step>
                                <Icon name='star' color='orange'/>
                                <Step.Content>
                                    <Step.Description>
                                        It's most effective to go through students vs. school administrators. Our students see the value in the product and love sharing it with their peers while administrators, busy with their day-today-day school-related goals, sometimes find it difficult to relate to the fundamental problem that we’re trying to solve 
                                    </Step.Description>
                                </Step.Content>
                            </Step>
                        </Step.Group>
                        <p>
                            Enter - OFI version 3.0 our latest (and hopefully final!) pivot. Here we onboard students directly and go-to-market one school at a time building the network of alumni and current students who can then interact in whatever capacity they wish within our broadly defined parameters of education, professional development and mentorship generally. 
                        </p>
                    </Segment>
                </Transition>
                </Segment.Group>
        </Container>
    )
}