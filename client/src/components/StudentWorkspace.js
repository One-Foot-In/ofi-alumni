import React, { Component } from 'react';
import { Message, Menu} from 'semantic-ui-react';

/*
props:

*/
export default class StudentWorkspace extends Component {
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
            </>
        )
    }
}