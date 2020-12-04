import React, { Component } from 'react';
import { Message, Form, Modal, Menu, Label, Card, Grid, Image, List, Button, Header, Segment } from 'semantic-ui-react';
import { makeCall } from "../apis";

const ALUMNI = "ALUMNI"

/*
props:

*/
export default class AlumniWorkspace extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: 'collegesAccepted',
            collegesAccepted: []
        }
        
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    render() {

        return(
            <>
            <div>
                <Menu secondary stackable>
                <Menu.Item
                    id=''
                    name='Colleges Accepted Into'
                    active={this.state.activeItem === 'collegesAccepted'}
                    onClick={this.handleMenuClick}
                >
                    Colleges Accepted Into             
                </Menu.Item>
            </Menu>
            </div>
            {!this.state.collegesAccepted.length &&
            <Message info>
            <Message.Header>No colleges in accepted college list.</Message.Header>
            {
                <Message.Content>Add some colleges and check back!</Message.Content>
            }
            </Message>
            }
            {this.state.display}
            </>
        )
    }
}