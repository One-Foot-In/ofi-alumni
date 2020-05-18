import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Form, Button, Icon, Message, Grid, Dropdown, Label } from 'semantic-ui-react';
import { Redirect } from "react-router-dom"
import swal from "sweetalert";
import { makeCall } from "../apis";

let fieldStyle = {
    width: '100%',
}
let messageStyle = {
    padding: '20px',
    margin: '10px',
}

const gradeOptions = [9, 10, 11, 12].map(val => {
    let displayVal = val.toString() + "th"
    return {
        key: displayVal,
        text: displayVal,
        value: val
    }
});

function getErrorLabel(content) {
    return (
        <Label pointing='below' style={{'background-color': '#F6C7BD'}}> {content} </Label>
    )
}

/*
props
-isAlumni: boolean
*/
export default class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // STUDENT AND ALUMNI
            name: '', // required
            email: '', // required
            password: '', // required
            confirmPassword: '', // required
            // STUDENT ONLY
            grade: null, // required
            // ALUMNI ONLY
            graduationYear: null, // required
            location: '',
            jobTitle: '',
            company: '',
            college: '',
            // FORM-CONTROL
            signUpDone: false,
            submitting: false,
            passwordsMatching: true,
            emailValid: true
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeGrade = this.handleChangeGrade.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateSubmitReadiness = this.validateSubmitReadiness.bind(this);
        this.goBack = this.goBack.bind(this);
        this.comparePasswords = this.comparePasswords.bind(this);
        this.getAlumniFields = this.getAlumniFields.bind(this);
        this.getStudentFields = this.getStudentFields.bind(this);
    }

    handleChange(e) {
        e.preventDefault();
        let change = {}
        change[e.target.name] = e.target.value
        this.setState(change, () => {
            this.comparePasswords();
        })
    }

    handleChangeGrade(e, {value}) {
        e.preventDefault();
        this.setState({
            grade: value
        });
    }

    // Email regex borrowed from: https://www.w3resource.com/javascript/form/email-validation.php
    validateEmail() {
        return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.state.email)) 
    }

    comparePasswords() {
        this.setState({
            passwordsMatching: this.state.password === this.state.confirmPassword,
            emailValid: this.validateEmail()
        })
    }

    validateSubmitReadiness() {
        const baseCondition = (this.state.name && this.state.email && this.state.password && this.state.confirmPassword) && (this.state.confirmPassword === this.state.password);
        if (this.props.isAlumni) {
            return baseCondition && this.state.graduationYear;
        }
        return baseCondition && this.state.grade;
    }

    getAlumniFields() {
        return (
            <>
                <Form.Field
                    type="number"
                    required="true"
                    style={fieldStyle}
                >
                    <label>Graduation Year</label>
                    <input placeholder='YYYY' name="graduationYear" onChange={this.handleChange} />
                </Form.Field>
                <Form.Group>
                    <Form.Field
                        type="text"
                        style={fieldStyle}
                    >
                        <label>Location</label>
                        <input placeholder='City, Country...' name="location" onChange={this.handleChange} />
                    </Form.Field>
                    <Form.Field
                        type="text"
                        style={fieldStyle}
                    >
                        <label>Job Title</label>
                        <input placeholder='Position...' name="jobTitle" onChange={this.handleChange} />
                    </Form.Field>
                    <Form.Field
                        type="text"
                        style={fieldStyle}
                    >
                        <label>Company</label>
                        <input placeholder='Company...' name="company" onChange={this.handleChange} />
                    </Form.Field>
                    <Form.Field
                        type="text"
                        style={fieldStyle}
                    >
                        <label>College</label>
                        <input placeholder='College...' name="college" onChange={this.handleChange} />
                    </Form.Field>
                </Form.Group>
            </>
        )
    }

    getStudentFields() {
        return (
            <>
                <Form.Field>
                    <label>Grade</label>
                    <Dropdown placeholder='Select the grade you attend...' fluid selection options={gradeOptions} onChange={this.handleChangeGrade} name="grade" value={this.state.grade}/>
                </Form.Field>
            </>
        )
    }

    async handleSubmit(e) {
        e.preventDefault();
        const readyForSubmit = this.validateSubmitReadiness()
        this.setState({
            submitting: readyForSubmit,
        })
        if (readyForSubmit) {
            let payload = {
                name: this.state.name,
                email: this.state.email,
                password: this.state.password,
            }
            if (!this.props.isAlumni) {
                payload = Object.assign({}, payload, {
                    grade: this.state.grade
                });
            } else {
                payload = Object.assign({}, payload, {
                    graduationYear: this.state.graduationYear,
                    location: this.state.location,
                    jobTitle: this.state.jobTitle,
                    company: this.state.company,
                    college: this.state.college
                });
            }
            e.preventDefault();
            const endPoint = this.props.isAlumni ? '/alumni' : '/student';
            try {
                const result = makeCall(payload, endPoint, 'post')
                if (!result || result.error) {
                    swal({
                        title: "Error!",
                        text: "There was an error completing your request, please try again.",
                        icon: "error",
                    });
                } else {
                    swal({
                        title: "Congratulations!",
                        text: "Your submission was successful! Please check your email to confirm your account.",
                        icon: "success",
                        });
                    this.setState({
                        signUpDone: true
                    })
                }
            } catch (e) {
                console.log("Error: Signup#handleSubmit", e);
            }
        } else {
            swal({
                title: "Yikes!",
                text: "Please fill in all required fields to continue. Confirm that passwords match!",
                icon: "error",
            });
        }
        
    }

    goBack(e) {
        e.preventDefault();
        this.props.match.history.goBack();
    }
    render() {
        return (
            <div>
                {this.state.signUpDone? <Redirect to="/" /> :
                <div>
                    <Message
                        style= {messageStyle}
                        attached
                        centered
                        header={`${this.props.isAlumni? "Alumni" : "Student"} Sign up`}
                        content="Welcome! We're excited to have you on board."
                    />
                    <Grid>
                    <Grid.Row centered>
                        <Button onClick={this.goBack}>
                            Back
                        </Button>
                    </Grid.Row>
                    <Grid.Row centered>
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Field
                            type="email"
                            required="true"
                            style={fieldStyle}
                            error={!this.state.emailValid}
                        >
                            {!this.state.emailValid ? getErrorLabel('Please enter an invalid email!') : null}
                            <label>Email</label>
                            <input placeholder='Email' name="email" onChange={this.handleChange} />
                        </Form.Field>
                        <Form.Field
                            type="password"
                            required="true"
                            style={fieldStyle}
                            error={!this.state.passwordsMatching}
                        >
                            {!this.state.passwordsMatching ? getErrorLabel('Your passwords do not match!') : null}
                            <label>Password</label>
                            <input placeholder='***' name="password" type="password" onChange={this.handleChange} />
                        </Form.Field>
                        <Form.Field
                            type="password"
                            required="true"
                            style={fieldStyle}
                            error={!this.state.passwordsMatching}
                        >
                            {!this.state.passwordsMatching ? getErrorLabel('Your passwords do not match!') : null}
                            <label>Confirm Password</label>
                            <input placeholder='***' name="confirmPassword" type="password" onChange={this.handleChange} />
                        </Form.Field>
                        <Form.Field
                            type="text"
                            required="true"
                            style={fieldStyle}
                        >
                            <label>Name</label>
                            <input placeholder='Name' name="name" onChange={this.handleChange} />
                        </Form.Field>      
                        {this.props.isAlumni ? 
                            this.getAlumniFields() :
                            this.getStudentFields()
                        }
                        <Button 
                            color="blue" 
                            type='submit'
                            loading={this.state.submitting}>
                            <Icon name="unlock"/>
                            Submit
                        </Button>
                        </Form>
                    </Grid.Row>
                    </Grid>    
                </div>
                }
            </div>
        )
    }
}