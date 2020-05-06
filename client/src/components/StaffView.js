import React, { Component } from 'react'
import { Menu, Segment } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import Messaging from './Messaging'
import Management from './Management'
import Tracking from './Tracking'

export const MESSAGING = 'Messaging';
export const STUDENT_MANAGEMENT = 'Student Management';
export const STUDENT_TRACKING = 'Student Tracking';
export const TEACHER_MANAGEMENT = 'Teacher Management'
export const TEACHER_TRACKING = 'Teacher Tracking'
export const COURSES = 'Courses'

export default class StaffView extends Component {
    constructor(props){
        super(props);
        this.state = {
            activeItem: MESSAGING
        }
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    renderNavSelection() {
        switch(this.state.activeItem) {
            case MESSAGING:
                return <Messaging/>
            case STUDENT_MANAGEMENT:
                return <Management
                    isStudentView={true}
                />
            case STUDENT_TRACKING:
                return <Tracking
                    isStudentView={true}
                />
            case TEACHER_MANAGEMENT:
                return <Management
                    isStudentView={false}
                />
            case TEACHER_TRACKING:
                return <Tracking
                isStudentView={false}
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
        <div>
            <Menu pointing>
                <Menu.Item 
                    name={MESSAGING}
                    active={activeItem === MESSAGING}
                    onClick={this.handleItemClick}
                />
                <Menu.Item
                    name={STUDENT_MANAGEMENT}
                    active={activeItem === STUDENT_MANAGEMENT}
                    onClick={this.handleItemClick}
                />
                <Menu.Item
                    name={STUDENT_TRACKING}
                    active={activeItem === STUDENT_TRACKING}
                    onClick={this.handleItemClick}
                />
                <Menu.Item
                    name={TEACHER_MANAGEMENT}
                    active={activeItem === TEACHER_MANAGEMENT}
                    onClick={this.handleItemClick}
                />
                <Menu.Item
                    name={TEACHER_TRACKING}
                    active={activeItem === TEACHER_TRACKING}
                    onClick={this.handleItemClick}
                />
                <Menu.Item
                    name={COURSES}
                    active={activeItem === COURSES}
                    onClick={this.handleItemClick}
                />
            </Menu>
            <Segment>
                {this.renderNavSelection()}
            </Segment>
        </div>
        )
    }
}
