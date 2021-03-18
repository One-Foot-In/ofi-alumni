import React, { useState, useEffect } from 'react';
import { Feed, Accordion, Icon, Label, Divider } from 'semantic-ui-react'
import { makeCall } from "../apis";
import ArticleInputComments from './ArticleInputComments'

/**
 * Each input in a collaborative article with a collapsible comments section
 * @param {*} props 
 * input, input to an article
 * refreshArticle, () method that refetches article
 * approved, boolean for whether user is approved
 * userId, userId for current user
 */
export default function ArticleInput (props) {
    const [revealComments, setRevealComments] = useState(false)

    const likeInput = (inputId) => {
        makeCall({},`/articles/likeArticle/${props.userId}/${inputId}`, 'patch').then(res => {
            if (!res && res.error) {
                // TODO error
            } else {
                props.refreshArticle()
            }
        })
    }

    const deleteInput = (inputId) => {
        makeCall({},`/articles/input/${props.userId}/${inputId}`, 'delete').then(res => {
            if (!res && res.error) {
                // TODO error
            } else {
                props.refreshArticle()
            }
        })
    }

    const getRevealCommentsText = () => {
        let numComments = props.input.comments.length
        if (numComments === 0) {
            return 'Add Comment'
        } else if (numComments === 1) {
            return 'Show 1 Comment'
        } else {
            return `Show ${numComments} Comments`
        }
    }

    const input = props.input
    return (
        <>
            <Feed.Event>
                <Feed.Label>
                    {
                        input.isAnonymous ? 
                        <div>
                            <Icon name='user' />
                        </div> :
                        <div>
                            <img src={input.author.imageURL}/>
                        </div>
                    }
                </Feed.Label>
                <Feed.Content>
                    <Feed.Date>
                        {input.timeElapsed}
                    </Feed.Date>
                    <Feed.Meta>
                        { (input.isAnonymous ? `Anonymous User` : input.author.name) }
                    </Feed.Meta>
                    <Feed.Meta>
                        {
                            input.author.majorName &&
                            <Label
                                size='tiny'
                                color='orange'
                                style={{
                                    margin: '2px'
                                }}
                            >
                                {input.author.majorName}
                            </Label>
                        }
                        {
                            input.author.jobTitleName &&
                            <Label
                                size='tiny'
                                color='yellow'
                                style={{
                                    margin: '2px'
                                }}
                            >
                                {input.author.jobTitleName}
                            </Label>
                        }
                        {
                            input.author.country &&
                            <Label
                                size='tiny'
                                color='teal'
                                style={{
                                    margin: '2px'
                                }}
                            >
                                {input.author.country}
                            </Label>
                        }
                        {
                            input.author.collegeName &&
                            <Label
                                size='tiny'
                                color='blue'
                                style={{
                                    margin: '2px'
                                }}
                            >
                                {input.author.collegeName}
                            </Label>
                        }
                    </Feed.Meta>
                    <Feed.Summary>
                        {input.input}
                    </Feed.Summary>
                    <Feed.Extra>
                        <Feed.Like>
                            <Icon name='like' onClick={() => likeInput(input._id)}/> {input.usersLiked ? (input.usersLiked.length).toString() : '0' }
                        </Feed.Like>
                        {
                            input.author.user === props.userId ?
                                <Icon
                                    circular
                                    color='red'
                                    name='trash alternate'
                                    onClick={() => deleteInput(input._id)}
                                    style={{
                                        marginLeft: '3px'
                                    }}
                                />
                            : null
                        }
                    </Feed.Extra>
                </Feed.Content>
            </Feed.Event>
            <Accordion>
                <Accordion.Title
                    onClick={() => setRevealComments(!revealComments)}
                    active={revealComments}
                >
                    <Icon name='dropdown' />
                    {getRevealCommentsText()}
                </Accordion.Title>
                <Accordion.Content active={revealComments}>
                    <ArticleInputComments
                        inputId={input._id}
                        userId={props.userId}
                        comments={input.comments}
                        refreshArticle={props.refreshArticle}
                        approved={props.approved}
                    />
                </Accordion.Content>
            </Accordion>
            <Divider/>
        </>
    )
}