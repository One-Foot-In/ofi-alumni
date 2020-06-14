import React, { Component } from 'react';
import { Segment, Card, Image, Button, Modal, Header, Grid } from 'semantic-ui-react';
import { makeCall } from '../apis'
import StudentProfile from './StudentProfile'

/*
    props:
    - schoolId: String
    - grade
*/
export default class StudentVerification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            entries: [],
            dropdownOptions: [],
            display: [],
            showApproved: false,
            recentName: ''
        }
    }

    async componentWillMount(){
        let result = await this.getEntries()
        this.setState({
            entries: result.unapproved.reverse()
        })
        this.createDisplay()
    }

    getEntries() {
        return makeCall(null, `/student/${this.props.schoolId}/moderator/${this.props.grade}/unapproved/`, 'get').catch(e => console.log(e))
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
                        onClick={this.handleClick.bind(this)}
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

    createDisplay(value) {
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
        let entries = await makeCall({id: e.currentTarget.dataset.id}, '/student/approve/', 'post');
        this.setState({
            entries: entries.unapproved,
            showApproved: true,
            recentName: entries.name
        })
    }

    render(){
        return (
            <>
            <Segment inverted color='blue' tertiary>Showing unapproved individuals from Grade {this.props.grade}. Please only verify individuals that you know personally!</Segment>
            {this.state.display}
            </>
        )
    }
}