import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Form, Button, Icon, Message, Grid, Modal, Label } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom'
import { makeCall } from "../apis";
import swal from "sweetalert";

import { connect } from 'react-redux';
import * as actions from '../redux/actions'

let fieldStyle = {
    width: '100%',
}
let messageStyle = {
    padding: '20px',
    margin: '10px',
}

let buttonStyle = {
    width: '100px',
}

/*
  STORE SETUP
*/

const mapDispatchToProps = dispatch => ({
    addUserDetails: userDetails => dispatch(actions.addUserDetails(userDetails))
})

/*
STORE SETUP
*/

function getErrorLabel(content) {
    return (
        <Label pointing='below' style={{'backgroundColor': '#F6C7BD'}}> {content} </Label>
    )
}

/*
props:
-isloggedIn
-completeLogin: ()
-login: ()
*/
class LoginForm extends React.Component {
    constructor() {
        super();
        this.state = {
            email: '',
            passwordResetEmail: '',
            password: '',
            error: null,
            loginLoading: false,
            modalOpen: false,
            sendingPasswordRequest: false,
            passwordResetEmailValid: true
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.renderIncorrectCredentialsMessage = this.renderIncorrectCredentialsMessage.bind(this);
        this.openPasswordModal = this.openPasswordModal.bind(this);
        this.closePasswordModal = this.closePasswordModal.bind(this);
        this.sendPasswordRequest = this.sendPasswordRequest.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
        this.handlePasswordResetEmailChange = this.handlePasswordResetEmailChange.bind(this)
    }

    async handleSubmit(e) {
        e.preventDefault()
        this.setState({loginLoading: true});
        const payload = {
            email: this.state.email,
            password: this.state.password
        };
        try {
            const result = await makeCall(payload, '/login', 'post')
            if (!result || result.error) {
                this.setState({
                    error: result.error ? result.error : `Your login was unsuccessful.`,
                    loginLoading: false
                });
            } else {
                this.setState({
                    loginLoading: false,
                }, () => {
                    this.props.completeLogin();
                    this.props.toggleLoginModal();
                    this.props.login();
                });
            }
        }
        catch (e) {
            this.setState({
                error: `Something went wrong! Please try again!`,
                loginLoading: false
            });
            console.log("Error: LoginForm#handleSubmit", e)
        }
    }

    openPasswordModal(e) {
        e.preventDefault();
        this.setState({
            modalOpen: true
        })
    }

    closePasswordModal(e) {
        e.preventDefault();
        this.setState({
            modalOpen: false,
            passwordResetEmail: ''
        })
    }

    handleChange(e) {
        e.preventDefault();
        let change = {}
        change[e.target.name] = e.target.value
        this.setState(change)
    }

    handlePasswordResetEmailChange(e) {
        e.preventDefault();
        this.setState({
            passwordResetEmail: e.target.value,
            passwordResetEmailValid: this.validateEmail()
        })
    }

    async sendPasswordRequest(e) {
        e.preventDefault();
        const payload = {
            email: this.state.passwordResetEmail
        }
        try {
            const result = await makeCall(payload, '/password/forgot', 'post');
            if (!result || result.error) {
                this.setState({
                    sendingPasswordRequest: false
                }, () => {
                    swal({
                        title: "Error!",
                        text: `There was an error completing your request, please try again.`,
                        icon: "error",
                    });
                }); 
            } else {
                this.setState({
                    sendingPasswordRequest: false,
                    modalOpen: false,
                    passwordResetEmail: ''
                }, () => {
                    swal({
                        title: "Success!",
                        text: `Check your email to receive your new password. You can change your password once you login.`,
                        icon: "success",
                    });
                });
            }
        } catch (e) {
            console.log("Error: LoginForm#sendPasswordRequest", e);
        }
    }

    // Email regex borrowed from: https://www.w3resource.com/javascript/form/email-validation.php
    validateEmail() {
        return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.passwordResetEmail)) 
    }

    renderIncorrectCredentialsMessage() {
    let messageStyle = {
        width: '80%',
        margin: '10px'
    }
    return this.state.error ?
    <Grid centered>
        <Message
            centered
            error
            content={this.state.error}
            style = {messageStyle}
    />
    </Grid>
    : null
    }
    render() {
        if (this.props.isLoggedIn) {
            return <Redirect to="/"/>
        }
        return (
            <div>
                <Message
                    style= {messageStyle}
                    attached
                    centered
                    header={`Welcome to One Foot In`}
                    content={`Please sign in to access your school's network.`}
                />
                {this.renderIncorrectCredentialsMessage()}
                <Grid>
                    <Grid.Row centered>
                    <Form >
                        <Form.Field
                            type="email"
                            required={true}
                            style={fieldStyle}
                        >
                            <label>Email</label>
                            <input placeholder='Email' name="email" onChange={this.handleChange} />
                        </Form.Field>
                        <Form.Field
                            type="password"
                            required={true}
                            style={fieldStyle}
                        >
                            <label>Password</label>
                            <input placeholder='***' name="password" type="password" onChange={this.handleChange} />
                        </Form.Field>
                    </Form>
                    </Grid.Row>
                    <Grid.Row centered>
                    <Button
                        style={buttonStyle}
                        onClick={this.handleSubmit}
                        loading={this.state.loginLoading}
                    >
                        <Icon name="unlock"/>
                        Login
                    </Button>
                    </Grid.Row>
                    <Grid.Row centered>
                        <Modal
                            open={this.state.modalOpen}
                        >
                            <Modal.Header>Please enter your email to receive a new password {this.state.recipientName}</Modal.Header>
                            <Modal.Content>
                                <Form onSubmit={this.sendPasswordRequest}>
                                <Form.Field
                                    type="text">
                                        {!this.state.passwordResetEmailValid ? getErrorLabel('Please enter a valid email!') : null}
                                        <label>Email</label>
                                        <input placeholder='Your email address...' name="passwordResetEmail" onChange={this.handlePasswordResetEmailChange} value={this.state.passwordResetEmail} />
                                    </Form.Field>
                                    <Button 
                                        color="blue" 
                                        type='submit'
                                        loading={this.state.sendingPasswordRequest}
                                        disabled={!this.state.passwordResetEmail || this.state.sendingPasswordRequest || !this.validateEmail()}
                                    >
                                        Send
                                    </Button>
                                </Form>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button onClick={this.closePasswordModal}>
                                    Done
                                </Button>
                            </Modal.Actions>
                        </Modal>
                        <Button
                            disabled={this.state.sendingRequest}
                            style={{'height':'80%', 'margin': '2px 0 2px 0'}}
                            onClick={(e) => this.openPasswordModal(e)}
                        >
                            Forgot Password
                        </Button>
                    </Grid.Row>
                </Grid>     
            </div>
        )
    }
}

export default connect(null, mapDispatchToProps)(LoginForm);