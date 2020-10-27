import React, { Component } from 'react';
import { Card, Image, Grid, Label} from 'semantic-ui-react'
import { makeCall } from '../apis';
import Conversation from './ConversationModal'
/*
 * DETAILS: Parent component, displays available conversations and 
 *          if the most recent message has been seen
 * PROPS: userDetails
 */ 
export default class AlumniNetworking extends Component {
    constructor(props){
        super(props)
        this.state={
            conversations: [],
            timeOffsetHours: null,
            display: [],
            activeConversation: null,
            conversationModalOpen: false
        }
        this.closeConversationModal = this.closeConversationModal.bind(this)
        this.openConversation = this.openConversation.bind(this)
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
        return makeCall({}, '/conversations/all/' + this.props.userDetails._id, 'get')
    }

    createDisplay(conversations) {
        let display = []
        for (let conversation of conversations) {
            display.push(this.constructConversation(conversation))
        }
        this.setState({display: display})
    }

    async openConversation(e) {
        let conversationTarget = e.currentTarget.getAttribute('conversationid')
        let conversation = await this.fetchConversation(conversationTarget)
        this.setState({
                activeConversation: conversation.conversation,
                conversationModalOpen: true
            })
    }

    fetchConversation(conversationTarget) {
        return (makeCall({id: conversationTarget, timezone: this.state.timeOffsetHours},
            '/conversations/one/' + this.props.userDetails._id, 'patch'))
    }

    async closeConversationModal() {
        let conversations = await this.getConversations()
        this.setState({
            conversations: conversations.conversations,
            conversationModalOpen: false, 
            activeConversation: null
        })
        this.createDisplay(conversations.conversations)
    }

    constructConversation(conversation) {
        let userIndex = conversation.alumni.findIndex(item => item._id === this.props.userDetails._id);
        let recipientIndex = (userIndex + 1) % 2;
        //Formatting to prevent text overflow
        let formattedMessage = conversation.messages[0].message.split('\n')
        formattedMessage =  (
            <p style={{'wordWrap': 'break-word', 'hyphens': 'auto', 'width': '50vw'}}>
                {formattedMessage[0]} {formattedMessage.length > 1 && '. . .'}
            </p>
        )
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
                        <Card fluid onClick={this.openConversation.bind(this)} conversationid={conversation._id}>
                            <Card.Content>
                            {!conversation.seen[userIndex] && 
                                <Label color='teal' corner='right' icon='envelope' />
                            }
                                <Card.Header>
                                    Conversation with {conversation.alumni[recipientIndex].name}
                                </Card.Header>
                                <Card.Meta>{conversation.timeFromMessage}</Card.Meta>
                                <Card.Description>Most recent message: <br/>{formattedMessage}</Card.Description>
                                
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
            {this.state.activeConversation &&
                <Conversation 
                    conversation={this.state.activeConversation}
                    modalOpen={this.state.conversationModalOpen}
                    closeModal={this.closeConversationModal}
                    userDetails={this.props.userDetails}
                />
            }
            {this.state.display}
            {!this.state.display.length &&
                <Message info>
                <Message.Header>No {this.props.activeSet} Conversations!</Message.Header>
                {
                    this.props.activeSet === 'unconfirmed' &&
                    <Message.Content>Begin a conversation by connecting with an alumni!</Message.Content>
                }
                {
                    this.props.activeSet === 'confirmed' &&
                    <Message.Content>Check back later!</Message.Content>
                }
                </Message>
            }
            {this.state.display}
            </>
        )
    }
}