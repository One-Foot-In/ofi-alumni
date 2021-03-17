import React, { useState, useEffect } from 'react';
import { Grid, TextArea, Button } from 'semantic-ui-react'
import { makeCall } from '../apis';

/**
 * Form to create a new article
 * @param {*} props 
 * userId
 * refetchArticles, () triggers a refetch or articles in parent component
 * @returns 
 */
export default function NewArticlePrompt (props) {
    const [prompt, setPrompt] = useState('')
    const [sendingRequest, setSendingRequest] = useState(false)
    const addArticle = async () => {
        setSendingRequest(true)
        makeCall({prompt}, `/articles/${props.userId}`, 'post').then(res => {
            if (res && res.error) {
                // TODO: error toast
            }
            setPrompt('')
            props.refetchArticles()
            setSendingRequest(false)
        })
    }

    const handlePromptChange = (e, {value}) => {
        setPrompt(value)
    }
    return (
        <Grid
            centered
            padded
            columns={2}
        >
            <Grid.Column
                width={10}
            >
                <TextArea
                    placeholder='Add a prompt for your new article. Any alumnus can then add an input to your prompt to create a collaborative article.'
                    onChange={handlePromptChange}
                    value={prompt}
                    maxLength="300"
                    disabled={sendingRequest}
                    style={{
                        width: '100%'
                    }}
                />
            </Grid.Column>
            <Grid.Column
                width={6}
            >
                <Button
                    primary
                    onClick={addArticle}
                    disabled={sendingRequest || !prompt}
                >
                    Add Article
                </Button>                
            </Grid.Column>
        </Grid>
    )
}