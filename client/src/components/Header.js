import React, { Component } from 'react';
import {Grid, Button, Modal, Form, Image, Label, Dropdown, Header} from 'semantic-ui-react';
import LoginForm from './LoginForm';
import { Link } from "react-router-dom"
import 'semantic-ui-css/semantic.min.css';
import swal from "sweetalert";
import { makeCall } from "../apis";
import FootyPoints from './FootyPoints';


function getErrorLabel(content) {
    return (
        <Label pointing='below' style={{'backgroundColor': '#F6C7BD'}}> {content} </Label>
    )
}

/*
props:
- loggedIn: boolean
- logout: ()
- userId
- schoolLogo
*/
export default class HeaderComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            confirmPassword: '',
            sendingPasswordRequest: false,
            modalOpen: false,
            passwordsMatching: true,
            currRole: this.props.role,
            userId: this.props.userId,
            availableRoles: [],
            loginModalOpen: false
        }
        this.renderLoginStateInfo = this.renderLoginStateInfo.bind(this);
        this.sendNewPasswordRequest = this.sendNewPasswordRequest.bind(this);
        this.openPasswordModal = this.openPasswordModal.bind(this);
        this.closePasswordModal = this.closePasswordModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.comparePasswords = this.comparePasswords.bind(this);
        this.renderRoleDropdown = this.renderRoleDropdown.bind(this);
        this.toggleLoginModal = this.toggleLoginModal.bind(this);
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.role !== this.props.role && prevProps.userId !== this.props.userId) {
            await this.setState({
                currRole: this.props.role,
                userId: this.props.userId
            })
            await this.fetchRoles()
        }
    }

    comparePasswords() {
        this.setState({
            passwordsMatching: this.state.password === this.state.confirmPassword
        })
    }

    handlePasswordChange(e) {
        e.preventDefault();
        let change = {}
        change[e.target.name] = e.target.value
        this.setState(
            change, () => {
            this.comparePasswords()
            }
        )
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
        const payload = {
            newPassword: this.state.password,
            userId: this.props.userId
        }
        this.setState({
            sendingPasswordRequest: true
        }, async () => {
            try {
                const result = await makeCall(payload, '/password/change', 'post');
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
                        confirmPassword: '',
                        modalOpen: false
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
        })
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
                            {!this.state.passwordsMatching ? getErrorLabel('Your passwords do not match!') : null}
                            <label>New password</label>
                            <input type="password" placeholder='***' name="password" onChange={this.handlePasswordChange} value={this.state.password} />
                        </Form.Field>
                        <Form.Field>
                            {!this.state.passwordsMatching ? getErrorLabel('Your passwords do not match!') : null}
                            <label>Confirm your new password</label>
                            <input type="password" placeholder='***' name="confirmPassword" onChange={this.handlePasswordChange} value={this.state.confirmPassword} />
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
            <Button.Group compact vertical>
                <Button
                    disabled={this.state.sendingRequest}
                    color='yellow'
                    basic
                    onClick={(e) => this.openPasswordModal(e)}
                >
                    Change Password
                </Button>
                <br/>
                <Button
                    basic
                    color='orange'
                    onClick={this.props.logout}
                >
                    Log Out
                </Button>
            </Button.Group>
            
        </>

        let loggedOutGroup =
        <Button.Group vertical compact>
            <Link to="/register">
                <Button
                    disabled={this.state.sendingRequest}
                    basic
                    color='yellow'
                >
                    Register
                </Button>
            </Link>
            <br/>
            <Button 
                basic
                color='orange'
                onClick={this.toggleLoginModal}
            >
                Log In
            </Button>
        </Button.Group>
        return (
        <Grid.Column
            width = {6}
        >
            {this.props.loggedIn ?
                loggedInGroup : loggedOutGroup
            }
        </Grid.Column>)
    }

    renderLogo() {
        let imageLink = this.props.loggedIn && this.state.currRole !== 'ADMIN' && this.state.currRole !== 'COLLEGE_REP' ? 
            this.props.school.logoURL : require('./logo.png');
        return (
            <Image centered src={imageLink} size='small'/>    
        )
    }

    renderRoleDropdown() {
        return(
            <div>
            {this.state.availableRoles.length > 1 && 
            <>
                <Label basic >Current Role:
                    <Dropdown
                        compact
                        style={{'marginLeft': '5px'}}
                        selection
                        options={this.state.availableRoles}
                        value={this.state.currRole}
                        onChange={this.changeRole.bind(this)}
                    />
                </Label>
                
            </>
            }
            <FootyPoints points={this.props.footyPoints}/>
            </div>
        )
    }

    changeRole = (e, { value }) => {
        this.setState({ currRole: value }, () => {
            this.props.liftRole(value)
        })
    }


    toggleLoginModal() {
        this.setState({
        loginModalOpen: !this.state.loginModalOpen
        })
    }

    async fetchUser() {
        return makeCall({}, '/user/one/' + this.state.userId, 'get');
    }

    async fetchRoles() {
        if (this.state.userId) {
            let availableRoles = []
            let userInfo = null
            userInfo = await this.fetchUser()
            availableRoles = userInfo.result.role.map(role => {
                role = role.toLowerCase()
                return {
                    key: role,
                    text: role.charAt(0).toUpperCase() + role.slice(1),
                    value: role.toUpperCase()
                }
            })
            this.setState({availableRoles: availableRoles})
        }
    }

    render () {
        return (
            <>
                <Modal
                    closeIcon
                    open={this.state.loginModalOpen}
                    onClose={this.toggleLoginModal}
                    onOpen={this.toggleLoginModal}
                    dimmer='blurring'
                >
                    <Modal.Content>
                        <LoginForm
                            isLoggedIn={this.props.loggedIn}
                            completeLogin={this.props.completeLogin}
                            toggleLoginModal={this.toggleLoginModal}
                            login={this.props.login}
                        />
                    </Modal.Content>
                </Modal>
                <Grid
                    style={{
                        'margin': '5px 0 20px 0'
                    }}
                    columns={3}
                    centered
                    padded={false}
                >
                    <Grid.Row columns={"equal"}>
                        <Grid.Column width={5} textAlign='right' verticalAlign='middle'>
                            {this.props.loggedIn &&
                                this.renderRoleDropdown()
                            }
                        </Grid.Column>
                        <Grid.Column width={6}>
                            {this.renderLogo()}
                        </Grid.Column>
                        <Grid.Column width={5} verticalAlign='middle' textAlign='left'>
                            {this.renderLoginStateInfo()}
                        </Grid.Column>
                    </Grid.Row>
                    { this.props.loggedIn ?
                        <Grid.Row columns={"equal"}>
                            <Grid.Column textAlign='center'>
                                {this.props.school && this.props.loggedIn &&
                                    <Header as='h4'>
                                        {this.props.school.name}
                                        {
                                            (process.env.REACT_APP_IS_BETA && process.env.REACT_APP_IS_BETA.toLowerCase() === 'true') ? 
                                            <Label color='yellow'>
                                                beta
                                            </Label>
                                            : null
                                        }
                                    </Header>
                                }
                            </Grid.Column>
                        </Grid.Row> : null
                    }
                </Grid>
            </>
        )
    }
}
