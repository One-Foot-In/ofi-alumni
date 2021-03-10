import React, { useState, useEffect } from 'react';
import { Feed, Segment, Button } from 'semantic-ui-react'
import { makeCall } from "../apis";
import NewArticlePrompt from './NewArticlePrompt';
import Article from './Article';

/**
 * Sub-section of Workspaces that has all collaborative articles
 * @param {*} props 
 * userId, the id of the alumnus or student who is viewing the library
 * articleId, the article idea that user is trying to view
 * history object to allow navigation
 * viewingAs, ALUMNI | STUDENT , determines if the user can add input
 */
export default function Library (props) {
    const [articles, setArticles] = useState([])
    const [articleId, setArticleId] = useState('')
    const [sendingRequest, setSendingRequest] = useState(false)
    useEffect(() => {
        setSendingRequest(true)
        makeCall({}, `/articles/${props.userId}`, 'get')
            .then(articlesResponse => {
                if (articlesResponse) {
                    setArticles(articlesResponse.articles)
                    setSendingRequest(false)
                } else {
                    // TODO: error
                    // Add error toast when we introduce toasts to system
                    setSendingRequest(false)
                }
            })
    }, props)

    const navigateToArticle = (articleId) => {
        props.history.push(`/workspaces/library/${articleId}`)
    }

    const renderArticles = () => {
        return articles.map(article => {
            return (
                <Feed.Event
                    key={article._id}
                >
                    <Feed.Label image={article.author.imageLink} />
                    <Feed.Content>
                        <Feed.Date>{article.timeElapsed}</Feed.Date>
                        <Feed.Summary>
                            {article.prompt}
                        </Feed.Summary>
                        <Feed.Extra text>
                            {article.inputs.length} inputs | {article.totalLikes} likes | {article.totalComments} comments
                        </Feed.Extra>
                        <Feed.Extra>
                            <Button
                                size='tiny'
                                primary
                                onClick={() => navigateToArticle(article._id)}
                            >
                                View Article
                            </Button>
                        </Feed.Extra>
                    </Feed.Content>
                </Feed.Event>
            )
        })
    }

    return (
        <Segment
            loading={sendingRequest}
        >
            {
                !!(props.articleId) ?
                <Article
                    userId={props.userId}
                    articleId={props.articleId}
                    history={props.history}
                    viewingAs={props.viewingAs}
                /> :
                <>
                    {
                        props.viewingAs === 'ALUMNI' ?        
                        <NewArticlePrompt
                            userId={props.userId}
                        /> :
                        null
                    }
                    <Feed size='large'>
                        {renderArticles()}
                    </Feed>
                </>
            }
        </Segment>
    )
}