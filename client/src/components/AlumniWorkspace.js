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
            //do I even need to bother with the state of things given my 
            collegesAccepted: [],
            
        }
        
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    //the prop you want is userDetails
    componentWillMount(){
        this.getCollegesAcceptedInto();
    }

    getCollegesAcceptedInto = () => {
        const theEndPoint = `/alumni/collegesAcceptedInto/all/${this.props.userDetails._id}`;
        makeCall({}, theEndPoint, `GET`)
        .then(res => {
            //you'll need a condition to see whether or not the response is ok
            this.setState({
                collegesAccepted: res
            })
            //this.updateState()
        })
        .catch(e => {
            console.log('Error #getCollegeAcceptedInto', e)
        })
    }

    renderCollegesAcceptedInto = () => {
        let colleges = this.state.collegesAccepted;
        //console.log(colleges);
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
        /*const handleRenderFunction = () => {
            if (this.state.collegesAccepted === []){
                return(
                    <Message info>
                    <Message.Header>No colleges in accepted college list.</Message.Header>
                    {
                        <Message.Content>Please add any colleges you have been offered an admission into </Message.Content>
                    }
                    </Message>
                )
            }else{
                this.renderCollegesAcceptedInto()
            }
        } */
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