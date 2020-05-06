import React, { Component } from 'react';
import {Grid, Button, Modal, Form} from 'semantic-ui-react';
import { Link } from "react-router-dom"
import 'semantic-ui-css/semantic.min.css';
import {primary, secondary} from "../colors";
import swal from "sweetalert";
import { makeCall } from "../apis";

/*
props:
- loggedIn: boolean
- logout: ()
*/
export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            confirmPassword: '',
            sendingPasswordRequest: false,
            modalOpen: false
        }
        this.renderLoginStateInfo = this.renderLoginStateInfo.bind(this);
        this.sendNewPasswordRequest = this.sendNewPasswordRequest.bind(this);
        this.openPasswordModal = this.openPasswordModal.bind(this);
        this.closePasswordModal = this.closePasswordModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        e.preventDefault();
        let change = {}
        change[e.target.name] = e.target.value
        this.setState(change)
    }

    openPasswordModal(e) {
        e.preventDefault();
        this.setState({
            modalOpen: true
        })
    }

    closePasswordModal() {
        this.setState({
            modalOpen: false,
            password: '',
            confirmPassword: ''
        })
    }

    async sendNewPasswordRequest(e) {
        e.preventDefault();
        if (this.state.password !== this.state.confirmPassword) {
            this.setState({
                sendingPasswordRequest: false
            }, () => {
                swal({
                    title: "Error!",
                    text: `Your passwords do not match, please try again!`,
                    icon: "error",
                });
            }); 
            return;
        }
        const payload = {
            password: this.state.password,
            email: this.props.email
        }
        try {
            const result = await makeCall(payload, '/changePassword', 'post');
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
                    password: '',
                    confirmPassword: ''
                }, () => {
                    swal({
                        title: "Success!",
                        text: `Your password has been successfully changed!`,
                        icon: "success",
                    });
                });
            }
        }
        catch (e) {
            console.log("Error: Header#sendNewPasswordRequest", e);
        }
    }
    
    renderLoginStateInfo() {
        let loggedInGroup =
        <>
            <Modal
                open={this.state.modalOpen}
            >
                <Modal.Header>Please enter your new password</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.sendNewPasswordRequest}>
                        <Form.Field>
                            <label>New password</label>
                            <input type="password" placeholder='***' name="password" onChange={this.handleChange} value={this.state.password} />
                        </Form.Field>
                        <Form.Field>
                            <label>Confirm your new password</label>
                            <input type="password" placeholder='***' name="confirmPassword" onChange={this.handleChange} value={this.state.confirmPassword} />
                        </Form.Field>
                        <Button 
                            color="blue" 
                            type='submit'
                            loading={this.state.sendingPasswordRequest}
                            disabled={!this.state.password || !this.state.confirmPassword || this.state.sendingPasswordRequest}
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
                style={
                    {
                        'height':'80%', 
                        'margin': '2px 0 2px 0',
                        'background': secondary,
                        'color': primary,
                        'margin': '0 10px 0 0'
                    }
                }
                onClick={(e) => this.openPasswordModal(e)}
            >
                Change Password
            </Button>
            <Button 
                style={
                    {
                        'height':'80%', 
                        'margin': '2px 0 2px 0',
                        'background': secondary,
                        'color': primary,
                        'margin': '0 0 0 10px'
                    }
                } 
                class="ui button" 
                onClick={this.props.logout}
            >
                Log Out
            </Button>
        </>

        let loggedOutGroup =
        <>
            <Link to="/register">
                <Button
                    disabled={this.state.sendingRequest}
                    style={
                        {
                            'height':'80%', 
                            'margin': '2px 0 2px 0',
                            'background': secondary,
                            'color': primary,
                            'margin': '0 10px 0 0'
                        }
                    }
                >
                    Register
                </Button>
            </Link>
            <Link to="/login">
                <Button 
                    style={
                        {
                            'height':'80%', 
                            'margin': '2px 0 2px 0',
                            'background': secondary,
                            'color': primary,
                            'margin': '0 0 0 10px'
                        }
                    } 
                    class="ui button" 
                >
                    Log In
                </Button>
            </Link>
        </>
        return (
        <Grid.Column 
            style ={{margin: '30px 0 0 0'}}
            width = {6}
        >
            {this.props.loggedIn ?
                loggedInGroup : loggedOutGroup
            }
        </Grid.Column>)
    }

    renderLogo() {
        return (
            <img style={{'paddingTop': '30px'}} className="ui small image centered" src={require("./logo.png")} alt="logo"/>
        )
    }
    render () {
        return (
            <Grid 
                style={{
                    'margin': '5px 0 20px 0'
                }}
                columns={3}
            >
                <Grid.Column width = {5}>
                    <div></div>
                </Grid.Column>
                <Grid.Column width = {5}>
                    {this.renderLogo()}
                </Grid.Column>
                {this.renderLoginStateInfo()}
            </Grid>
        )
    }
}