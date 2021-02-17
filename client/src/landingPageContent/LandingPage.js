import React, { useState} from 'react';
import { Container, Menu, Segment } from 'semantic-ui-react'
import OurStory from "./OurStory"
import AboutUs from "./AboutUs"
import JoinUs from "./JoinUs"
import FAQs from "./FAQs"

export default function LandingPage () {
    const [activeItem, setActiveItem] = useState("aboutUs")

    const handleItemClick = (e, { id }) => setActiveItem(id)
    return (
        <Container
            centered
            fluid
        >
            <div
                style={{
                    opacity: 0.7
                }}
            >
                <Menu attached='top' tabular stackable>
                    <Menu.Item
                        id='aboutUs'
                        name='About Us'
                        active={activeItem === 'aboutUs'}
                        onClick={handleItemClick}
                    />
                    <Menu.Item
                        id='joinUs'
                        name='Join Us'
                        active={activeItem === 'joinUs'}
                        onClick={handleItemClick}
                    />
                     <Menu.Item
                        id='ourStory'
                        name='OurStory'
                        active={activeItem === 'ourStory'}
                        onClick={handleItemClick}
                    />
                    <Menu.Item
                        id='faqs'
                        name='FAQs'
                        active={activeItem === 'faqs'}
                        onClick={handleItemClick}
                    />
                </Menu>
                <Segment
                    attached='bottom'
                >
                    {
                        activeItem === 'aboutUs' &&
                        <AboutUs/>
                    }
                    {
                        activeItem === 'joinUs' &&
                        <JoinUs/>
                    }
                    {
                        activeItem === 'ourStory' &&
                        <OurStory/>
                    }
                    {
                        activeItem === 'faqs' &&
                        <FAQs/>
                    }
                </Segment>
            </div>
        </Container>
    )
}