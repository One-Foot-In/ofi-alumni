import React, { Component } from 'react';
import { Menu} from 'semantic-ui-react';
import StudentOpportunities from './StudentOpportunities'
import { Message, Menu, Card, Grid, Label, Dropdown, Button, Icon} from 'semantic-ui-react';
import { makeCall } from '../apis'


/*
props:
    activeItem
    collegeShortList
*/
export default class StudentWorkspace extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeItem: 'collegeShortList',
            collegeShortList: [],
            allExistingColleges: [],
            selectedCollegeId: ''
        }

        this.getCollegeShortList = this.getCollegeShortList.bind(this)
        this.getAllExistingColleges = this.getAllExistingColleges.bind(this)
        this.renderCollegeShortList = this.renderCollegeShortList.bind(this)
        this.addSelectedCollege = this.addSelectedCollege.bind(this)
        this.handleMenuClick = this.handleMenuClick.bind(this)
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    async componentWillMount() {
        await this.getCollegeShortList();
        await this.getAllExistingColleges();
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })
   
    handleDropdownChange = (e, { key, value }) => {
        this.setState({ selectedCollegeId: {name: key, id: value} })
        console.log(this.state.selectedCollegeId)
        console.log("changed")
    }

    async getCollegeShortList() {
        await makeCall({}, `/student/collegeShortList/${this.props.userDetails._id}`, 'get')
        .then(res => {
            this.setState({
                collegeShortList: res
            })
        })
        .catch(e => {
            console.log("Error, couldn't get collegeShortList", e);
        })
    }

    async getAllExistingColleges() {
        await makeCall({}, `/drop/colleges`, 'get')
        .then(res => {
            this.setState({
                allExistingColleges: res
            })
        })
        .catch(e => {
            console.log("Error, couldn't get all existing colleges", e);
        })
    }

    async addSelectedCollege() {
        console.log('hi', this.state.selectedCollegeId)

        let payload = {
            newColleges:[{name: "Georgetown", country: "United States of America"}, {name: "Northeastern", country: "United States of America"}]
        }
        
        await makeCall(payload, `/student/collegeShortList/add/${this.state.selectedCollegeId}`, 'patch')
    }

    renderCollegeShortList() {
        let colleges = this.state.collegeShortList;

        if(this.state.collegeShortList === [] || this.state.collegeShortList === null) {
            return(
                <Message info>
                    <Message.Header> No colleges in college shortlist.</Message.Header> {
                        <Message.Content> Please add colleges to your college shortlist </Message.Content>
                    }
                </Message>
            )
        } else {
            return (
                colleges.map(college => {
                    return(
                        <> 
                        <Grid.Row left = 'true'>
                            <Grid.Column>
                                <Card
                                    key = {college._id}
                                    style = {{ 'margin': '8px'}, {'width': '200px'}}
                                    color = 'blue' 
                                >
                                    <Card.Content> 
                                        <Card.Header> {college.name} </Card.Header>
                                        <Card.Meta> {college.country} </Card.Meta>
                                        <i className="close icon" ></i>
                                    </Card.Content>
                                </Card>
                            </Grid.Column>
                        </Grid.Row>
                        </>
                    )
                })
            )
        }
    }
    
    render() {
        let allColleges = this.state.allExistingColleges
        const allOptions = allColleges.map(({ key, value }) => ({ text: key, value: value}))
        console.log("allOptions: ", allOptions)

        return(
            <>
            <Menu>
                <Menu.Item
                    key = 'collegeShortList'
                    id='collegeShortList'
                    active={this.state.activeItem === 'collegeShortList'}
                    onClick={this.handleMenuClick}
                >
                    College ShortList          
                    <Label color='teal'>{this.state.collegeShortList.length}</Label>  
                </Menu.Item>
                <Menu secondary stackable>
                    <Menu.Item
                        id='opportunities'
                        name='Opportunities'
                        active={this.state.activeItem === 'opportunities'}
                        onClick={this.handleMenuClick}
                    >
                        Opportunities             
                    </Menu.Item>
                </Menu>
            </Menu>
            {
                this.state.activeItem === 'opportunities' &&
                <StudentOpportunities
                    studentId={this.props.userDetails._id}
                />
            }
            <Grid stackable divided="vertically">
                <Grid.Row centered> {this.props.userDetails.name}'s College ShortList </Grid.Row>
                <Grid.Row columns={2}>
                <Grid.Column>
                    <Dropdown
                            placeholder="Search for a college to add to your shortlist"
                            style={{'margin': '5px'}}
                            fluid
                            search
                            selection
                            options={allOptions}
                            onChange={this.handleDropdownChange}
                    />
                </Grid.Column>
                <Button     
                    color="blue"
                    type="button"
                    size="mini"
                    onClick={this.addSelectedCollege}>
 
                    <Icon name="add" style={{'margin': '3px'}}></Icon> 
                </Button>
                </Grid.Row>
                {this.renderCollegeShortList()}
            </Grid>
            </>
        )
    }
}