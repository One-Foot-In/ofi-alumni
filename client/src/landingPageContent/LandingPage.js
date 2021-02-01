import React, { useState, useEffect } from 'react';
import { Container, Menu, Segment } from 'semantic-ui-react'
import OurStory from "./OurStory"
import AboutUs from "./AboutUs"
import JoinUs from "./JoinUs"
import FAQs from "./FAQs"

const mobileWidthThreshold = 500

export default function LandingPage () {
    const [activeItem, setActiveItem] = useState("aboutUs")
    const viewPortWidth = (window && window.innerWidth) || mobileWidthThreshold

    const handleItemClick = (e, { id }) => setActiveItem(id)
    return (
        <Container
            centered
            fluid
            style={{
                overflow: 'auto',
                maxHeight: (viewPortWidth < mobileWidthThreshold) ? 250 : 1000,
            }}  
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
                        onClick={handleItemClick.bind(this)}
                    />
                    <Menu.Item
                        id='joinUs'
                        name='Join Us'
                        active={activeItem === 'joinUs'}
                        onClick={handleItemClick.bind(this)}
                    />
                     <Menu.Item
                        id='ourStory'
                        name='OurStory'
                        active={activeItem === 'ourStory'}
                        onClick={handleItemClick.bind(this)}
                    />
                    <Menu.Item
                        id='faqs'
                        name='FAQs'
                        active={activeItem === 'faqs'}
                        onClick={handleItemClick.bind(this)}
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