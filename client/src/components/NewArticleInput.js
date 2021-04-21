import React, { useState, useEffect } from 'react';
import { Grid, TextArea, Button, Checkbox } from 'semantic-ui-react'
import { makeCall } from '../apis';

/**
 * Form to add input to an article
 * @param {*} props 
 * userId
 * articleId
 * @returns 
 */
export default function NewArticleInput (props) {
    const [input, setInput] = useState('')
    const [sendingRequest, setSendingRequest] = useState(false)
    const [makeAnonymous, setMakeAnonymous] = useState(false)
    const addArticleInput = async () => {
        setSendingRequest(true)
        makeCall(
            {
                input,
                isAnonymous: makeAnonymous
            },
            `/articles/addInput/${props.userId}/${props.articleId}`,
            'patch'
        ).then(res => {
            if (res && res.error) {
                // TODO: error toast
            }
            props.refreshArticle()
            setSendingRequest(false)
        })
    }

    const handleInputChange = (e, {value}) => {
        setInput(value)
    }
    return (
        <Grid
            centered
            padded
            columns={2}
            stackable
        >
            <Grid.Column
                width={10}
            >
                <TextArea
                    placeholder='You can add an input to this article!'
                    onChange={handleInputChange}
                    value={input}
                    maxLength="500"
                    disabled={sendingRequest}
                    style={{
                        width: '100%'
                    }}
                />
            </Grid.Column>
            <Grid.Column
                width={6}
            >
                <Grid.Row>
                    <Button
                        primary
                        onClick={addArticleInput}
                        disabled={sendingRequest || !input}
                    >
                        Add Input
                    </Button>                
                </Grid.Row>
                <Grid.Row
                    style={{
                        marginTop: '3px'
                    }}
                >
                    <Checkbox 
                        checked={makeAnonymous}
                        label='Anonymous'
                        onChange={() => setMakeAnonymous(!makeAnonymous)}
                        disabled={sendingRequest}
                    />               
                </Grid.Row>
            </Grid.Column>
        </Grid>
    )
}