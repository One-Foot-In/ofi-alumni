import React from 'react'
import { Grid, Message, Segment, Form, Button, TextArea, Icon, Table, Select } from 'semantic-ui-react'
import { makeCall } from '../apis';
import swal from "sweetalert";

const gradeOptions = [9, 10, 11, 12].map(grade => {
    let displayVal = grade.toString() + "th"
    return {
        text: displayVal,
        key: displayVal,
        value: grade
    }
})

/*
props:
- isStudentView: boolean
*/
export default class Management extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            emailString: '',
            pendingStudents: [],
            pendingTeachers: [],
            fetching: false,
            sendingRequest: false,
            gradeToInvite: null
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleInvite = this.handleInvite.bind(this);
        this.generateRequests = this.generateRequests.bind(this);
        this.handleApproval = this.handleApproval.bind(this);
        this.handleReject = this.handleReject.bind(this);
        this.shouldShowTable = this.shouldShowTable.bind(this);
        this.handleGradeSelect = this.handleGradeSelect.bind(this);
    }

    componentDidMount() {
        this.setState({
            fetching: true
        }, async () => {
            try {
                if (this.props.isStudentView) {
                    let result = await makeCall({}, `/staff/pending/students`, 'GET');
                    if (result && !result.error) {
                        const pendingStudents = result.data
                        this.setState({
                            pendingStudents,
                            fetching: false
                        });
                    } else {
                        this.setState({
                            fetching: false
                        });
                    }
                } else if (!this.props.isStudentView) {
                    let result = await makeCall({}, '/staff/pending/teachers', 'GET');
                    if (result && !result.error) {
                        const pendingTeachers = result.data
                        this.setState({
                            pendingTeachers,
                            fetching: false
                        });
                    } else {
                        this.setState({
                            fetching: false
                        });
                    }
                }
            } catch (e) {
                console.log("Error: Management#componentDidMount")
                this.setState({
                    fetching: false
                })
            }
        })
        
    }

    handleChange(e) {
        e.preventDefault();
        let change = {}
        change[e.target.name] = e.target.value
        this.setState(change)
    }

    handleGradeSelect(e, {value}) {
        e.preventDefault();
        this.setState({
            gradeToInvite: value
        });
    }

    async handleInvite(e) {
        e.preventDefault();
        const emailsArr = this.state.emailString.replace(/\s/g, '').split(',');
        this.setState({sendingRequest: true});
        const payload = {
            emails: emailsArr,
            grade: this.state.gradeToInvite
        };
        const endPoint = this.props.isStudentView ? '/staff/invite/students' : '/staff/invite/teachers'
        try {
            const result = await makeCall(payload, endPoint, 'post')
            if (!result || result.error) {
                this.setState({
                    sendingRequest: false
                }, () => {
                    swal({
                        title: "Error!",
                        text: `There was an error inviting the ${this.props.isStudentView ? 'student' : 'teachers'}, please try again.`,
                        icon: "error",
                    });
                });
            } else {
                this.setState({
                    sendingRequest: false,
                    emailString: '',
                    gradeToInvite: null
                }, () => {
                    swal({
                        title: "Success!",
                        text: `You've successfully invited all ${this.props.isStudentView ? 'students' : 'teachers'}!`,
                        icon: "success",
                    });
                });
            }
        } catch (e) {
            this.setState({
                sendingRequest: false
            }, () => {
                swal({
                    title: "Error!",
                    text: `There was an error inviting the ${this.props.isStudentView ? 'student' : 'teachers'}, please try again.`,
                    icon: "error",
                });
            });
            console.log("Error: Management#handleInvite", e)
        }
    }

    async handleApproval(email) {
        this.setState({sendingRequest: true});
        const payload = {
            approved: true,
            email: email
        };
        const endPoint = '/staff/approve/'
        try {
            const result = await makeCall(payload, endPoint, 'post');
            if (!result || result.error) {
                this.setState({
                    sendingRequest: false
                }, () => {
                    swal({
                        title: "Error!",
                        text: `There was an error approving the ${this.props.isStudentView ? 'student' : 'teachers'}, please try again.`,
                        icon: "error",
                    });
                });
            } else {
                this.setState({
                    sendingRequest: false
                }, () => {
                    swal({
                        title: "Success!",
                        text: `You've successfully approved the ${this.props.isStudentView ? 'students' : 'teachers'}!`,
                        icon: "success",
                    });
                });
            }
        } catch (e) {
            console.log("Error: Management#handleApproval", e);
        }
    }

    async handleReject(email) {
        this.setState({sendingRequest: true});
        const endPoint = `/staff/${this.props.isStudentView ? 'student' : 'teacher'}/${email}`
        try {
            const result = await makeCall({}, endPoint, 'delete');
            if (!result || result.error) {
                this.setState({
                    sendingRequest: false
                }, () => {
                    swal({
                        title: "Error!",
                        text: `There was an error rejecting the ${this.props.isStudentView ? 'student' : 'staff'}, please try again.`,
                        icon: "error",
                    })
                });
            } else {
                this.setState({
                    sendingRequest: false
                }, () => {
                    swal({
                        title: "Success!",
                        text: `You've successfully rejected the ${this.props.isStudentView ? 'student' : 'staff'}!`,
                        icon: "success",
                    })
                });
            }
        } catch(e) {
            this.setState({
                sendingRequest: false
            }, () => {
                swal({
                    title: "Error!",
                    text: `There was an error rejecting the ${this.props.isStudentView ? 'student' : 'staff'}, please try again.`,
                    icon: "error",
                })
            });
            console.log("Error: Management#handleReject", e);
        }
    }

    shouldShowTable() {
        let showTable = this.props.isStudentView ? 
        (this.state.pendingStudents && this.state.pendingStudents.length) :
        ((this.state.pendingTeachers && this.state.pendingTeachers.length))
        return showTable;
    }

    generateRequests() {
        if (this.props.isStudentView) {
            const items = this.state.pendingStudents;
            const tableHeader = 
                <Table.Header>
                    <Table.Row>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Grade</Table.HeaderCell>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                    <Table.HeaderCell>Approval</Table.HeaderCell>
                    <Table.HeaderCell>Rejection</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
            
            const tableBody = 
                <Table.Body>
                    {items.map(member => {
                        return (
                        <Table.Row>
                            <Table.Cell>{member.name}</Table.Cell>
                            <Table.Cell>{member.grade}</Table.Cell>
                            <Table.Cell>{member.email}</Table.Cell>
                            <Table.Cell>
                                <Button
                                    disabled={this.state.sendingRequest}
                                    style={{'height':'80%', 'margin': '2px 0 2px 0'}}
                                    onClick={() => this.handleApproval(member.email)}
                                >
                                    Approve
                                </Button>
                            </Table.Cell>
                            <Table.Cell>
                                <Button
                                    disabled={this.state.sendingRequest}
                                    style={{'height':'80%', 'margin': '2px 0 2px 0'}}
                                    onClick={() => this.handleReject(member.email)}
                                >
                                    Reject
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                        )
                    })}
                </Table.Body>
          return (
            <Table celled>
                {tableHeader}
                {tableBody}
                <Table.Footer style={{margin: '10px 0 10px 0'}}>
                    {/* TODO: Add pagination for when there are many records */}
                </Table.Footer>
            </Table>
          )
        }
        const items = this.state.pendingTeachers;
        const tableHeader = 
            <Table.Header>
                <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Approval</Table.HeaderCell>
                <Table.HeaderCell>Rejection</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
        
        const tableBody = 
            <Table.Body>
                {items.map(member => {
                    return (
                    <Table.Row>
                        <Table.Cell>{member.name}</Table.Cell>
                        <Table.Cell>{member.email}</Table.Cell>
                        <Table.Cell>
                            <Button
                                disabled={this.state.sendingRequest}
                                style={{'height':'80%', 'margin': '2px 0 2px 0'}}
                                onClick={() => this.handleApproval(member.email)}
                            >
                                Approve
                            </Button>
                        </Table.Cell>
                        <Table.Cell>
                            <Button
                                disabled={this.state.sendingRequest}
                                style={{'height':'80%', 'margin': '2px 0 2px 0'}}
                                onClick={() => this.handleReject(member.email)}
                            >
                                Reject
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                    )
                })}
            </Table.Body>
        return (
        <Table celled>
            {tableHeader}
            {tableBody}
            <Table.Footer style={{margin: '10px 0 10px 0'}}>
                {/* TODO: Add pagination for when there are many records */}
            </Table.Footer>
        </Table>
        )
    }

    render() {
        const cardStyle ={
            width: '100%',
            padding: '5px',
            margin: '5px',
        }
        return (
            <Segment loading={this.state.fetching} centered={true} style={cardStyle}>
                <Grid centered={true} rows={5}>
                    <Form style={{width: '80%'}}>
                        <Grid.Row>
                            <Message
                                style={{'margin': "20px 0 10px 0"}}
                                content={`Invite ${this.props.isStudentView ? 'student' : 'teacher'} to system. Enter all emails to invite as a comma-separated list.`}
                            />
                        </Grid.Row>
                        {
                            this.props.isStudentView ? 
                            <Grid.Row>
                                <Select placeholder="Select grade to invite" options={gradeOptions} defaultValue={null} name="gradeToInvite" onChange={this.handleGradeSelect}/>
                            </Grid.Row> : null
                        }
                        <Grid.Row>
                            <Grid.Column width={12}>
                                <TextArea 
                                    disabled={this.state.sendingRequest}
                                    style={{'margin': '10px 0 10px 0'}}
                                    placeholder='member1@gmail.com, member2@yahoo.com, ...'
                                    name="emailString"
                                    value={this.state.emailString}
                                    onChange={this.handleChange}
                                />
                            </Grid.Column>
                            <Grid.Column width={4}>
                                <Button
                                    onClick={this.handleInvite}
                                    disabled={!this.state.emailString || this.state.sendingRequest || (this.props.isStudentView && !this.state.gradeToInvite)}
                                >
                                    <Icon name="paper plane"/>
                                    Invite
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Message
                                style={{'margin': "20px 0 20px 0"}}
                                content={
                                    this.shouldShowTable() ? 
                                            `There are pending requests` : `There are no pending requests.`}
                            />
                        </Grid.Row>
                        {this.shouldShowTable() ?
                        <Grid.Row
                            style={{'margin': '10px 0 10px 0'}}
                        >
                            {this.generateRequests()}
                        </Grid.Row> :
                            null
                        }
                    </Form>
                </Grid>
            </Segment>
        )
    }
    
}