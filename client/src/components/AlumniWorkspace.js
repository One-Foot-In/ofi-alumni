import React, { Component } from 'react';
import { Message, Menu} from 'semantic-ui-react';
import AlumniOpportunities from './AlumniOpportunities'

/*
props:
    userDetails
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
            <div>
                <Menu secondary stackable>
                    <Menu.Item
                        id='collegesAccepted'
                        name='Colleges Accepted Into'
                        active={this.state.activeItem === 'collegesAccepted'}
                        onClick={this.handleMenuClick}
                    >
                        Colleges Accepted Into             
                    </Menu.Item>
                    <Menu.Item
                        id='opportunities'
                        name='Opportunities'
                        active={this.state.activeItem === 'opportunities'}
                        onClick={this.handleMenuClick}
                    >
                        Opportunities             
                    </Menu.Item>
                </Menu>
                {
                    this.state.activeItem === 'collegesAccepted' &&
                    <div style={{paddingLeft: 13, paddingRight: 13}}>
                        {
                            !this.state.collegesAccepted.length &&
                            <Message info>
                                <Message.Header>No colleges in accepted college list.</Message.Header>
                                {
                                    <Message.Content>Please add any colleges you have been offered an admission into. </Message.Content>
                                }
                            </Message>
                        }
                    </div>
                }
                {
                    this.state.activeItem === 'opportunities' &&
                    <AlumniOpportunities
                        alumniId={this.props.userDetails._id}
                    />
                }
            </div>                
        )
    }
}