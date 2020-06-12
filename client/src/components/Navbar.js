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
*/
export default class Navbar extends Component {
    constructor(props) {
        super(props)
        this.renderMenuItems = this.renderMenuItems.bind(this);
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
                    {item.name}
                </Menu.Item>
            )
        })
    }
    render() {
        const { navItems, activeItem } = this.props
        return (
            <Menu stackable>
                {this.renderMenuItems(navItems, activeItem)}
            </Menu>
        )
    }
}