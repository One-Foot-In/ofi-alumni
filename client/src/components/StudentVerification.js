import React, { Component } from 'react';
import { Segment, Card, Image, Button, Modal, Header, Grid } from 'semantic-ui-react';
import { makeCall } from '../apis'
import StudentProfile from './StudentProfile'

/*
    props:
    - schoolId: String
    - grade
    - studentId: String
*/
export default class StudentVerification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            entries: [],
            display: [],
            showApproved: false,
            recentName: ''
        }
        this.createDisplay = this.createDisplay.bind(this)
        this.constructProfile = this.constructProfile.bind(this)
        this.getEntries = this.getEntries.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    async UNSAFE_componentWillMount(){
        let result = await this.getEntries()
        this.setState({
            entries: result.unapproved.reverse()
        })
        this.createDisplay()
    }

    getEntries() {
        return makeCall(null, `/student/${this.props.studentId}/moderator/${this.props.grade}/unapproved/`, 'get').catch(e => console.log(e))
    }

    constructProfile(profile) {
        return (
            <div style={{padding: 10}} key={profile._id}>
                <Card fluid>
                    <Modal closeIcon onClose={this.close} dimmer='blurring' trigger={
                        <Card.Content data-id={profile._id}>
                            <Image
                            floated='left'
                            size='mini'
                            src={profile.imageURL}
                            />
                            <Card.Header>{profile.name}</Card.Header>
                        </Card.Content>
                    }>
                        <Header>
                            <Grid>
                                <Grid.Row columns={2}>
                                    <Grid.Column>Details for {profile.name}</Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Header>
                        <Modal.Content>
                            <StudentProfile details={profile} isViewOnly={true} />
                        </Modal.Content>
                    </Modal>
                    <Card.Content extra>
                        <Button 
                        inverted color='green'
                        onClick={this.handleClick}
                        data-id={profile._id}
                        key={profile.name}
                        fluid
                        >
                            Approve
                        </Button>
                    </Card.Content>
                </Card>
            </div>
        )
    }

    createDisplay() {
        let display = []
        if (this.state.showApproved) {
            display.push(<Segment inverted color='green' tertiary>Approved {this.state.recentName}</Segment>)
        }
        for (let profile of this.state.entries) {
            display.push(this.constructProfile(profile))
        }
        this.setState({
            display: display
        })
    }

    async handleClick(e, key) {
        e.preventDefault();
        let entries = await makeCall({
            id: e.currentTarget.dataset.id,
            grade: this.props.grade
        }, '/student/approve/', 'post');
        this.setState({
            entries: entries.unapproved,
            showApproved: true,
            recentName: entries.name
        }, () => this.createDisplay())
    }

    render(){
        return (
            this.state.entries.length ?
            <>
            <Segment inverted color='blue' tertiary>Showing unapproved individuals from Grade {this.props.grade}. Please only verify individuals that you know personally!</Segment>
            {this.state.display}
            </> :
            <Segment inverted color='green' tertiary>No students from grade {this.props.grade} are currently awaiting approval.</Segment>
        )
    }
}