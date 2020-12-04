import React, { Component } from 'react';
import { Message, Form, Modal, Menu, Label, Card, Grid, Image, List, Button, Header, Segment } from 'semantic-ui-react';
import { makeCall } from "../apis";

const ALUMNI = "ALUMNI"

/*
props:

*/
export default class StudentWorkspaces extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: 'collegeShortlist',
            collegeShortlist: []
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
                    name='College Shortlist'
                    active={this.state.activeItem === 'collegeShortlist'}
                    onClick={this.handleMenuClick}
                >
                    College Shortlist            
                </Menu.Item>
                </Menu>
            </div>
            {!this.state.collegeShortlist.length &&
            <Message info>
            <Message.Header>No colleges in your shortlist.</Message.Header>
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