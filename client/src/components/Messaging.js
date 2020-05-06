import React from 'react'
import { Grid, Message, Card, Form, Button, TextArea, Icon, Checkbox } from 'semantic-ui-react'
import { makeCall } from '../apis';
import swal from "sweetalert";

export default class Messaging extends React.Component {
    constructor() {
        super();
        this.state = {
            subject: '',
            message: '',
            grade9: false,
            grade10: false,
            grade11: false,
            grade12: false,
            sending: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.isValidForm = this.isValidForm.bind(this);
        this.getGrades = this.getGrades.bind(this);
    }

    handleChange(e) {
        e.preventDefault();
        let change = {}
        change[e.target.name] = e.target.value
        this.setState(change)
    }

    handleCheckboxChange(e, data) {
        e.preventDefault();
        this.setState({
            [data.name] : data.checked
        });
    }

    isValidForm() {
        return this.state.subject && this.state.message && [this.state.grade9, this.state.grade10, this.state.grade11, this.state.grade12].some((item) => !!item);
    }

    getGrades() {
        let grades = [];
        if (this.state.grade9) {
            grades.push(9);
        }
        if (this.state.grade10) {
            grades.push(10);
        }
        if (this.state.grade11) {
            grades.push(11);
        }
        if (this.state.grade12) {
            grades.push(12);
        }
        return grades
    }

    handleSendMessage(e) {
        e.preventDefault();
        const payload = {
            subject: this.state.subject,
            body: this.state.message,
            grades: this.getGrades()
        }
        this.setState({
            sending: true
        }, async () => {
            try {
                const result = await makeCall(payload, '/staff/sendMessages', 'post');
                if (!result || result.error) {
                    this.setState({
                        sending: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error sending the messages, please try again.",
                            icon: "error",
                        });
                    });
                } else {
                    this.setState({
                        sending: false,
                        message: '',
                        subject: '',
                        grade9: false,
                        grade10: false,
                        grade11: false,
                        grade12: false
                    }, () => {
                        swal({
                            title: "Success!",
                            text: "You've successfully sent emails to the grades checked",
                            icon: "success",
                        });
                    });
                }
            } catch (e) {
                this.setState({
                    sending: false
                }, () => swal({
                        title: "Error!",
                        text: "There was an error sending the messages, please try again.",
                        icon: "error"
                    })
                );
                console.log("Error: Messaging#handleSendMessage", e);
            }
        });
    }

    render() {
        const cardStyle ={
            width: '100%',
            padding: '5px',
            margin: '5px',
        }
        return (
            <Card centered={true} style={cardStyle}>
                <Grid centered={true} rows={5}>
                    <Form style={{width: '80%'}}>
                        <Grid.Row>
                            <Message
                                style={{'margin': "20px 0 10px 0"}}
                                content={`Compose message to send to students by grade`}
                            />
                        </Grid.Row>
                        <Grid.Row>
                            <Form.Field
                                disabled={this.state.sending}
                                style={{'margin': '10px 0 10px 0'}}
                                type="text"  
                            >
                                <input placeholder='Subject for message...' name="subject" value={this.state.subject} onChange={this.handleChange}/>
                            </Form.Field>
                        </Grid.Row>
                        <Grid.Row>
                            <TextArea 
                                disabled={this.state.sending}
                                style={{'margin': '10px 0 10px 0'}}
                                placeholder='Enter your message here...'
                                name="message"
                                value={this.state.message}
                                onChange={this.handleChange}
                            />
                        </Grid.Row>
                        <Grid.Row
                            style={{'margin': '10px 0 10px 0'}}
                        >
                            Select the grades that should get this message. (Students will not be able to see emails of other recipients)
                        </Grid.Row>
                        <Grid.Row
                            style={{'margin': '10px 0 20px 0'}}
                        >
                            <Grid centered={true} columns = {2}>
                                <Grid.Column>
                                    <Grid.Row>
                                        <Checkbox disabled={this.state.sending} label="9th grade" name="grade9" onChange={this.handleCheckboxChange} checked={this.state.grade9}/>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Checkbox disabled={this.state.sending} label="10th grade" name="grade10" onChange={this.handleCheckboxChange} checked={this.state.grade10}/>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Checkbox disabled={this.state.sending} label="11th grade" name="grade11" onChange={this.handleCheckboxChange} checked={this.state.grade11}/>
                                    </Grid.Row>
                                    <Grid.Row>
                                        <Checkbox disabled={this.state.sending} label="12th grade" name="grade12" onChange={this.handleCheckboxChange} checked={this.state.grade12}/>
                                    </Grid.Row>
                                </Grid.Column>
                                <Grid.Column>
                                    <Button
                                        onClick={this.handleSendMessage}
                                        loading={this.state.sending}
                                        disabled={!this.isValidForm() || this.state.sending}
                                    >
                                        <Icon name="paper plane"/>
                                        Send Group Message
                                    </Button>
                                </Grid.Column>
                            </Grid>
                        </Grid.Row>
                    </Form>
                </Grid>
            </Card>
        )
    }
    
}