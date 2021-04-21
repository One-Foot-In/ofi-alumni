import React, { useState, useEffect } from 'react';
import { Comment, Form, Button } from 'semantic-ui-react'
import { makeCall } from "../apis";

/**
 * Comments section for an input in a collaborative article
 * @param {*} props
 * comments, the comments already made on the user's input
 * inputId, the id of the parent input
 * userId
 * refreshArticle, () method that refetches the article
 * approved, boolean for whether user is approved
 * @returns 
 */
export default function ArticleInputComments (props) {
    const [comment, setComment] = useState('')
    const [sendingRequest, setSendingRequest] = useState(false)

    const addComment = () => {
        setSendingRequest(true)
        makeCall({comment}, `/articles/addComment/${props.userId}/${props.inputId}`, 'patch').then(res => {
            if (res && res.error) {
                // TODO: error toast
            }
            setComment('')
            props.refreshArticle()
            setSendingRequest(false)
        })
    }

    const handleCommentInput = (e, {value}) => {
        setComment(value)
    }

    return (
        <Comment.Group>
            {
                props.comments.map(comment => {
                    return (
                        <Comment>
                            <Comment.Avatar src={comment.author.imageLink} />
                            <Comment.Content>
                                <Comment.Author>
                                    {comment.author.name}
                                    <Comment.Metadata>
                                        {comment.author.role}
                                    </Comment.Metadata>
                                </Comment.Author>
                                <Comment.Metadata>
                                    {comment.timeElapsed}
                                </Comment.Metadata>
                                <Comment.Text>
                                    {comment.comment}
                                </Comment.Text>
                            </Comment.Content>
                        </Comment>
                    )
                })
            }
        <Form reply>
            <Form.TextArea
                placeholder='Add your comment!'
                rows={1}
                value={comment}
                onChange={handleCommentInput}
                disabled={sendingRequest || !props.approved}
            />
            <Button
                content='Add Comment'
                primary
                onClick={addComment}
                disabled={sendingRequest || !props.approved}
            />
        </Form>
        </Comment.Group>
    )
}