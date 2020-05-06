import React, { Component } from 'react';
import { Segment, Grid, Message, Select, Button, Modal, Form, Table } from 'semantic-ui-react';
import SearchBar from "./SearchBar";
import swal from 'sweetalert';
import { makeCall } from '../apis';

const gradeOptions = [0, 9, 10, 11, 12].map(val => {
    let displayVal = val === 0 ? "All Grades" : val.toString() + "th"
    return {
        key: val, text: displayVal, value: val
    }
});

const MAX_CHARS_MESSAGE = 1000;

/*
props:
- isStudentView: boolean
*/
export default class StaffView extends Component {
    constructor(props){
        super(props);
        this.state = {
            students: [],
            teachers: [],
            searchTerms: '',
            searchMode: false,
            searchGrade: 0,
            modalOpen: false,
            message: '',
            recipientEmail: '',
            recipientName: '',
            sendingRequest: false,
            fetching: false,
        }
        this.generateList = this.generateList.bind(this);
        this.updateSearchTerms = this.updateSearchTerms.bind(this);
        this.handleChangeGrade = this.handleChangeGrade.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.openMessageModal = this.openMessageModal.bind(this);
        this.closeMessageModal = this.closeMessageModal.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.filterResults = this.filterResults.bind(this);
    }

    componentDidMount() {
        this.setState({
            fetching: true
        }, async () => {
            try {
                if (!this.props.isStudentView) {
                    let result = await makeCall({}, '/staff/teachers', 'GET');
                    if (result && !result.error) {
                        const teachers = result.teachers;
                        this.setState({
                            teachers,
                            fetching: false
                        });
                    }
                } else if (this.props.isStudentView) {
                    let result = await makeCall({}, '/staff/students', 'GET');
                    if (result && !result.error) {
                        const students = result.students;
                        this.setState({
                            students,
                            fetching: false
                        });
                    }
                }
            } catch (e) {
                console.log("Error: Tracking#componentDidMount", e)
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

    sendMessage(e) {
        e.preventDefault();
        this.setState({
            sendingRequest: true
        }, async () => {
            const email = this.state.recipientEmail;
            const message = this.state.message;
            try {
                const result = await makeCall({email, message}, '/staff/sendMessage', 'post');
                this.setState({
                    sendingRequest: false,
                    modalOpen: false,
                    message: '',
                    recipientEmail: ''
                });
                if (!result || result.error) {
                    swal({
                        title: "Error!",
                        text: `There was an error messaging the ${this.props.isStudentView ? 'student' : 'teacher'}, please try again.`,
                        icon: "error",
                    });
                } else {
                    swal({
                        title: "Success!",
                        text: `You have successfully messaged the ${this.props.isStudentView ? 'student' : 'teacher'}.`,
                        icon: "success",
                    });
                }
            } catch (e) {
                console.log("Error: Tracking#sendMessage", e);
            }
        })
    }

    openMessageModal(e, email, name) {
        e.preventDefault();
        this.setState({
            modalOpen: true,
            recipientEmail: email,
            recipientName: name
        })
    }

    closeMessageModal(e) {
        e.preventDefault();
        this.setState({
            modalOpen: false,
            recipientEmail: '',
            recipientName: '',
            message: ''
        })
    }

    generateList(MemberObjects) {
        const tableHeader = 
            <Table.Header>
                <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                {this.props.isStudentView ? <Table.HeaderCell>Grade</Table.HeaderCell> : null}
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Message</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

        const tableBody =
            <Table.Body>
                {MemberObjects && MemberObjects.map(member => {
                    return (
                    <Table.Row>
                        <Table.Cell>{member.name}</Table.Cell>
                        {this.props.isStudentView ? <Table.Cell>{member.grade && member.grade.toString() + "th"}</Table.Cell> : null}
                        <Table.Cell>{member.email}</Table.Cell>
                        <Table.Cell>
                            <Modal
                                open={this.state.modalOpen}
                            >
                                <Modal.Header>Messaging {this.state.recipientName}</Modal.Header>
                                <Modal.Content>
                                    <Form onSubmit={this.sendMessage}>
                                    <Form.Field
                                        type="text">
                                            <label>Message</label>
                                            <input maxlength={MAX_CHARS_MESSAGE} placeholder='Your message...' name="message" onChange={this.handleChange} value={this.state.message} />
                                        </Form.Field>
                                        <Button 
                                            color="blue" 
                                            type='submit'
                                            loading={this.state.sendingRequest}
                                            disabled={!this.state.message || this.state.sendingRequest}
                                        >
                                            Send
                                        </Button>
                                    </Form>
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button onClick={this.closeMessageModal}>
                                        Done
                                    </Button>
                                </Modal.Actions>
                            </Modal>
                            <Button
                                disabled={this.state.sendingRequest}
                                style={{'height':'80%', 'margin': '2px 0 2px 0'}}
                                onClick={(e) => this.openMessageModal(e, member.email, member.name)}
                            >
                                Message
                            </Button>
                        </Table.Cell>
                    </Table.Row>
                    )
                })}
            </Table.Body>
        return (
            <Table style={{width: '80%'}} celled>
                {tableHeader}
                {tableBody}
                <Table.Footer style={{margin: '10px 0 10px 0'}}>
                    {/* TODO: Add pagination for when there are many records */}
                </Table.Footer>
            </Table> 
        )
    }

    updateSearchTerms(e, searchObject) {
        let searchTerms = searchObject.value;
        e.preventDefault();
        this.setState({
            searchMode: true,
            searchTerms: searchTerms
        })
        if (!searchTerms && !this.state.searchGrade) {
            this.setState({
                searchMode: false
            })
        }
    }

    handleChangeGrade(e, {value}) {
        e.preventDefault();
        this.setState({
            searchGrade: value,
            searchMode: true
        })
    }

    getBagofWords(member) {
        return [member.name, member.email];
    }

    clearSearch(e) {
        e.preventDefault();
        this.setState({
            searchMode: false,
            searchTerms: '',
            searchGrade: 0
        })
    }

    filterResults(MemberObjects) {
        // eslint-disable-next-line
        let gradeFilteredMembers = MemberObjects;
        // 0 implies an all grades selection
        if (this.state.searchGrade && this.state.searchGrade !== 0) {
            gradeFilteredMembers = MemberObjects.filter(member => {
                return (member.grade) === this.state.searchGrade
            });
        }
        if (this.state.searchTerms) {
            return gradeFilteredMembers.filter(member => {
                let bagOfWords = this.getBagofWords(member);
                let searchTerms = this.state.searchTerms;
                for (let i = 0; i < bagOfWords.length; i++) {
                    if (bagOfWords[i].toLowerCase().includes(searchTerms.toLowerCase())) {
                        return true;
                    }
                }
            })
        }
        return gradeFilteredMembers;
    }

    render() {
        const cardStyle ={
            width: '100%',
            padding: '5px',
            margin: '5px',
        }
        return (
            <Segment loading={this.state.fetching} centered={true} style={cardStyle}>
                <Grid centered={true} rows={3}>
                    <Grid.Row centered style={{'margin': "20px 0 10px 0"}}>
                        {this.props.isStudentView ? 
                            <Grid.Column width={5}> 
                                <Select placeholder='Select Grade...' options={gradeOptions} onChange={this.handleChangeGrade}/> 
                            </Grid.Column> :
                            null
                        }
                        <Grid.Column width={5}> 
                            <SearchBar
                                onSearchMode={this.updateSearchTerms}
                                searchValue={this.state.searchTerms}
                            /> 
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Message
                            style={{'margin': "20px 0 10px 0", width: '80%'}}
                            content={`The following are all the verified and approved ${this.props.isStudentView ? 'students' : 'teachers'} in the system.`}
                        />
                    </Grid.Row>
                    <Grid.Row
                        style={{'margin': '10px 0 10px 0'}}
                    >
                        {
                            this.state.searchMode ?
                            this.generateList(this.filterResults(
                                this.props.isStudentView ? this.state.students : this.state.teachers
                                )
                            ) :
                            this.generateList(
                                this.props.isStudentView ? this.state.students : this.state.teachers
                                )
                        }
                    </Grid.Row>
                </Grid>
            </Segment>
        )
    }
}
