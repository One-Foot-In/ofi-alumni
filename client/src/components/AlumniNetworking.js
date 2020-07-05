import React, { Component } from 'react';
import { Card, Image, Grid, Label, Modal, Button, Feed, Divider, Form, Icon} from 'semantic-ui-react'
import { makeCall } from '../apis';

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
        let formattedMessage = conversation.messages[0].message.split('\n').map((message, i) => {
            if (i === 0) {
                return(
                    <p style={{'wordWrap': 'break-word', 'hyphens': 'auto', 'width': '50vw'}} key={i}>
                        {message}
                    </p>
                )
            } else {
                return
            }
        })
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
            </>
        )
    }
}


/*
 * DETAILS: Child component, conversation modal
 * Shows full conversation history and allows for sending of messages
 * 
 * PROPS: userDetails,
 *        conversation {messages [{message, sender, datesent, dateString}], 
 *                      alumni[{name, imageURL}], seen[bool], dateCreated }
 *        modalOpen
 *        closeModal()
 * 
 * NOTE: This is specific to alumni conversations - In the future, this should
 *       be generalized to groupchats (this will take some tweaking) and given
 *       its own file
 */ 
class Conversation extends Component {
    constructor(props){
        super(props)
        this.state={
            conversation: null,
            display: [],
            message: ''
        }
        this.handleValueChange = this.handleValueChange.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
    }
    componentWillMount() {
        this.createDisplay(this.props.conversation)
        this.setState({conversation: this.props.conversation})
    }

    async sendMessage() {
        let conversation = await makeCall(
            {
                id: this.state.conversation._id,
                timezone: parseInt(this.props.userDetails.timeZone/100),
                message: this.state.message
            }, '/conversations/sendMessage/' + this.props.userDetails._id, 'patch')
        this.createDisplay(conversation.conversation)
        this.setState({
            conversation: conversation.conversation,
            message: ''
        })
    }

    createDisplay(conversation) {
        let display = []
        for (let message of conversation.messages) {
            display.unshift(this.displayMessage(message, conversation.alumni, conversation.messages[0]))
        }
        this.setState({display: display})
    }

    handleValueChange(e, {name, value}) {
        e.preventDefault();
        this.setState({
            [name]: value
        })
    }

    displayMessage(message, alumni) {
        let senderIndex = alumni.findIndex(item => item._id === message.senderId[0]);
        let formattedMessage = message.message.split('\n').map((message, i) => {
            return(
                <p style={{'wordWrap': 'break-word', 'hyphens': 'auto', 'width': '50vw'}} key={i}>
                    {message}
                </p>
                )
        })
        return (
            <>
            <Divider/>
            <Feed.Event>
                <Feed.Label><Image src={alumni[senderIndex].imageURL}/></Feed.Label>
                <Feed.Content>
                    <Feed.Summary>{alumni[senderIndex].name} <Feed.Date>{message.dateString}</Feed.Date></Feed.Summary>
                    {formattedMessage}
                </Feed.Content>
            </Feed.Event>
            </>
        )
    }

    render() {
        let userIndex = this.state.conversation.alumni.findIndex(item => item._id === this.props.userDetails._id);
        let recipientIndex = (userIndex + 1) % 2;
        return (
            <Modal 
                open={this.props.modalOpen} 
                closeIcon 
                onClose={this.props.closeModal}
            >
                <Modal.Header>Conversation with {this.state.conversation.alumni[recipientIndex].name}</Modal.Header>
                <Modal.Content scrolling style={{'display': 'flex', 'flexDirection': 'column-reverse', 'maxHeight': '50vh'}}>
                    <Feed>
                        {this.state.display}
                    </Feed>
                </Modal.Content>
                <Modal.Content>
                    <Grid>
                        <Grid.Row columns={'equal'} verticalAlign='middle'>
                            <Grid.Column width={12}>
                                <Form>
                                    <Form.TextArea
                                        rows={2}
                                        label={'Send a message to ' + this.state.conversation.alumni[recipientIndex].name + ':'}
                                        onChange={this.handleValueChange}
                                        value={this.state.message}
                                        name='message'
                                    /> 
                                </Form>
                            </Grid.Column>
                            <Grid.Column>
                                <Button 
                                    inverted 
                                    floated='left' 
                                    onClick={this.sendMessage}
                                    disabled={!this.state.message}
                                >
                                    <Icon size='large' color='blue' name='paper plane'/>
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Content>
            </Modal>
        )
    }
}