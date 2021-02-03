import React, { useState } from 'react';
import { Accordion, Icon, Transition, Image } from 'semantic-ui-react'
import {black, darkBlack } from "../colors"

export default function FAQs () {
    const [activeIndex, setActiveIndex] = useState(null)
    const handleItemClick = (e, { index }) => setActiveIndex(index)

    return (
      <Transition transitionOnMount={true} animation='fade down' duration={1000}>
        <Accordion
          styled
          inverted
          style={{backgroundColor: darkBlack}}
        >
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={handleItemClick.bind(this)}
          >
            <Icon name='dropdown' />
              How can my school get involved?
          </Accordion.Title>
          <Accordion.Content
            active={activeIndex === 0}
            style={{backgroundColor: black, color: 'white'}}
          >
            <p>
              We can create a school portal for you, with a small starter group of students and alumni! Please reach out to onefootincollege@gmail.com with a request to have a school portal created, and we will set you up!
            </p>
          </Accordion.Content>
          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={handleItemClick}
          >
            <Icon name='dropdown' />
              I’m in! How can I help once I join?
          </Accordion.Title>
          <Accordion.Content
            active={activeIndex === 1}
            style={{backgroundColor: black, color: 'white'}}
          >
            <p>
              Spread the word to your friends from school! We’re in need of moderators to help manage students in each school context. Please reach out if you’d like to participate more at onefootincollege@gmail.com.
            </p>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={handleItemClick}
          >
            <Icon name='dropdown' />
            What curricula are you targeting?
          </Accordion.Title>
          <Accordion.Content
            active={activeIndex === 2}
            style={{backgroundColor: black, color: 'white'}}
          >
            <p>
              Whether the language of instruction for your institution is English or Martian, we want you on our platform! We hope to help everyone find the right mentors and information for them, no matter where they are coming from and what their goals are!
            </p>
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 3}
            index={3}
            onClick={handleItemClick}
          >
            <Icon name='dropdown' />
            Are you folks operating in my country?
          </Accordion.Title>
          <Accordion.Content
            active={activeIndex === 3}
            style={{backgroundColor: black, color: 'white'}}
          >
            <p>
              If the answer is currently No, you can quickly help us change that! If you want to get your school onboarded, please reach out to us at onefootincollege@gmail.com. 
            </p>
          </Accordion.Content>
        </Accordion>
      </Transition>
    )
}