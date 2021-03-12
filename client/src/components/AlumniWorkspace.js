import React, { Component } from 'react';
import { Message, Menu} from 'semantic-ui-react';
import AlumniOpportunities from './AlumniOpportunities'
import {makeCall} from '../apis';
import { timeSlotOptions } from './RequestModal';
import {Card, Icon, Button} from 'semantic-ui-react';
import CollegeUpdateModal from './alumni_profile_update_modals/CollegeUpdateModal';
import AddCollegeModal from './AddCollegeModal';
import CollegeDropDown from './CollegeDropdown';

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
            setCollegeModalOpen: false,
            removingCollege: false
        }
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id });

    componentWillMount(){
        this.getCollegesAcceptedInto();
    };

    getCollegesAcceptedInto = () => {
        console.log(this.props.userDetails._id)
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
    };

    handleDeleteColleges = (e, theId) => {
        e.preventDefault();
        console.log(theId)
        const theEndPoint = `/alumni/collegesAcceptedInto/delete/${this.props.userDetails._id}`;
        this.setState({removingCollege: true},
            async () => {
                await makeCall({'collegeToRemove': theId}, theEndPoint,`PATCH`)
                this.setState({
                    removingCollege: false
                }, () => {
                    this.props.refreshProfile(ALUMNI, this.props.userDetails._id)
                })
            })
        makeCall({'collegeToRemove': theId}, theEndPoint,`PATCH`)
        // this.props.refreshProfile(ALUMNI, this.props.userDetails._id);
    }

    handleCollegeModal = () => {
        this.setState({
            setCollegeModalOpen: !this.state.setCollegeModalOpen
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
                <>
                    {
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
                                        onClick={(e) => this.handleDeleteColleges(e, college._id)}
                                    />
                                </>
                            )
                        })
                    }
                <Button
                    primary
                    color="blue"
                    type="button"
                    size="mini"
                    onClick={() => this.setState({setCollegeModalOpen: true})}
                >
                    {colleges.length ? `Add more collges` : `Add college`}
                </Button>
                <AddCollegeModal
                    _id={this.props.userDetails._id}
                    existingColleges={this.state.collegesAccepted}
                    modalOpen={this.state.setCollegeModalOpen}
                    closeModal={this.handleCollegeModal}
                />
                </>
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
                        {this.renderCollegesAcceptedInto()}
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