import React, { Component } from 'react';
import { Menu, Label, Card, Button, Icon } from 'semantic-ui-react';
import CollegeShortlistModal from './CollegeShortlistModal';

const STUDENT = "STUDENT"

export default class CollegeShortlist extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: "shortlist",
            collegeModalOpen: false,
            collegeShortlist: [],
        }
        this.openCollegeModal = this.openCollegeModal.bind(this);
        this.closeCollegeModal = this.closeCollegeModal.bind(this);
        this.addToShortlist = this.addToShortlist.bind(this);
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

    addToShortlist(newCollege) {        
        let currentCollegeShortlist = this.props.details.collegeShortlist
        currentCollegeShortlist.push(newCollege) 
        this.setState({
            shortlist: currentCollegeShortlist
        })
        this.state.collegeShortlist.push(newCollege);
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
                         <Label color='teal'>{details.collegeShortlist.length}</Label>
                    }
                </Menu.Item>
                
            </Menu>
            {this.state.activeItem === 'shortlist' &&
                <div style={{paddingLeft: 13, paddingRight: 13}}>
                    <Card fluid>
                    <Card.Content>
                    <Card.Header>{details.name || 'Unavailable'}</Card.Header>
                    <Card.Description>Colleges: {details.collegeShortlist.map(e => 
                        <li>{e.name}</li> || <li>{e}</li>) || 'Unavailable' }
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
                                <CollegeShortlistModal
                                    modalOpen={this.state.collegeModalOpen}
                                    id={details._id}
                                    addToShortlist={this.addToShortlist}
                                    collegeShortlist={details.collegeShortlist}
                                    closeModal={this.closeCollegeModal}
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

