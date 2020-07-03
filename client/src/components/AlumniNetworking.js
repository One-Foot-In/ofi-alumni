import React, { Component } from 'react';
import { Card, Image, Grid, Label, icon } from 'semantic-ui-react'
import { makeCall } from '../apis';

export default class AlumniNetworking extends Component {
    constructor(props){
        super(props)
        this.state={
            conversations: [],
            timeOffsetHours: null,
            display: []
        }
    }

    async componentWillMount() {
        let timeOffsetHours = (parseInt(this.props.userDetails.timeZone) / 100)
        let conversations = await this.getConversations()
        this.setState({
            timeOffsetHours: timeOffsetHours,
            conversations: conversations.conversations
        })
        this.createDisplay(conversations.conversations)
    }

    getConversations() {
        return makeCall({}, '/conversations/get/' + this.props.userDetails._id, 'get')
    }

    createDisplay(conversations) {
        let display = []
        for (let conversation of conversations) {
            display.push(this.constructConversation(conversation))
        }
        this.setState({display: display})
    }

    constructConversation(conversation) {
        let userIndex = conversation.alumni.findIndex(item => item._id === this.props.userDetails._id);
        let recipientIndex = (userIndex + 1) % 2;
        return(
            <Grid key={conversation._id} columns={'equal'}>
                <Grid.Row columns={2}>
                    <Grid.Column floated='left' width={4}>
                        <Image
                            size='tiny'
                            circular
                            centered
                            src={conversation.alumni[recipientIndex].imageURL}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <Card fluid>
                            <Card.Content>
                            {!conversation.seen[userIndex] && 
                                <Label color='teal' corner='right' icon='envelope' />
                            }
                                <Card.Header>
                                    Conversation with {conversation.alumni[recipientIndex].name}
                                </Card.Header>
                                <Card.Meta>{conversation.timeFromMessage}</Card.Meta>
                                
                                <Card.Description>Most recent message: {conversation.messages[0].message}</Card.Description>
                                
                            </Card.Content>
                        </Card>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
    
    render() {
        return (
            <>
            {this.state.display}
            </>
        )
    }
}