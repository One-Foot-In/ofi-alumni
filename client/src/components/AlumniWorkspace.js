import React, { Component } from 'react';
import { Message, Menu} from 'semantic-ui-react';
import AlumniOpportunities from './AlumniOpportunities'
import {makeCall} from '../apis';
import { timeSlotOptions } from './RequestModal';
import {Card, Icon} from 'semantic-ui-react';

const ALUMNI = "ALUMNI"

/*
props:
    userDetails
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
            <div>
                <Menu secondary stackable>
                    <Menu.Item
                        id='collegesAccepted'
                        name='Colleges Accepted Into'
                        active={this.state.activeItem === 'collegesAccepted'}
                        onClick={this.handleMenuClick}
                    >
                        Colleges Accepted Into             
                    </Menu.Item>
                    <Menu.Item
                        id='opportunities'
                        name='Opportunities'
                        active={this.state.activeItem === 'opportunities'}
                        onClick={this.handleMenuClick}
                    >
                        Opportunities             
                    </Menu.Item>
                </Menu>
                {
                    this.state.activeItem === 'collegesAccepted' &&
                    <div style={{paddingLeft: 13, paddingRight: 13}}>
                        {
                            !this.state.collegesAccepted.length &&
                            <Message info>
                                <Message.Header>No colleges in accepted college list.</Message.Header>
                                {
                                    <Message.Content>Please add any colleges you have been offered an admission into. </Message.Content>
                                }
                            </Message>
                        }
                    </div>
                }
                {
                    this.state.activeItem === 'opportunities' &&
                    <AlumniOpportunities
                        alumniId={this.props.userDetails._id}
                    />
                }
            </div>                
        )
    }
}