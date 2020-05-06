import React, { Component } from 'react'
import { Menu, Segment} from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import Profile from "./Profile";
import { makeCall } from "../apis";

export const PROFILE = 'Profile';

export default class TeacherView extends Component {
    constructor(props){
        super(props);
        this.state = {
            activeItem: PROFILE,
            fetching: true,
            courses: []
        }
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    renderNavSelection() {
        switch(this.state.activeItem) {
            case PROFILE:
                return <Profile
                    role={'TEACHER'}
                    id={this.props.user._id}
                    name={this.props.user.name}
                    phone={this.props.user.phone}
                />
            default:
                return null
        }
    }

    render() {
        if (!this.props.isLoggedIn) {
            return <Redirect to="/login" />
        }
        const { activeItem } = this.state
        return (
        <Segment loading={this.state.fetching}>
            <Menu pointing>
                <Menu.Item 
                    name={PROFILE}
                    active={activeItem === PROFILE}
                    onClick={this.handleItemClick}
                />
            </Menu>
            <Segment>
                {this.renderNavSelection()}
            </Segment>
        </Segment>
        )
    }
}
