import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Form, Button, Icon, Message, Grid, Dropdown, Label } from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCall } from "../apis";
import LocationSelectionModal from './LocationSelectionModal';
import CollegeSelectionModal from './CollegeSelectionModal';
import AddInterestsModal from './AddInterestsModal';
import MajorSelectionModal from './MajorSelectionModal';
import CompanySelectionModal from './CompanySelectionModal';
import JobTitleSelectionModal from './JobTitleSelectionModal';

let fieldStyle = {
    width: '90%',
    'margin-left': 'auto',
    'margin-right': 'auto'
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
            // major
            newMajor: '', // when new college is being entered
            existingMajorId: '', // when alumni selects from existing colleges
            majorDisplayName: '', // used for display when selecting colleges
            // FORM-CONTROL
            submitting: false,
            passwordsMatching: true,
            emailValid: true,
            locationModalOpen: false,
            collegeModalOpen: false,
            careerModalOpen: false,
            majorModalOpen: false,
            interestsModalOpen: false,
            companyModalOpen: false,
            jobTitleModalOpen: false
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
        this.handleMajorSelectionModal = this.handleMajorSelectionModal.bind(this);
        this.getMajorInput = this.getMajorInput.bind(this);
        this.getMajorDisplay = this.getMajorDisplay.bind(this);
        this.getInterestsInput = this.getInterestsInput.bind(this);
        this.handleInterestsModal = this.handleInterestsModal.bind(this);
        this.getInterestsForDisplay = this.getInterestsForDisplay.bind(this);
        this.removeInterest = this.removeInterest.bind(this);
        this.handleCompanySelectionModal = this.handleCompanySelectionModal.bind(this);
        this.handleJobTitleSelectionModal = this.handleJobTitleSelectionModal.bind(this);
        this.getCompanyDisplay = this.getCompanyDisplay.bind(this);
        this.getJobTitleDisplay = this.getJobTitleDisplay.bind(this);
        this.getCompanyInput = this.getCompanyInput.bind(this);
        this.getJobTitleInput = this.getJobTitleInput.bind(this);
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

    /**
     * lifts major selection from major modal to main Sign Up form's context
     * @param {String} majorName, can be existing or new major 
     * @param {*} majorId, has value when major is picked from an existing option 
     */
    getMajorInput(majorName, majorId) {
        if (!majorId) {
            this.setState({
                newMajor: majorName,
                majorDisplayName: majorName
            })
        } else {
            this.setState({
                existingMajorId: majorId,
                majorDisplayName: majorName
            })
        }
    }

    /**
     * lifts company selection from company modal to main Sign Up form's context
     * @param {String} companyName, can be existing or new company 
     * @param {*} companyId, has value when company is picked from an existing option 
     */
    getCompanyInput(companyName, companyId) {
        if (!companyId) {
            this.setState({
                newCompany: companyName
            })
        } else {
            this.setState({
                existingCompanyId: companyId,
                existingCompanyName: companyName
            })
        }
    }

    /**
     * lifts job title selection from job title modal to main Sign Up form's context
     * @param {String} jobTitleName, can be existing or new jobTitle 
     * @param {*} jobTitleId, has value when jobTitle is picked from an existing option 
     */
    getJobTitleInput(jobTitleName, jobTitleId) {
        if (!jobTitleId) {
            this.setState({
                newJobTitle: jobTitleName
            })
        } else {
            this.setState({
                existingJobTitleId: jobTitleId,
                existingJobTitleName: jobTitleName
            })
        }
    }

    getInterestsInput(existingInterests, newInterests) {
        this.setState({
            existingInterests,
            newInterests
        })
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

    handleMajorSelectionModal() {
        this.setState({majorModalOpen: !this.state.majorModalOpen})
    }

    handleInterestsModal() {
        this.setState({interestsModalOpen: !this.state.interestsModalOpen})
    }

    handleCompanySelectionModal() {
        this.setState({companyModalOpen: !this.state.companyModalOpen})
    }

    handleJobTitleSelectionModal() {
        this.setState({jobTitleModalOpen: !this.state.jobTitleModalOpen})
    }

    removeInterest(e, interestMarker) {
        e.preventDefault()
        this.setState({
            existingInterests: this.state.existingInterests.filter(interest => interest.value !== interestMarker),
            newInterests: this.state.newInterests.filter(interest => interest.value !== interestMarker)
        })
    }

    getInterestsForDisplay() {
        let allInterests = [...this.state.existingInterests, ...this.state.newInterests]
        return (
            <>
            {
                allInterests.map(interest => {
                    return (
                        <Label
                            key={interest.value}
                            style={{
                                'margin': '3px'
                            }}
                            color='blue'
                        >
                            {interest.text}
                            {
                                <Icon
                                    onClick={(e) => this.removeInterest(e, interest.value)}
                                    name='delete'
                                />
                            }
                        </Label>
                    )
                })
            }
            <Button
                primary
                color="blue"
                type="button"
                onClick={() => {this.setState({interestsModalOpen: true})}}
            >
                {allInterests.length ? `Add more Interests` : `Add Interests`}
                <Icon
                    name="add"
                    style={{
                        'margin': '3px'
                    }}
                />
            </Button>
            </>
        )
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

    /**
     * Generates dismissible display label for major selected
     */
    getMajorDisplay() {
        return (
            <Label
                style={{'margin': '2px'}}
            >
                {this.state.majorDisplayName}
                <Icon
                    onClick={() => this.setState({
                        majorDisplayName: '',
                        newMajor: '',
                        existingMajorId: ''
                    })}
                    name='delete'
                />
            </Label>
        )
    }

    /**
     * Generates dismissible display label for company selected
     */
    getCompanyDisplay() {
        return (
            <Label
                style={{'margin': '2px'}}
            >
                {this.state.existingCompanyName || this.state.newCompany}
                <Icon
                    onClick={() => this.setState({
                        existingCompanyName: '',
                        newCompany: '',
                        existingCompanyId: ''
                    })}
                    name='delete'
                />
            </Label>
        )
    }

    /**
     * Generates dismissible display label for job title selected
     */
    getJobTitleDisplay() {
        return (
            <Label
                style={{'margin': '2px'}}
            >
                {this.state.existingJobTitleName || this.state.newJobTitle}
                <Icon
                    onClick={() => this.setState({
                        existingJobTitleName: '',
                        newJobTitle: '',
                        existingJobTitleId: ''
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
            return baseCondition && this.state.graduationYear && (this.state.newCollege || this.state.existingCollegeId) && (this.state.newMajor || this.state.existingMajorId);
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
                <Form.Field
                    required={true}
                >
                    <label>College</label>
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
                <Form.Field
                    required={true}
                >
                    <label>Major</label>
                    {
                        (this.state.majorDisplayName) ?
                        this.getMajorDisplay() :
                        <>
                            <Button
                                primary
                                color="blue"
                                type="button"
                                onClick={() => {this.setState({majorModalOpen: true})}}
                            >
                                Add Major
                            </Button>
                            <MajorSelectionModal
                                getInput={this.getMajorInput}
                                modalOpen={this.state.majorModalOpen}
                                closeModal={this.handleMajorSelectionModal}
                            />
                        </>
                    }
                </Form.Field>
                <Form.Field
                    required={true}
                >
                    <label>Location</label>
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
                <Form.Field
                >
                    <label>Company/Organization</label>
                    {
                        (this.state.existingCompanyName || this.state.newCompany) ?
                        this.getCompanyDisplay() :
                        <>
                            <Button
                                primary
                                color="blue"
                                type="button"
                                onClick={() => {this.setState({companyModalOpen: true})}}
                            >
                                Add Company/Organization
                            </Button>
                            <CompanySelectionModal
                                getInput={this.getCompanyInput}
                                modalOpen={this.state.companyModalOpen}
                                closeModal={this.handleCompanySelectionModal}
                            />
                        </>
                    }
                </Form.Field>
                <Form.Field
                >
                    <label>Job Title</label>
                    {
                        (this.state.existingJobTitleName || this.state.newJobTitle) ?
                        this.getJobTitleDisplay() :
                        <>
                            <Button
                                primary
                                color="blue"
                                type="button"
                                onClick={() => {this.setState({jobTitleModalOpen: true})}}
                            >
                                Add Job Title
                            </Button>
                            <JobTitleSelectionModal
                                getInput={this.getJobTitleInput}
                                modalOpen={this.state.jobTitleModalOpen}
                                closeModal={this.handleJobTitleSelectionModal}
                            />
                        </>
                    }
                </Form.Field>
                <Form.Field
                >
                    <label>Interests</label>
                    <>
                        {this.getInterestsForDisplay()}
                        <AddInterestsModal
                            getInput={this.getInterestsInput}
                            modalOpen={this.state.interestsModalOpen}
                            closeModal={this.handleInterestsModal}
                        />
                    </>
                </Form.Field>
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
                    newInterests: this.state.newInterests,
                    // major
                    existingMajorId: this.state.existingMajorId,
                    newMajor: this.state.newMajor,
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
                    <Form onSubmit={this.handleSubmit} widths={'equal'}>
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
                        <Form.Dropdown
                            label={'High School'}
                            required={true}
                            style={fieldStyle}
                            basic
                            placeholder={'Select your high school network'}
                            search
                            selection
                            options={this.state.schoolOptions}
                            value={this.state.value}
                            onChange={this.handleSchoolSelection}
                        >
                        </Form.Dropdown>
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