import React, { Component } from 'react';
import { Message, Menu, Card, Grid, Label} from 'semantic-ui-react';
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
            collegeShortList: []
        }

        this.getCollegeShortList = this.getCollegeShortList.bind(this)
        this.renderCollegeShortList = this.renderCollegeShortList.bind(this)
        this.handleMenuClick = this.handleMenuClick.bind(this)
    }

    async componentWillMount() {
        await this.getCollegeShortList();
    }

    handleMenuClick = (e, { id }) => this.setState({ activeItem: id })

    async getCollegeShortList() {
        await makeCall({}, `/student/collegeShortList/${this.props.userDetails._id}`, 'get')
        .then(res => {
            this.setState({
                collegeShortList: res
            })
        })
        .catch(e => {
            console.log("Error", e);
        })
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
            </Menu>
            <Grid stackable divided="vertically">
                <Grid.Row centered> {this.props.userDetails.name}'s College ShortList </Grid.Row>
                {this.renderCollegeShortList()}
            </Grid>
            </>
        )
    }
}