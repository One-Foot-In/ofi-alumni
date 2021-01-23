import React, { Component } from 'react';
import { Menu} from 'semantic-ui-react';
import StudentOpportunities from './StudentOpportunities'

/*
props:

*/
export default class StudentWorkspace extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: 'opportunities'
        }
        
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

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
                </Menu>
            </div>
                {
                    this.state.activeItem === 'opportunities' &&
                    <StudentOpportunities
                        studentId={this.props.userDetails._id}
                    />
                }
            </>
        )
    }
}