import React, { Component } from "react"
import { Container, Button, Message, Form } from 'semantic-ui-react'
import { makeCall } from "../apis";
import swal from "sweetalert";

/*
    role: STUDENT | TEACHER
    name: string
    phone: string
    id: string
*/
export default class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: props.name,
            phone: props.phone,
            sendingUpdate: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.sendUpdate = this.sendUpdate.bind(this);
        this.infoHasChanged = this.infoHasChanged.bind(this);
    }

    handleChange(e) {
        e.preventDefault();
        let change = {}
        change[e.target.name] = e.target.value
        this.setState(change)
    }

    infoHasChanged() {
        return this.props.name !== this.state.name || this.props.phone !== this.state.phone
    }

    sendUpdate(e) {
        e.preventDefault();
        const payload = {
            name: this.state.name,
            phone: this.state.phone,
            id: this.props.id
        };
        const endPoint = this.props.role === "STUDENT" ? 'student/edit/' : 'teacher/edit/'
        this.setState({
            sendingUpdate: true
        }, async () => {
            try {
                const result = await makeCall(payload, endPoint, 'post')
                if (!result || result.error) {
                    this.setState({
                        sendingUpdate: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: `There was an error updating your profile information, please try again.`,
                            icon: "error",
                        });
                    });
                } else {
                    this.setState({
                        sendingUpdate: false
                    }, () => {
                        swal({
                            title: "Success!",
                            text: `You've successfully updated your profile information!`,
                            icon: "success",
                        });
                    });
                }
            } catch (e) {
                console.log("Error: Profile#sendUpdate", e)
            }
        })
    }

    render() {
        return (
        <Container>
            <Message
                centered
                header={`Update your profile details here`}
            />
            <Form onSubmit={this.sendUpdate}>
                <Form.Field>
                    <label>Name</label>
                    <input type="text" placeholder='Please Enter your name' name="name" onChange={this.handleChange} value={this.state.name} />
                </Form.Field>
                <Form.Field>
                    <label>Phone</label>
                    <input type="text" placeholder='Please Enter your phone' name="phone" onChange={this.handleChange} value={this.state.phone} />
                </Form.Field>
                <Button 
                    color="blue" 
                    type='submit'
                    loading={this.state.sendingUpdate}
                    disabled={!this.state.name || !this.state.phone || this.state.sendingUpdate || !this.infoHasChanged()}
                >
                    Update Profile Information
                </Button>
            </Form>
        </Container>
        )
    }
}