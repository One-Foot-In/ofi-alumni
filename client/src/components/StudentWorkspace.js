import React, { Component } from 'react';
import { Menu} from 'semantic-ui-react';
import StudentOpportunities from './StudentOpportunities'
import Library from './Library'

/**
 * The Workspaces Directory has subtabs that enable the student to browse and add content that alumni have curated
 * props:
 * userDetails: profile information for the alumnus
 * history: React Router prop that allows navigation
 * articleId: articleId for the article the alumnus is trying to view (optional)
 */
export default class StudentWorkspace extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: this.props.activeItem
        }
        
    }

    handleMenuClick = (e, { id }) => {
        this.setState({ activeItem: id })
        this.props.history.push(`/workspaces/${id}`)
    }

    render() {
        return(
            <>
            <div>
                <Menu secondary stackable>
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
            </div>
                {
                    this.state.activeItem === 'opportunities' &&
                    <StudentOpportunities
                        studentId={this.props.userDetails._id}
                    />
                }
                {
                    this.state.activeItem === 'library' &&
                    <Library
                        userId={this.props.userDetails.user}
                        articleId={this.props.articleId}
                        history={this.props.history}
                        viewingAs={'STUDENT'}
                        approved={this.props.userDetails.approved}
                    />
                }
            </>
        )
    }
}