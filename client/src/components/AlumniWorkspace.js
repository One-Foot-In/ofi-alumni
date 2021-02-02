import React, { Component } from 'react';
import { Message, Menu} from 'semantic-ui-react';

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
                <Message.Content>Please add any colleges you have been offered an admission into. </Message.Content>
            }
            </Message>
            }
            </>
        )
    }
}