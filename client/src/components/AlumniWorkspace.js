import React, { Component } from 'react';
import { Message, Menu} from 'semantic-ui-react';
import {makeCall} from '../apis';
import { timeSlotOptions } from './RequestModal';
import {Card, Icon} from 'semantic-ui-react';

const ALUMNI = "ALUMNI"

/*
props:

*/
export default class AlumniWorkspace extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: 'collegesAccepted',
            collegesAccepted: [],
            
        }
        
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    componentWillMount(){
        this.getCollegesAcceptedInto();
    }

    getCollegesAcceptedInto = () => {
        const theEndPoint = `/alumni/collegesAcceptedInto/all/${this.props.userDetails._id}`;
        makeCall({}, theEndPoint, `GET`)
        .then(res => {
            this.setState({
                collegesAccepted: res
            })
        })
        .catch(e => {
            console.log('Error #getCollegeAcceptedInto', e)
        })
    }

    renderCollegesAcceptedInto = () => {
        let colleges = this.state.collegesAccepted;
        if(this.state.collegeAcceptedInto == [] || this.state.collegesAccepted == null){
            return(
                <Message info>
                    <Message.Header>No colleges in accepted college list.</Message.Header>
                    {
                        <Message.Content>Please add any colleges you have been offered an admission into </Message.Content>
                    }
                    </Message>
            )
        } else {
            return (
                colleges.map(college => {
                    console.log(college._id)
                    return(
                            <>
                                <Card
                                key = {college._id}
                                style={{
                                    'margin': '3px'
                                }}
                                color='blue'
                                >
                                    {college.name}
                                </Card>
                                <Icon name="add"
                                    style={{
                                        'margin': '3px'
                                    }} 
                                />
                            </>
                        )
                    })
            )
        }
        }

    render(){
        return(
            <>
            <div>
                <Menu secondary stackable>
                <Menu.Item
                    id=''
                    name='Colleges Accepted Into'
                    active={this.state.activeItem === 'collegesAccepted'}
                    onClick={this.handleMenuClick}
                >
                    Colleges Accepted Into             
                </Menu.Item>
                {this.renderCollegesAcceptedInto()}
            </Menu>
            </div>
            
            </>
        )
    }
}