import React, { useState, useEffect } from 'react';
import { Feed, Segment, Button, Message } from 'semantic-ui-react'
import { makeCall } from "../apis";
import ArticleInput from './ArticleInput';
import NewArticleInput from './NewArticleInput';

/**
 * A community-pooled article with inputs from each alumnus
 * @param {*} props
 * userId
 * articleId
 * history
 * approved, boolean for whether user is approved
 */
export default function Article (props) {
    const [sendingRequest, setSendingRequest] = useState(false)
    const [article, setArticle] = useState({})
    const [userContributed, setUserContributed] = useState(false)

    const navigateToLibrary = () => {
        props.history.push(`/workspaces/library/`)
    }

    const refreshArticle = () => {
        makeCall({}, `/articles/${props.userId}/${props.articleId}`, 'get')
            .then(res => {
                if (res && res.error) {
                    // TODO: error
                } else {
                    setArticle(res.article)
                    setSendingRequest(false)
                    let allContributingUsers = res.article.inputs ? res.article.inputs.map(input => input.author.user) : []
                    setUserContributed(allContributingUsers.indexOf(props.userId) !== -1)
                }
            })
    }

    useEffect(() => {
        refreshArticle()
    }, props)

    const renderInputs = () => {
        return article.inputs && article.inputs.map(input => {
            return (
                <ArticleInput
                    key={input._id}
                    input={input}
                    userId={props.userId}
                    refreshArticle={refreshArticle}
                    approved={props.approved}
                />
            )
        })
    }

    return (
        <Segment
            loading={sendingRequest}
        >
            <Button
                primary
                fluid
                onClick={() => navigateToLibrary()}
            >
                Back to Library
            </Button>
            <Feed>
                <Message
                    info
                >
                    <Message.Header>{article.prompt}</Message.Header>
                </Message>
                {renderInputs()}
            </Feed>
            {   
                props.viewingAs === 'ALUMNI' ?
                <>
                    {
                        userContributed ?
                        <Message color='yellow'>
                            You have already contributed to this article.
                        </Message>
                        :
                        props.approved ? 
                            <NewArticleInput
                                articleId={props.articleId}
                                userId={props.userId}
                                refreshArticle={refreshArticle}
                            />
                            :
                            <Message color='yellow'>
                                An Alumnus must be approved before they can add an article input!
                            </Message>
                    }
                </> :
                null
            }
        </Segment>
    )
}