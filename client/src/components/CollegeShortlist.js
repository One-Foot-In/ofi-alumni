import React, { Component } from 'react';
import { Menu, Label, Card, Button, Icon } from 'semantic-ui-react';
import CollegeUpdateModal from './alumni_profile_update_modals/CollegeUpdateModal';

const STUDENT = "STUDENT"

export default class CollegeShortlist extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: "shortlist",
            collegeModalOpen: false,
            shortlist: [],
            // userDetails: null,
        }
        this.openCollegeModal = this.openCollegeModal.bind(this);
        this.closeCollegeModal = this.closeCollegeModal.bind(this);
    }

    openCollegeModal() {
        this.setState({
            collegeModalOpen: true
        })
    }
    closeCollegeModal() {
        this.setState({
            collegeModalOpen: false
        }, () => {
            this.props.refreshProfile(STUDENT, this.props.details._id)
        })
    }

    findDuplicate = (newCollege) => {
        return this.props.details.colleges.some(college => college == newCollege);
      }

    render() {
        const details = this.props.details;
        const isViewOnly = this.props.isViewOnly;

        return (
            <div>
            <Menu secondary stackable>
                <Menu.Item
                    id='shortlist'
                    name='College Shortlist'
                    active={this.state.activeItem === 'shortlist'}
                    onClick={this.handleMenuClick}
                >
                    College Shortlist
                    {   (this.state.shortlist !== []) && 
                         <Label color='teal'>{details.colleges.length}</Label>
                    }
                </Menu.Item>
                
            </Menu>
            {this.state.activeItem === 'shortlist' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <Card fluid>
                    <Card.Content>
                    <Card.Header>{details.name || 'Unavailable'}</Card.Header>
                    <Card.Description>Colleges: {details.colleges.map(e => e.name).join(', ') || 'Unavailable'}
                    
                        {
                            !isViewOnly ? 
                            <>
                                <Button
                                    style={{'margin': '0 0 2px 2px'}}
                                    icon
                                    inverted
                                    size="mini"
                                    onClick={this.openCollegeModal}
                                >
                                    <Icon name='pencil' color="blue"/>
                                </Button>
                                <CollegeUpdateModal
                                    modalOpen={this.state.collegeModalOpen}
                                    closeModal={this.closeCollegeModal}
                                    id={details._id}
                                    shortlist={details.colleges}
                                />
                            </> : null
                        }
                    </Card.Description>
                    </Card.Content>
                    </Card>
                </div>
            }
            </div>
        )
    }
}

