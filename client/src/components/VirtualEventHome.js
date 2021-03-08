import React, { useState } from 'react';
import { Form, Button } from 'semantic-ui-react';

import { makeCall } from '../apis';

function VirtualEventHome() {
    const [eventName, setEventName] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');

    function handleEventNameChange(e) {
        setEventName(e.target.value);
    };

    function handleLinkChange(e) {
        setLink(e.target.value);
    };

    function handleDescriptionChange(e) {
        setDescription(e.target.value);
    }

    function handleFormSubmit(e) {
        makeCall({
            title: eventName,
            description: description,
            link: link
        }, '/events/create', 'POST');
    }

    return (
        <>
            <h3>Virtual Events Home</h3>
            <Form onSubmit={handleFormSubmit}>
                <Form.Input label="Event Name" 
                            control='input'
                            placeholder="Event Name"
                            onChange={handleEventNameChange} />
                <Form.Input label="Description" 
                            control='input'
                            placeholder="Description"
                            onChange={handleDescriptionChange}/>
                <Form.Input label="Link" 
                            control='input'
                            placeholder="Link for the event"
                            onChange={handleLinkChange}/>
                <Form.Field control={Button} type='submit'>Submit</Form.Field>
            </Form>

        </>
    )
};

export default VirtualEventHome;
