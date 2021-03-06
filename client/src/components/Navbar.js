import React, { Component } from 'react'
import { Menu, Responsive, Sidebar, Button, Icon, Label } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import  TimeZoneDropdown  from './TimeZoneDropdown'

/*
    props:
    - userDetails - profile object
    - role
    - timezoneActive (enables/disables timezone dropdown)
    - navItems: [
        {
            id: 'item1',
            name: 'Item 1',
            navLink: '/link1',
            icon: 'icon name'
        },
        {
            id: 'item2',
            name: 'Item 2',
            navLink: '/link2',
            icon: 'icon name'
        }
    ]
    - activeItem
*/
export default class Navbar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            sidebarVisible: false
        }
        this.renderMenuItems = this.renderMenuItems.bind(this);
        this.handleOffsetChange = this.handleOffsetChange.bind(this);
        this.handleClick = this.handleClick.bind(this)
    }

    UNSAFE_componentWillMount() {
        this.setState({sidebarVisible: false})
    }

    renderMenuItems(items, activeItem) {
        return items && items.map( item => {
            return (
                <Menu.Item
                    key={item.id}
                    as={Link}
                    to={item.navLink}
                    name={item.name}
                    active={activeItem === item.id}
                >
                    <Icon
                        name={item.icon}
                    />
                    {
                        item.notificationBubbleCounter > 0 ?
                        <Label
                            floating
                            color='orange'
                            circular
                            size='small'
                        >
                            {item.notificationBubbleCounter}
                        </Label>
                    : null
                    }
                    <span style={{fontSize:'0.85rem'}}>
                        {item.name}
                    </span>
                </Menu.Item>
            )
        })
    }

    handleOffsetChange() {
        window.location.reload()
    }

    async handleClick() {
        this.setState({sidebarVisible: !this.state.sidebarVisible})
    }

    render() {
        const { navItems, activeItem, role } = this.props
        return (
            <>
            <Responsive as={Menu} minWidth={726}>
                {this.renderMenuItems(navItems, activeItem)}
                {this.props.timezoneActive &&
                    <TimeZoneDropdown
                        userDetails={this.props.userDetails}
                        userRole={role}
                        liftTimezone={this.handleOffsetChange}
                    />
                }
            </Responsive>
            <Responsive maxWidth={726}>
                <Sidebar
                    as={Menu}
                    animation='overlay'
                    icon='labeled'
                    inverted
                    vertical
                    visible={this.state.sidebarVisible}
                    width='thin'
                >
                    {this.renderMenuItems(navItems, activeItem)}
                    {this.props.timezoneActive &&
                        <TimeZoneDropdown
                            userDetails={this.props.userDetails}
                            userRole={role}
                            liftTimezone={this.handleOffsetChange}
                        />
                    }
                    <Button icon='close' as={Menu.Item} onClick={this.handleClick}/>
                </Sidebar>
                <Button icon='bars' onClick={this.handleClick} fluid style={{'marginBottom': '18px'}}/>
            </Responsive>
            </>
        )
    }
}