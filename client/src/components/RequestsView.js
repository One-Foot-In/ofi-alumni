import React, { Component } from 'react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import { Menu } from 'semantic-ui-react';
import Navbar from './Navbar'
import { makeCall } from '../apis'

export default class RequestsView extends Component {
    state={
        activeItem: 'unconfirmed',
        unconfirmed: [],
        confirmed: [],
        completed: []
    }

    async componentWillMount() {
        let timeOffset = (-(new Date().getTimezoneOffset())/60)*100
        let requests = await this.getRequests(timeOffset)
        console.log(requests)
        this.setState({
            unconfirmed: requests.requests[0],
            confirmed: requests.requests[1],
            completed: requests.requests[2]
        })
    }

    getRequests(timeOffset) {
        return makeCall({}, '/request/getRequests/'+this.props.userDetails._id+'/'+timeOffset, 'get')
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    render() {
        return(
            <div>
            <Menu secondary>
                <Menu.Item
                    id='unconfirmed'
                    name='Unconfirmed Meetings'
                    active={this.state.activeItem === 'unconfirmed'}
                    onClick={this.handleMenuClick}
                />
                <Menu.Item
                    id='confirmed'
                    name='Confirmed Meetings'
                    active={this.state.activeItem === 'confirmed'}
                    onClick={this.handleMenuClick}
                />
                <Menu.Item
                    id='completed'
                    name='Completed Meetings'
                    active={this.state.activeItem === 'completed'}
                    onClick={this.handleMenuClick}
                />
            </Menu>
            {this.state.activeItem === 'unconfirmed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <RequestCards 
                        activeSet={this.state.activeItem}
                        requests={this.state.unconfirmed}
                    />
                </div>
            }
            {this.state.activeItem === 'confirmed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <RequestCards 
                        activeSet={this.state.activeItem}
                        requests={this.state.confirmed}
                    />
                </div>
            }
            {this.state.activeItem === 'completed' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <RequestCards 
                        activeSet={this.state.activeItem}
                        requests={this.state.completed}
                    />
                </div>
            }
            </div>
        )
    }
}

class RequestCards extends Component {
    state={
        requests: []
    }
    // This allows the component to update its state should a prop value change
    componentWillReceiveProps({requests}) {
        this.setState({requests: requests})
    }
    // This ensures that the component doesn't use an old prop on menu change
    componentWillMount() {
        this.setState({requests: this.props.requests})
    }

    render() {
        console.log(this.state.requests)
        return(
            <>
            <p>{this.props.activeSet}!</p>
            {this.state.requests !== [] &&
                <p>{this.state.requests.length}</p>
            }
            </>
        )
    }
}