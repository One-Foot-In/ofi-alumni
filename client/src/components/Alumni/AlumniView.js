import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import { Segment } from 'semantic-ui-react';
import Navbar from '../Navbar'

/*
    props:
        - userDetails: {
            id: '1',
            name: 'Alumni',
            college: {
                id: 'college',
                name: 'College'
            },
            location: 'New York, NY, USA',
            ...
        }
*/

const alumniNavBarItems = [
    {
        id: 'home',
        name: 'Home',
        navLink: '/home'
    },
    {
        id: 'profile',
        name: 'Profile',
        navLink: '/profile'
    },
    {
        id: 'alumniDirectory',
        name: 'Alumni Directory',
        navLink: '/directory'
    },
    {
        id: 'requests',
        name: 'Requests',
        navLink: '/requests'
    }
]

export default class AlumniView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: 'alumniDirectory'
        }
        this.handleMenuItemClick = this.handleMenuItemClick.bind(this)
    }

    handleMenuItemClick(e, itemId, history) {
        e.preventDefault();
        this.setState({
            activeItem: itemId
        },
            this.props.history.push(`/${itemId}`)
        )
    }
    
    render() {
        return (
            <Switch>
                <Route path={`home`} render={(props) => 
                        <>
                            <Navbar
                                navItems={alumniNavBarItems}
                                match={props.match}
                                activeItem={'home'}
                            />
                            <div> Home! </div>
                        </>
                    }
                />
                <Route exact path={`profile`} render={(props) => 
                        <>
                            <Navbar
                                navItems={alumniNavBarItems}
                                match={props.match}
                                activeItem={'profile'}
                            />
                            <div> Profile! </div>
                        </>
                    }
                />
                <Route exact path={`alumniDirectory`} render={(props) => 
                        <>
                            <Navbar
                                navItems={alumniNavBarItems}
                                match={props.match}
                                activeItem={'alumniDirectory'}
                            />
                            <div> Alumni Directory! </div>
                        </>
                    }
                />
                <Route exact path={`requests`} render={(props) => 
                        <>
                            <Navbar
                                navItems={alumniNavBarItems}
                                match={props.match}
                                activeItem={'requests'}
                            />
                            <div> Requests! </div>
                        </>
                    }
                />
                <Route>
                    <Segment>
                        This page does not exist in Alumni View!
                    </Segment>
                </Route>
            </Switch>
        )
    }
}