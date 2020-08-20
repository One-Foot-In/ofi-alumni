import React, { Component } from 'react';
import { Menu, Label, Card, Button, Icon, Segment } from 'semantic-ui-react';
import CollegeShortlistModal from './CollegeShortlistModal';

const STUDENT = "STUDENT"

const SegmentExampleHorizontalSegments = () => (
    <Segment.Group horizontal>
      <Segment>Left</Segment>
      <Segment>Middle</Segment>
      <Segment>Right</Segment>
    </Segment.Group>
  )

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

    // addToShortlist(newCollege) {        
    //     let currentCollegeShortlist = this.props.details.collegeShortlist
    //     currentCollegeShortlist.push(newCollege) 
    //     this.setState({
    //         collegeShortlist: currentCollegeShortlist
    //     })
    // }

    // async removeCollege(e, collegeIdToRemove) {
    //     e.preventDefault()
    //     this.setState({removingCollege: true},
    //         async () => {
    //             await makeCall({collegeIdToRemove: collegeIdToRemove}, `/student/collegeShortlist/remove/${this.props.details._id}`, 'patch')
    //             this.setState({
    //                 removingCollege: false
    //             }, () =>
    //                 this.props.refreshProfile(STUDENT, this.props.details._id)
    //             )
    //         })
    // }

    addToShortlist(newCollege, collegeType) { 
        let currentCollegeShortlist;
        if (collegeType === "Reach") {
            currentCollegeShortlist = this.props.details.reachColleges;
        }  
        else if (collegeType === "Match") {
            currentCollegeShortlist = this.props.details.matchColleges;
        }     
        else { // Safety
            currentCollegeShortlist = this.props.details.safetyColleges;
        }
        // let currentCollegeShortlist = this.props.details.collegeShortlist
        currentCollegeShortlist.push(newCollege) 
        // this.setState({
        //     collegeShortlist: currentCollegeShortlist
        // })
    }

    render() {
        const details = this.props.details;
        const isViewOnly = this.props.isViewOnly;
        let collegeType;
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
                    <div class="ui horizontal segments">
                    { !isViewOnly ? 
                            <>
                        <Segment color='orange'>
                            <b>Reach Colleges</b><br></br>
                            {details.reachColleges.map(e => <li key={e.id}>{e.name}</li> ) }
                            {/* {collegeType="Reach"} */}
                                <Button
                                    style={{'margin': '0 0 2px 2px'}}
                                    icon
                                    color="blue"
                                    type="button"
                                    size="mini"
                                    onClick={this.openCollegeModal}
                                >   Add College  
                                    <Icon name='pencil' color="blue"
                                    style={{
                                        'margin': '3px'
                                    }}
                                    />
                                </Button>
                                <CollegeShortlistModal
                                    modalOpen={this.state.collegeModalOpen}
                                    id={details._id}
                                    addToShortlist={this.addToShortlist}
                                    collegeType="Reach"
                                    collegeShortlist={details.collegeShortlist}
                                    closeModal={this.closeCollegeModal}
                                />
                            
                        </Segment>
                        <Segment color='green'>Match</Segment>
                        <Segment color='blue'>Safety</Segment>
                        </> : null
                    }
                    </div>
                    <Card fluid>
                    <Card.Content>
                    <Card.Header>{`${details.name}'s College Picks`}</Card.Header>
                    { !details.collegeShortlist.length ?
                    <Card.Description> Add colleges to begin your college shortlist!</Card.Description> : 
                        <Card.Description>Colleges: {details.collegeShortlist.map(e => 
                        <li key={e.id}>{e.name}</li> ) } </Card.Description> }
                        <Card.Description>               
                        {
                            !isViewOnly ? 
                            <>
                                <Button
                                    style={{'margin': '0 0 2px 2px'}}
                                    icon
                                    color="blue"
                                    type="button"
                                    size="mini"
                                    onClick={this.openCollegeModal}
                                >   Add College  
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

