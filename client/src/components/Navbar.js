import React, { useState } from 'react'
import { Menu, Responsive, Sidebar, Button, Icon, Label } from 'semantic-ui-react'
import { Link, withRouter } from 'react-router-dom'
import  TimeZoneDropdown  from './TimeZoneDropdown'

/*
    TODO: update
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
function Navbar (props) {
    const { navItems, role } = props
    const activeItem = getActiveItem(props.history.location.pathname);

    const [sidebarVisable, setSidebarVisible] = useState(true);
    
    function getActiveItem(path) {
        if (path === '/') {
            if (role === 'ADMIN') {
                return 'data';
            } else if (role === 'COLLEGE_REP') {
                return 'announcements';
            } else if (role === 'COUNTRY_AMBASSADOR') {
                return 'schools';
            } else {
                return 'home';
            }
        }
        return path.substring(1);
    }

    function renderMenuItems(items, activeItem) {
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

    async function handleClick() {
        setSidebarVisible((visible) => !visible)
    }

    function handleOffsetChange() {
        window.location.reload()
    }


    return (
        <>
        <Responsive as={Menu} minWidth={726}>
            {renderMenuItems(navItems, activeItem)}
            {props.timezoneActive &&
                <TimeZoneDropdown
                    userDetails={props.userDetails}
                    userRole={role}
                    liftTimezone={handleOffsetChange}
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
                visible={sidebarVisable}
                width='thin'
            >
                {renderMenuItems(navItems, activeItem)}
                {props.timezoneActive &&
                    <TimeZoneDropdown
                        userDetails={props.userDetails}
                        userRole={role}
                        liftTimezone={handleOffsetChange}
                    />
                }
                <Button icon='close' as={Menu.Item} onClick={handleClick}/>
            </Sidebar>
            <Button icon='bars' onClick={handleClick} fluid style={{'marginBottom': '18px'}}/>
        </Responsive>
        </>
    )

}

export default withRouter(Navbar);
