import React, { useState, useEffect } from 'react';
import { Container, Menu, Segment } from 'semantic-ui-react'
import Team from "./Team"
import OurStory from "./OurStory"
import GetInvolved from "./GetInvolved"
import FAQs from "./FAQs"

const mobileWidthThreshold = 500

export default function LandingPage () {
    const [activeItem, setActiveItem] = useState("ourStory")
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
                        id='ourStory'
                        name='Our Story'
                        active={activeItem === 'ourStory'}
                        onClick={handleItemClick.bind(this)}
                    />
                    <Menu.Item
                        id='team'
                        name='Team'
                        active={activeItem === 'team'}
                        onClick={handleItemClick.bind(this)}
                    />
                    <Menu.Item
                        id='getInvolved'
                        name='Get Involved'
                        active={activeItem === 'getInvolved'}
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
                        activeItem === 'ourStory' &&
                        <OurStory/>
                    }
                    {
                        activeItem === 'team' &&
                        <Team/>
                    }
                    {
                        activeItem === 'getInvolved' &&
                        <GetInvolved/>
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