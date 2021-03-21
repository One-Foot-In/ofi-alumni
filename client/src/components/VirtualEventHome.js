import React, { useState } from 'react';
import { Form, Button, Dropdown } from 'semantic-ui-react';
import DatePicker from 'react-datetime';
import moment from 'moment';
import 'react-datetime/css/react-datetime.css';

import { makeCall } from '../apis';

function VirtualEventHome() {
    const [eventName, setEventName] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [gradYears, setGradYears] = useState([]);
    const [datetime, setDatetime] = useState(moment());
    const [submitted, setSubmitted] = useState(false);

    const years = [2000, 2001, 2002] // TODO: Update


    function handleEventNameChange(e) {
        setEventName(e.target.value);
    };

    function handleLinkChange(e) {
        setLink(e.target.value);
    };

    function handleDescriptionChange(e) {
        setDescription(e.target.value);
    }

    function handleGradYearChange(e, {value}) {
        setGradYears(value);
    }

    async function handleFormSubmit(e) {
        // TODO: Add simple validation
        const resp = await makeCall({
            title: eventName,
            description: description,
            link: link,
            years: gradYears,
            scheduledDate: datetime

        }, '/events/create', 'POST');
        setSubmitted(true);
    }

    return (
        submitted ? 
            <h3>Thanks!</h3> :
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
                    <Dropdown placeholder="Grad years"
                            fluid
                            multiple
                            selection
                            onChange={handleGradYearChange}
                            options={ years.map(year => (
                                {   
                                    key: year,
                                    text: year,
                                    value: year
                                }
                            )) }
                    />
                    <div>
                        <label>Choose the date for the event</label>
                        <DatePicker value={datetime}
                                    onChange={val => setDatetime(val)}
                                    data-testid="event-date-picker"/>
                    </div>

                    <Form.Field control={Button} type='submit'>Submit</Form.Field>

                </Form>


            </> 
    )
};

export default VirtualEventHome;
