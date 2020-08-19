import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { connect } from 'react-redux';
import { Container, Segment, Message , Button, Grid} from 'semantic-ui-react';
import { Route, BrowserRouter as Router, Switch, Redirect, Link } from 'react-router-dom'
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import AlumniDirectory from './components/AlumniDirectory'
import { makeCall } from "./apis";
import Navbar from './components/Navbar'
import AlumniProfile from './components/AlumniProfile'
import StudentProfile from './components/StudentProfile'
import AlumniVerification from './components/AlumniVerification'
import StudentVerification from './components/StudentVerification'
import AlumniMentorship from './components/AlumniMentorship';
import StudentMentorship from './components/StudentMentorship'
import AlumniNetworking from './components/AlumniNetworking'
import CollegeShortlist from './components/CollegeShortlist';
import ProfileList from './components/admin_dashboard/ProfileList';
import CollegesList from './components/admin_dashboard/CollegesList';
import SchoolsList from './components/admin_dashboard/SchoolsList';
import NewsFeed from './components/NewsFeed'
import Signup from './components/Signup';

import * as actions from './redux/actions'

export const ALUMNI = "ALUMNI"
export const STUDENT = "STUDENT"
export const ADMIN = "ADMIN"
export const COLLEGE_REP = "COLLEGE_REP"

/*
  STORE SETUP
*/

const mapStateToProps = state => {
  return ({
    schoolName: state.schoolName,
    count: state.countState.count,
    role: state.userDetailsState && state.userDetailsState.role,
    details: state.userDetailsState && state.userDetailsState.details
  })
}

const mapDispatchToProps = dispatch => ({
  testAction: () => dispatch(actions.testAction()),
  increment: num => dispatch(actions.increment(num))
})

let registerButtonGroup = (props) =>
    <Grid centered >
        <Grid.Row>
            <Message
                content="Are you a student or an alumni?"
            />
        </Grid.Row>
        <Grid.Row>
            <Button.Group size='massive'>
                <Link to={`register/student`}>
                    <Button 
                        color='yellow'
                    >
                      Student
                    </Button>
                </Link>
                <Button.Or />
                <Link to={`register/alumni`}>
                    <Button
                        color='orange'
                    >
                      Alumni
                    </Button>
                </Link>
            </Button.Group>
        </Grid.Row>
        <Grid.Row>
            <Button centered style={{
                'position': 'relative',
                'bottom': '0',
                'margin': '200px 0 100px 0'
            }} 
            onClick={
                (e) => {
                    e.preventDefault(); props.history.goBack()
                    }
                }
            >
                Back
            </Button>
        </Grid.Row>
    </Grid>

/*
  STORE SETUP
*/

var alumniNavBarItems = (approved) => {
  let navBarItems = [
    {
        id: 'home',
        name: 'Home',
        navLink: '/'
    },
    {
        id: 'profile',
        name: 'Profile',
        navLink: '/profile'
    },
    {
        id: 'alumniDirectory',
        name: 'Alumni Directory',
        navLink: '/alumniDirectory'
    },
    {
        id: 'mentorship',
        name: 'Mentorship',
        navLink: '/mentorship'
    },
    {
        id: 'networking',
        name: 'Networking',
        navLink: '/networking'
    }
  ]
  if (approved) {
    navBarItems.push({
        id: 'verification',
        name: 'Verify Alumni',
        navLink: '/verify'
    })
  }
  return navBarItems;
}

var adminNavBarItems = () => {
  let navBarItems = [
    {
        id: 'data',
        name: 'Data Management',
        navLink: '/'
    },
    {
        id: 'students',
        name: 'Students',
        navLink: '/students'
    },
    {
        id: 'alumni',
        name: 'Alumni',
        navLink: '/alumni'
    },
    {
        id: 'colleges',
        name: 'Colleges',
        navLink: '/colleges'
    },
    {
        id: 'schools',
        name: 'Schools',
        navLink: '/schools'
    }
  ]
  return navBarItems;
}

const studentNavBarItems = (isModerator) => {
  let navBarItems = [
    {
        id: 'home',
        name: 'Home',
        navLink: '/'
    },
    {
        id: 'profile',
        name: 'Profile',
        navLink: '/profile'
    },
    {
        id: 'alumniDirectory',
        name: 'Alumni Directory',
        navLink: '/alumniDirectory'
    },
    {
        id: 'mentorship',
        name: 'Mentorship',
        navLink: '/mentorship'
    },
    {
      id: 'workspace',
      name: 'Workspace',
      navLink: '/workspace'
    }
  ]
  if (isModerator) {
    navBarItems.push({
        id: 'verification',
        name: 'Verify Students',
        navLink: '/verify'
    })
  }
  return navBarItems;
}

const collegeRepNavBarItems = () => {
  let navBarItems = [
    {
      id: 'announcements',
      name: 'Announcements',
      navLink: '/'
    },
    {
      id: 'profile',
      name: 'Profile',
      navLink: '/profile'
    },
    {
      id: 'shortlists',
      name: 'Shortlists',
      navLink: '/shortlists'
    }
  ]
  return navBarItems;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      fetchingAuth: true,
      approved: false,
      role: null,
      roleChanged: false,
      schoolId: '',
      userDetails: {}
    };
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.liftPayload = this.liftPayload.bind(this);
    this.renderScreens = this.renderScreens.bind(this);
    this.renderLoggedInRoutes = this.renderLoggedInRoutes.bind(this);
    this.refreshProfile = this.refreshProfile.bind(this);
    this.liftRole = this.liftRole.bind(this);
  }

  async componentWillMount() {
    var role;
    var profile;
    var id;
    this.setState({
      fetchingAuth: true
    }) 
    try {
      const result = await makeCall({}, '/isLoggedIn', 'get')
      this.setState({
        fetchingAuth: false
      });
      if (result && !result.error) {
        var jwtVal = document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        const parsedJWT = JSON.parse(atob(jwtVal.split('.')[1]));
        role = parsedJWT.role;
        id = parsedJWT.id;
        profile = await this.fetchProfile(role[0], id);
        this.setState({
          role: role[0],
          userDetails: profile,
          approved: profile.approved,
          loggedIn: true
        })
      } else {
        this.setState({
          loggedIn: false,
          fetchingAuth: false,
        });
      }
    } catch (e) {
        this.setState({
          loggedIn: false,
          fetchingAuth: false,
        });
        console.log("Error: App#componentDidMount", e)
    }
  }

  async refreshProfile(role, id) {
    let userDetails = await this.fetchProfile(role, id)
    console.log("refreshed profile")
    console.log(userDetails)
    this.setState({
      userDetails: userDetails
    })
  }

  async fetchProfile(role, id) {
    let result;
    switch (role) {
      case STUDENT:
        result = await makeCall({}, ('/student/one/'+id), 'get');
        break;
      case ALUMNI:
        result = await makeCall({}, ('/alumni/one/'+id), 'get')
        break;
      case ADMIN:
        result = await makeCall({}, ('/admin/one/'+id), 'get')
        break;
      case COLLEGE_REP:
        result = await makeCall({}, ('/collegeRep/one/'+id), 'get')
        break;
    }
    return result.result
  }

  login() {
    this.setState({
      loggedIn: true
    });
  }

  async logout() {
    await makeCall({}, '/logout', 'get');
    this.setState({
      loggedIn: false
    });
  }

  liftPayload(details) {
      this.setState({
        role : details.userRole,
        userDetails: details.userToSend
      });
      window.location.reload()
  }

  liftRole(role) {
    this.setState({
      role: role,
      roleChanged: true
    }, () => {
      this.setState({
        roleChanged: false
      })
    })
  }

  renderLoggedInRoutes(role) {
    switch (role) {
      case ALUMNI:
        return (
          <>
          <Route exact path={`/`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved)}
                          activeItem={'home'}
                      />
                      <NewsFeed
                        userDetails={this.state.userDetails}
                        userRole={role}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/profile`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved)}
                          activeItem={'profile'}
                      />
                      <AlumniProfile
                        isViewOnly={false}
                        details={this.state.userDetails}
                        refreshProfile={this.refreshProfile}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/alumniDirectory`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved)}
                          activeItem={'alumniDirectory'}
                      />
                      <AlumniDirectory
                        schoolId={this.state.userDetails.school}
                        userDetails={this.state.userDetails}
                        role={role}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/mentorship`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved)}
                          activeItem={'mentorship'}
                      />
                      <AlumniMentorship 
                          userDetails={this.state.userDetails}
                          refreshProfile={this.refreshProfile}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/networking`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved)}
                          activeItem={'networking'}
                      />
                      <AlumniNetworking 
                          userDetails={this.state.userDetails}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          { this.state.userDetails.approved &&
          <Route exact path={`/verify`} render={(props) => 
                  this.state.loggedIn ?
                    (this.state.approved ?
                      <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved)}
                          activeItem={'verify'}
                      />
                        <AlumniVerification
                          gradYear={this.state.userDetails.gradYear}
                          schoolId={this.state.userDetails.school}
                        />
                      </> 
                    :<Redirect to={'/'}/> )
                  :<Redirect to={"/login"}/>
              }
          />
          }
          </>
        )
      case STUDENT:
        return (
          <>
          <Route exact path={`/`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator)}
                          activeItem={'home'}
                      />
                      <NewsFeed
                        userDetails={this.state.userDetails}
                        userRole={role}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/profile`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator)}
                          activeItem={'profile'}
                      />
                      <StudentProfile
                        isViewOnly={false}
                        details={this.state.userDetails}
                        refreshProfile={this.refreshProfile}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/alumniDirectory`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator)}
                          activeItem={'alumniDirectory'}
                      />
                      <AlumniDirectory
                        schoolId={this.state.userDetails.school}
                        userDetails={this.state.userDetails}
                        role={role}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/mentorship`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator)}
                          activeItem={'mentorship'}
                      />
                      <StudentMentorship 
                          userDetails={this.state.userDetails}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/workspace`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator)}
                          activeItem={'workspace'}
                      />
                      <CollegeShortlist
                          details={this.state.userDetails}
                          refreshProfile={this.refreshProfile}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/verify`} render={(props) => 
                  this.state.loggedIn ?
                    this.state.userDetails.isModerator ?
                      <>
                        <Navbar
                          navItems={studentNavBarItems(this.state.userDetails.isModerator)}
                          activeItem={'verification'}
                        />
                        <StudentVerification
                          grade={this.state.userDetails.grade}
                          schoolId={this.state.userDetails.school}
                          studentId={this.state.userDetails._id}
                        />
                      </>
                      : <Redirect to={"/"}/>
                  :<Redirect to={"/login"}/>
              }
          />
          </>
        )
      case ADMIN:
        return (
          <>
          <Route exact path={`/`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={adminNavBarItems()}
                          activeItem={'data'}
                      />
                      <p>Data Management</p>
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/students`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={adminNavBarItems()}
                          activeItem={'students'}
                      />
                      <ProfileList
                          viewing={'STUDENT'}
                          userDetails={this.state.userDetails}
                      />
                  </> :
                    <Redirect to={"/login"}/>
                }
          />
          <Route exact path={`/alumni`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={adminNavBarItems()}
                          activeItem={'alumni'}
                      />
                      <ProfileList
                          viewing={'ALUMNI'}
                          userDetails={this.state.userDetails}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/colleges`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={adminNavBarItems()}
                          activeItem={'colleges'}
                      />
                      <CollegesList
                          userDetails={this.state.userDetails}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/schools`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={adminNavBarItems()}
                          activeItem={'schools'}
                      />
                      <SchoolsList
                          userDetails={this.state.userDetails}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
        </>
        )
      case COLLEGE_REP:
        return (
          <>
          <Route exact path={`/`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={collegeRepNavBarItems()}
                          activeItem={'announcements'}
                      />
                      <p>Announcements</p>
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/profile`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={collegeRepNavBarItems()}
                          activeItem={'profile'}
                      />
                      <p>Profile</p>
                  </> :
                    <Redirect to={"/login"}/>
                }
          />
          <Route exact path={`/shortlists`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={collegeRepNavBarItems()}
                          activeItem={'shortlists'}
                      />
                      <p>Shortlists</p>
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
        </>
        )
      default:
        return (
          <Route exact path={`/`} render={(props) => 
            this.state.loggedIn ?
            <>
                <Navbar
                    navItems={studentNavBarItems(this.state.userDetails.isModerator)}
                    activeItem={'home'}
                />
            </> :
            <Redirect to={"/login"}/>
            }
          />
        )
    }
  }

  renderScreens(role) {
    return (
        <Switch>
          <Route exact path={'/register'} render={
              (props) =>
              <>
                  {registerButtonGroup(props)}
              </>
          }/>
          <Route exact path={`/register/alumni`} render={
              (props) => 
                  <Signup
                      isAlumni={true}
                      match={props}
                  />
              }
          />
          <Route exact path={`/register/student`} render={
              (props) => 
                  <Signup
                      isAlumni={false}
                      match={props}
                  />
              }
          />
          <Route exact path={"/login"} render={(props) => 
              <LoginForm
                isLoggedIn={this.state.loggedIn}
                liftPayload={this.liftPayload}
                login={this.login}
              />
            }
          />
          {this.renderLoggedInRoutes(role)}
          <Route>
              <Segment>
                  This page does not exist!
              </Segment>
          </Route>
        </Switch>
    )
  }

  render() {
    return (
        <Router>
          {this.state.fetchingAuth ? 
            <>
              <Message
                style={{
                  width: '100%',
                  height: '100%',
                }}
                header={"Fetching Authorization, please wait..."}
              />
              
              <Segment
                style={{
                  width: '100%',
                  height: '300px',
                }}
                loading={true}
              >
              </Segment>
            </> :
            <>
            <Header
              loggedIn={this.state.loggedIn}
              logout={this.logout}
              email={this.state.userDetails && this.state.userDetails.email}
              schoolLogo={this.state.userDetails && this.state.userDetails.schoolLogo}
              userId={this.state.userDetails && this.state.userDetails.user}
              role={this.state.role}
              liftRole={this.liftRole}
            />
            <Container>
              {this.renderScreens(this.state.role)}
            </Container>
            </>
          }
          {this.state.roleChanged && 
            <Redirect to="/"/>
          }
        </Router>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
