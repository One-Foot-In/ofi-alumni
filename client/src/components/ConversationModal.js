import React, { Component } from 'react';
import { Image, Grid, Modal, Button, Feed, Divider, Form, Icon} from 'semantic-ui-react'
import { makeCall } from '../apis';

/*
 * DETAILS: Child component, conversation modal
 * Shows full conversation history and allows for sending of messages
 * 
 * PROPS: userDetails,
 *        conversation {messages [{message, sender, datesent, dateString}], 
 *                      alumni[{name, imageURL}], seen[bool], dateCreated }
 *        modalOpen
 *        closeModal()
 */ 
export default class Conversation extends Component {
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