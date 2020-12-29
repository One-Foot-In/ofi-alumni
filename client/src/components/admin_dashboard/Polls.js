import React, { useState, useEffect } from 'react';
import { Segment, Form, Radio, Button, TextArea, Dropdown, List, Input, Header, Grid } from 'semantic-ui-react'
import { makeCall } from '../../apis';

export default function Polls(props) {
    
    const [polls, setPolls] = useState([])
    const [newPollOption, setNewPollOption] = useState("")
    const [pollOptions, setPollOptions] = useState([])
    const [roleSelection, setRoleSelection] = useState("")
    const [typeSelection, setTypeSelection] = useState("")
    const [contextSelection, setContextSelection] = useState("")
    const [countrySelection, setCountrySelection] = useState([])
    const [schoolSelection, setSchoolSelection] = useState([])
    const [prompt, setPrompt] = useState("")
    const [countryOptions, setCountryOptions] = useState([])
    const [schoolOptions, setSchoolOptions] = useState([])

    //Mounting
    useEffect(() => {
        makeCall({}, '/admin/polls/' + props.userDetails._id, 'get')
        .then((res) => {
            // null check to ensure server-side error does not return a non-iterable
            if (res.polls) {
                setPolls(res.polls)
            }
        })
        .then(() => {
            // get all country options
            makeCall({}, '/drop/coveredCountries/', 'get')
            .then((res) => {
                // null check to ensure server-side error does not return a non-iterable
                if (res.options) {
                    setCountryOptions(res.options)
                }
            })
            .then(() => {
                // get all country options
                makeCall({}, '/drop/schoolsOptions/', 'get')
                .then((res) => {
                    // null check to ensure server-side error does not return a non-iterable
                        if (res.options) {
                            setSchoolOptions(res.options)
                        }
                })
            })
        })
    }, [props]);

    const handlePromptChange = (e, { value}) => {
        setPrompt(value)
    }

    const handleRoleChange = (e, { value }) => {
        setRoleSelection(value)
    }

    const handleCountrySelection = (e, {value}) => {
        setCountrySelection(value)
    }

    const handleSchoolSelection = (e, {value}) => {
        setSchoolSelection(value)
    }

    const handleTargetChange = (e, { value }) => {
        setSchoolSelection([])
        setCountrySelection([])
        setContextSelection(value)
    }

    const handleTypeChange = (e, { value }) => {
        setTypeSelection(value)
    }

    const handleDeleteOption = (e, { optionText}) => {
        let newOptions = pollOptions.filter( option => option !== optionText)
        setPollOptions(newOptions)
    }

    const handleChangeNewPollOption = (e, {value}) => {
        setNewPollOption(value)
    }

    const addPollOption = (e) => {
        setPollOptions([...pollOptions, newPollOption])
        setNewPollOption("")
    }

    const isInvalidNewPollOption = () => {
        return pollOptions.includes(newPollOption) || !newPollOption
    }

    const isSubmitReady = () => {
        return contextSelection && (contextSelection === 'SCHOOL' ? schoolSelection.length : true) && (contextSelection === 'COUNTRY' ? countrySelection.length : true)
            && prompt && roleSelection && typeSelection && (['NO_CUSTOM_POLL', 'CUSTOM_POLL'].includes(typeSelection) ? pollOptions.length : true)
    }

    const submitPoll = (e, { value}) => {
        console.log("role is ", roleSelection)
        console.log("context is ", contextSelection)
        console.log("prompt is ", prompt)
        console.log("school is ", schoolSelection)
        console.log("country is ", countrySelection)
    }

    const pollOptionsList = () => {
        return (
            <Grid padded >
                <Grid.Row>
                    <Header
                        as='h5'
                    >
                        Enter your poll options
                    </Header>
                </Grid.Row>
                {
                    pollOptions.length ?
                    <Grid.Row>
                        <List>
                            {pollOptions.map(option => {
                                return (

                                    <List.Item>
                                        <List.Icon
                                            name='remove'
                                            optionText={option}
                                            onClick={handleDeleteOption.bind(this)}
                                        />
                                        <List.Content>{option}</List.Content>
                                    </List.Item>
                                )
                            })}
                        </List>
                    </Grid.Row>
                    : null
                }
                <Grid.Row>
                    <Input
                        value={newPollOption}
                        placeholder='Enter new poll option...'
                        onChange={handleChangeNewPollOption.bind(this)}
                    />
                    <Button
                        style={
                            {'margin' : '2px'}
                        }
                        primary
                        disabled={isInvalidNewPollOption()}
                        onClick={addPollOption.bind(this)}
                    >
                        Add Option
                    </Button>
                </Grid.Row>
            </Grid>
        )
    }

    const targetRadioGroup = () => {
        return (
            <Form.Group inline>
                <label>Target</label>
                <Form.Field
                    control={Radio}
                    label='Globally'
                    value='GLOBAL'
                    checked={contextSelection === 'GLOBAL'}
                    onChange={handleTargetChange.bind(this)}
                />
                <Form.Field
                    control={Radio}
                    label='By School'
                    value='SCHOOL'
                    checked={contextSelection === 'SCHOOL'}
                    onChange={handleTargetChange.bind(this)}
                />
                <Form.Field
                    control={Radio}
                    label='By Country'
                    value='COUNTRY'
                    checked={contextSelection === 'COUNTRY'}
                    onChange={handleTargetChange.bind(this)}
                />
            </Form.Group>
        )
    }

    const typeRadioGroup = () => {
        return (
            <Form.Group inline>
                <label>What type of poll is this?</label>
                <Form.Field
                    control={Radio}
                    label='User cannot add a custom option'
                    value='NO_CUSTOM_POLL'
                    checked={typeSelection === 'NO_CUSTOM_POLL'}
                    onChange={handleTypeChange.bind(this)}
                />
                <Form.Field
                    control={Radio}
                    label='User can add a custom option'
                    value='CUSTOM_POLL'
                    checked={typeSelection === 'CUSTOM_POLL'}
                    onChange={handleTypeChange.bind(this)}
                />
                <Form.Field
                    control={Radio}
                    label='Announcement'
                    value='ANNOUNCEMENT'
                    checked={typeSelection === 'ANNOUNCEMENT'}
                    onChange={handleTypeChange.bind(this)}
                />
            </Form.Group>
        )
    }

    const countrySelectionDropdown = () => {
        return (
            <Form.Group inline>
                <label>Countries Targetted</label>
                <Dropdown
                    style={{'margin':'5px'}}
                    placeholder={`Search for countries to target...`}
                    fluid
                    multiple
                    search
                    selection
                    options={countryOptions}
                    onChange={handleCountrySelection.bind(this)}
                />
            </Form.Group>
        )
    }

    const schoolSelectionDropdown = () => {
        return (
            <Form.Group inline>
                <label>Schools Targetted</label>
                <Dropdown
                    style={{'margin':'5px'}}
                    placeholder={`Search for schools to target...`}
                    fluid
                    multiple
                    search
                    selection
                    options={schoolOptions}
                    onChange={handleSchoolSelection.bind(this)}
                />
            </Form.Group>
        )
    }

    const rolesTargettedRadio = () => {
        return (
            <Form.Group inline>
                <label>Roles Targetted</label>
                <Form.Field
                    control={Radio}
                    label='Alumnus'
                    value='ALUMNI'
                    checked={roleSelection === 'ALUMNI'}
                    onChange={handleRoleChange.bind(this)}
                />
                <Form.Field
                    control={Radio}
                    label='Student'
                    value='STUDENTS'
                    checked={roleSelection === 'STUDENTS'}
                    onChange={handleRoleChange.bind(this)}
                />
                <Form.Field
                    control={Radio}
                    label='Both'
                    value='BOTH'
                    checked={roleSelection === 'BOTH'}
                    onChange={handleRoleChange.bind(this)}
                />
            </Form.Group>
        )
    }

    return (
        <Segment.Group>
            <Segment>
                <Form>
                    {targetRadioGroup()}
                    {
                        contextSelection === 'COUNTRY' ?
                        countrySelectionDropdown()
                        : null
                    }
                    {
                        contextSelection === 'SCHOOL' ?
                        schoolSelectionDropdown()
                        : null
                    }
                    {rolesTargettedRadio()}
                    {typeRadioGroup()}
                    <Form.Field
                        control={TextArea}
                        rows={2}
                        label={typeSelection === 'ANNOUNCEMENT' ? 'Announcement' : 'Prompt'}
                        placeholder='Enter poll prompt...'
                        maxLength="300"
                        onChange={handlePromptChange.bind(this)}
                    />
                    {
                        ["NO_CUSTOM_POLL", "CUSTOM_POLL"].includes(typeSelection) ?
                        pollOptionsList()
                        : null
                    }
                    <Form.Field
                        primary
                        control={Button}
                        onClick={submitPoll.bind(this)}
                        disabled={!isSubmitReady()}
                    >
                        Submit
                    </Form.Field>
                </Form>
            </Segment>
            <Segment>Existing polls go here</Segment>
      </Segment.Group>
    )
}