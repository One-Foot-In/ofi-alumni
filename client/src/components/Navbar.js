import React, { Component } from 'react'
import { Menu } from 'semantic-ui-react'
import { Link } from 'react-router-dom'

/*
    props:
    - navItems: [
        {
            id: 'item1',
            name: 'Item 1',
            navLink: '/link1'
        },
        {
            id: 'item2',
            name: 'Item 2',
            navLink: '/link2'
        }
    ]
    - activeItem
    - match (containing params, path, url, isExact from React-Router)
*/
export default class Navbar extends Component {
    constructor(props) {
        super(props)
        this.renderMenuItems = this.renderMenuItems.bind(this);
    }
    renderMenuItems(items, activeItem) {
        const { match } = this.props
        return items && items.map( item => {
            return (
                <Menu.Item 
                    as={Link}
                    to={`${match.url}${item.id}`}
                    name={item.name}
                    active={activeItem === item.id}
                >
                    {item.name}
                </Menu.Item>
            )
        })
    }
    render() {
        const { navItems, activeItem } = this.props
        return (
            <Menu>
                {this.renderMenuItems(navItems, activeItem)}
            </Menu>
        )
    }
}