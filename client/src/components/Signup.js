import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Form, Button, Icon, Message, Grid, Dropdown, Label, Segment, List } from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCall } from "../apis";
import LocationSelectionModal from './LocationSelectionModal';
import CollegeSelectionModal from './CollegeSelectionModal';
import CareerAndInterestsModal from './CareerAndInterestsModal';

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
        <Label pointing='below' style={{'backgroundColor': '#F6C7BD'}}> {content} </Label>
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
            schoolSelection: '', // required (id of school selected)
            schoolOptions: [],
            // STUDENT ONLY
            grade: null, // required
            // ALUMNI ONLY
            graduationYear: null, // required
            // location
            country: '',
            city: '',
            // career and interests
            existingJobTitleId: '',
            existingJobTitleName: '',
            newJobTitle: '',
            existingCompanyId: '',
            existingCompanyName: '',
            newCompany: '',
            existingInterests: [],
            newInterests: [],
            // college
            newCollege: '', // when new college is being entered
            existingCollegeId: '', // when alumni selects from existing colleges
            collegeDisplayName: '', // used for display when selecting colleges
            collegeCountry: '', // when alumni selects old college
            // FORM-CONTROL
            submitting: false,
            passwordsMatching: true,
            emailValid: true,
            locationModalOpen: false,
            collegeModalOpen: false,
            careerModalOpen: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeGrade = this.handleChangeGrade.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateSubmitReadiness = this.validateSubmitReadiness.bind(this);
        this.goBack = this.goBack.bind(this);
        this.comparePasswords = this.comparePasswords.bind(this);
        this.getAlumniFields = this.getAlumniFields.bind(this);
        this.getStudentFields = this.getStudentFields.bind(this);
        this.handleSchoolSelection = this.handleSchoolSelection.bind(this);
        this.getLocationInput = this.getLocationInput.bind(this);
        this.handleLocationModal = this.handleLocationModal.bind(this);
        this.getCollegeInput = this.getCollegeInput.bind(this);
        this.handleCollegeSelectionModal = this.handleCollegeSelectionModal.bind(this);
        this.handleCareerModal = this.handleCareerModal.bind(this);
        this.getCareerInput = this.getCareerInput.bind(this);
        this.getCareerAndInterestsDisplay = this.getCareerAndInterestsDisplay.bind(this);
    }

    getCareerInput(jobTitleObject, companyObject, interestsObj) {
        this.setState({
            existingJobTitleId: jobTitleObject.existingJobTitleId,
            existingJobTitleName: jobTitleObject.existingJobTitleName,
            newJobTitle: jobTitleObject.newJobTitle,
            existingCompanyId: companyObject.existingCompanyId,
            existingCompanyName: companyObject.existingCompanyName,
            newCompany: companyObject.newCompany,
            existingInterests: interestsObj.existingInterests, // interests are stored whole on alumni models
            newInterests: interestsObj.newInterests,
        })
    }

    getCareerAndInterestsDisplay() {
        return (
            (
                this.state.existingJobTitleId ||
                this.state.newJobTitle ||
                this.state.existingCollegeId ||
                this.state.newCompany ||
                this.state.existingInterests.length ||
                this.state.newInterests.length
            ) ?
            (
                <Segment>
                    <Icon
                        onClick={() => this.setState({
                            existingJobTitleId: '',
                            existingJobTitleName: '',
                            newJobTitle: '',
                            existingCompanyId: '',
                            existingCompanyName: '',
                            newCompany: '',
                            existingInterests: [], // interests are stored whole on alumni models
                            newInterests: [],
                        })}
                        name='delete'
                    />
                    <List divided relaxed>
                        
                        {
                        (this.state.existingJobTitleId || this.state.newJobTitle) ?
                            <List.Item>
                                <List.Content>
                                    <List.Header>Job Title</List.Header>
                                    <List.Description>{this.state.existingJobTitleName || this.state.newJobTitle}</List.Description>
                                </List.Content>
                            </List.Item> : null 
                        }
                        {
                            this.state.existingCompanyId || this.state.newCompany ?
                            <List.Item>
                                <List.Content>
                                    <List.Header>Company</List.Header>
                                    <List.Description>{this.state.existingCompanyName || this.state.newCompany}</List.Description>
                                </List.Content>
                            </List.Item> : null
                        }
                        {
                            this.state.existingInterests.length || this.state.newInterests.length ?
                            <List.Item>
                                <List.Content>
                                    <List.Header>Interests</List.Header>
                                    <List.Description>
                                        {
                                            [
                                                ...this.state.existingInterests.map(interest => interest.text).flat(),
                                                ...this.state.newInterests.map(interest => interest.text).flat()
                                            ].join(', ')
                                        }
                                    </List.Description>
                                </List.Content>
                            </List.Item> : null
                        }   
                    </List>
                </Segment>
                
            ) : null
        )
    }

    getLocationInput(country, city) {
        this.setState({country, city})
    }

    getCollegeInput(country, collegeName, collegeId) {
        if (!collegeId) {
            this.setState({
                collegeCountry: country,
                newCollege: collegeName,
                collegeDisplayName: `${collegeName} (${country})`
            })
        } else {
            this.setState({
                collegeCountry: country,
                existingCollegeId: collegeId,
                collegeDisplayName: collegeName
            })
        }
    }

    handleLocationModal() {
        this.setState({locationModalOpen: !this.state.locationModalOpen})
    }

    handleCollegeSelectionModal() {
        this.setState({collegeModalOpen: !this.state.collegeModalOpen})
    }

    handleCareerModal() {
        this.setState({careerModalOpen: !this.state.careerModalOpen})
    }

    getLocationDisplay() {
        return (
            <Label
                style={{'margin': '2px'}}
            >
                {this.state.city} ({this.state.country})
                <Icon
                    onClick={() => this.setState({
                        country: '',
                        city: ''
                    })}
                    name='delete'
                />
            </Label>
        )
    }

    getCollegeDisplay() {
        return (
            <Label
                style={{'margin': '2px'}}
            >
                {this.state.collegeDisplayName}
                <Icon
                    onClick={() => this.setState({
                        collegeDisplayName: '',
                        newCollege: '',
                        existingCollegeId: ''
                    })}
                    name='delete'
                />
            </Label>
        )
    }

    async componentWillMount() {
        let result = await makeCall(null, '/drop/schoolsOptions', 'get')
        this.setState({
            schoolOptions: result.options
        })
    }

    handleSchoolSelection(e, {value}) {
        e.preventDefault()
        this.setState({schoolSelection : value})
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
        const baseCondition = (this.state.name && this.state.email && this.state.password && this.state.schoolSelection && this.state.confirmPassword) && (this.state.confirmPassword === this.state.password);
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
                    required={true}
                    style={fieldStyle}
                >
                    <label>Graduation Year</label>
                    <input placeholder='YYYY' name="graduationYear" onChange={this.handleChange} />
                </Form.Field>
                <Form.Group>
                    <Form.Field>
                        {(this.state.country && this.state.city) ?
                        this.getLocationDisplay() :
                        <>
                            <Button
                                primary
                                color="blue"
                                type="button"
                                onClick={() => {this.setState({locationModalOpen: true})}}
                            >
                                Add Location
                            </Button>
                            <LocationSelectionModal
                                getInput={this.getLocationInput}
                                modalOpen={this.state.locationModalOpen}
                                closeModal={this.handleLocationModal}
                            />
                        </>
                        }
                    </Form.Field>
                    <Form.Field>
                        <>
                            <Button
                                primary
                                color="blue"
                                type="button"
                                onClick={() => {this.setState({careerModalOpen: true})}}
                            >
                                Add Career and Interests
                            </Button>
                            <CareerAndInterestsModal
                                // Job Title
                                existingJobTitleId={this.state.existingJobTitleId}
                                existingJobTitleName={this.state.existingJobTitleName}
                                newJobTitle={this.state.existingJobTitleName}
                                // Company
                                existingCompanyId={this.state.existingCompanyId}
                                existingCompanyName={this.state.existingCompanyName}
                                newCompany={this.state.newCompany}
                                // Interests
                                existingInterests={this.state.existingInterests}
                                newInterests={this.state.newInterests}

                                getInput={this.getCareerInput}
                                modalOpen={this.state.careerModalOpen}
                                closeModal={this.handleCareerModal}
                            />
                        </>
                    </Form.Field>
                    <Form.Field>
                        {
                            (this.state.collegeDisplayName) ?
                            this.getCollegeDisplay() :
                            <>
                                <Button
                                    primary
                                    color="blue"
                                    type="button"
                                    onClick={() => {this.setState({collegeModalOpen: true})}}
                                >
                                    Add College
                                </Button>
                                <CollegeSelectionModal
                                    getInput={this.getCollegeInput}
                                    modalOpen={this.state.collegeModalOpen}
                                    closeModal={this.handleCollegeSelectionModal}
                                />
                            </>
                        }
                    </Form.Field>
                </Form.Group>
                {this.getCareerAndInterestsDisplay()}
            </>
        )
    }

    getStudentFields() {
        return (
            <>
                <Form.Field>
                    <label>Grade</label>
                    <Dropdown placeholder='Select the grade you attend...' selection options={gradeOptions} onChange={this.handleChangeGrade} name="grade" value={this.state.grade}/>
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
                timeZone: ((new Date().getTimezoneOffset())*100)/60, // getTimezoneOffset fetches offset in minutes
                schoolId: this.state.schoolSelection
            }
            if (!this.props.isAlumni) {
                payload = Object.assign({}, payload, {
                    grade: this.state.grade
                });
            } else {
                payload = Object.assign({}, payload, {
                    graduationYear: this.state.graduationYear,
                    country: this.state.country,
                    city: this.state.city,
                    // career
                    existingJobTitleId: this.state.existingJobTitleId,
                    newJobTitle: this.state.newJobTitle,
                    existingCompanyId: this.state.existingCompanyId,
                    newCompany: this.state.newCompany,
                    // college
                    newCollege: this.state.newCollege, // when new college is being entered
                    existingCollegeId: this.state.existingCollegeId, // when alumni selects from existing colleges
                    collegeCountry: this.state.collegeCountry,
                    //interests
                    existingInterests: this.state.existingInterests, // interests are stored whole on alumni models
                    newInterests: this.state.newInterests
                });
            }
            e.preventDefault();
            const endPoint = this.props.isAlumni ? '/alumni' : '/student';
            try {
                const result = await makeCall(payload, endPoint, 'post')
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: "There was an error completing your request, please try again.",
                            icon: "error",
                        });
                    })
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Congratulations!",
                            text: "Your submission was successful! Please check your email to confirm your account.",
                            icon: "success",
                        }).then(() => 
                            this.props.match.history.push('/login')
                        );
                    })
                    
                }
            } catch (e) {
                this.setState({
                    submitting: false
                }, () => {
                    console.log("Error: Signup#handleSubmit", e);
                })
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
                            required={true}
                            style={fieldStyle}
                            error={!this.state.emailValid}
                        >
                            {!this.state.emailValid ? getErrorLabel('Please enter a valid email!') : null}
                            <label>Email</label>
                            <input placeholder='Email' name="email" onChange={this.handleChange} />
                        </Form.Field>
                        <Form.Field
                            type="password"
                            required={true}
                            style={fieldStyle}
                            error={!this.state.passwordsMatching}
                        >
                            {!this.state.passwordsMatching ? getErrorLabel('Your passwords do not match!') : null}
                            <label>Password</label>
                            <input placeholder='***' name="password" type="password" onChange={this.handleChange} />
                        </Form.Field>
                        <Form.Field
                            type="password"
                            required={true}
                            style={fieldStyle}
                            error={!this.state.passwordsMatching}
                        >
                            {!this.state.passwordsMatching ? getErrorLabel('Your passwords do not match!') : null}
                            <label>Confirm Password</label>
                            <input placeholder='***' name="confirmPassword" type="password" onChange={this.handleChange} />
                        </Form.Field>
                        <Form.Field
                            type="text"
                            required={true}
                            style={fieldStyle}
                        >
                            <label>Name</label>
                            <input placeholder='Name' name="name" onChange={this.handleChange} />
                        </Form.Field>
                        <Form.Field>
                            <label>High School</label>
                            <Dropdown
                                style={{ 'margin': '5px', 'width': '80%'}}
                                placeholder={'Select your high school network'}
                                search
                                selection
                                options={this.state.schoolOptions}
                                value={this.state.value}
                                onChange={this.handleSchoolSelection}
                            />
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
        )
    }
}