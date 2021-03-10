import React, { Component } from 'react';
import { Message, Menu} from 'semantic-ui-react';
import AlumniOpportunities from './AlumniOpportunities'
import Library from './Library';

/**
 * The Workspaces Directory has subtabs that enable the alumni to browse and add content that would be helpful for students
 * props:
 * userDetails: profile information for the alumnus
 * history: React Router prop that allows navigation
 * articleId: articleId for the article the alumnus is trying to view (optional)
 */
export default class AlumniWorkspace extends Component {
    constructor(props) {
        super(props)
        
        this.state = {
            activeItem: this.props.activeItem,
        }
    }

    handleMenuClick = (e, { id }) => {
        this.setState({ activeItem: id })
        this.props.history.push(`/workspaces/${id}`)
    }

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
                    <Menu.Item
                        id='library'
                        name='Library'
                        active={this.state.activeItem === 'library'}
                        onClick={this.handleMenuClick}
                    >
                        Library             
                    </Menu.Item>
                </Menu>
                {
                    this.state.activeItem === 'collegesAccepted' &&
                    <div style={{paddingLeft: 13, paddingRight: 13}}>
                        {
                            !(this.state.collegesAccepted && this.state.collegesAccepted.length) &&
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
                {
                    this.state.activeItem === 'library' &&
                    <Library
                        userId={this.props.userDetails.user}
                        articleId={this.props.articleId}
                        history={this.props.history}
                    />
                }
            </div>                
        )
    }
}