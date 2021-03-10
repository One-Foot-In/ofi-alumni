import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { connect } from 'react-redux';
import { Container, Segment, Message , Button, Grid } from 'semantic-ui-react';
import { Route, BrowserRouter as Router, Switch, Redirect, Link } from 'react-router-dom'
import Header from './components/Header';
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
import ProfileList from './components/admin_dashboard/ProfileList';
import CollegesList from './components/admin_dashboard/CollegesList';
import SchoolsList from './components/admin_dashboard/SchoolsList';
import NewsFeed from './components/NewsFeed'
import Signup from './components/Signup';
import AlumniWorkspace from './components/AlumniWorkspace';
import StudentWorkspace from './components/StudentWorkspace';
import * as actions from './redux/actions'
import Polls from './components/admin_dashboard/Polls';
import Footer from './components/Footer'
import LandingPage from './landingPageContent/LandingPage';
import ReferralLinkGenerator from './ReferralLinkGenerator';
import { SemanticToastContainer } from 'react-semantic-toasts'

export const ALUMNI = "ALUMNI"
export const STUDENT = "STUDENT"
export const ADMIN = "ADMIN"
export const COLLEGE_REP = "COLLEGE_REP"
export const COUNTRY_AMBASSADOR = "COUNTRY_AMBASSADOR"

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

var alumniNavBarItems = (approved, newRequestCount, unseenMessagesCount) => {
  let navBarItems = [
    {
        id: 'home',
        name: 'Home',
        navLink: '/',
        icon: 'home'
    },
    {
        id: 'profile',
        name: 'Profile',
        navLink: '/profile',
        icon: 'user'
    },
    {
        id: 'alumniDirectory',
        name: 'Alumni Directory',
        navLink: '/alumniDirectory',
        icon: 'address book'
    },
    {
        id: 'mentorship',
        name: 'Mentorship',
        navLink: '/mentorship',
        icon: 'handshake',
        notificationBubbleCounter: newRequestCount
    },
    {
        id: 'networking',
        name: 'Networking',
        navLink: '/networking',
        icon: 'comments',
        notificationBubbleCounter: unseenMessagesCount
    },
    {
        id: 'workspaces',
        name: 'Workspaces',
        navLink: '/workspaces',
        icon: 'briefcase'
    }
  ]
  if (approved) {
    navBarItems.push({
        id: 'verification',
        name: 'Verify Alumni',
        navLink: '/verify',
        icon: 'users'
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
    },
    {
      id: 'polls',
      name: 'Polls',
      navLink: '/polls'
  }
  ]
  return navBarItems;
}

var countryAmbassadorNavBarItems = () => {
  let navBarItems = [
    {
      id: 'schools',
      name: 'Schools',
      navLink: '/',
      icon: 'university'
    },
    {
        id: 'students',
        name: 'Students',
        navLink: '/students',
        icon: 'users'
    },
    {
        id: 'alumni',
        name: 'Alumni',
        navLink: '/alumni',
        icon: 'users'
    },
    {
      id: 'polls',
      name: 'Polls',
      navLink: '/polls',
      icon: 'chart bar'
  }
  ]
  return navBarItems;
}

const studentNavBarItems = (isModerator, approvedRequestsCount) => {
  let navBarItems = [
    {
        id: 'home',
        name: 'Home',
        navLink: '/',
        icon: 'home'
    },
    {
        id: 'profile',
        name: 'Profile',
        navLink: '/profile',
        icon: 'user'
    },
    {
        id: 'alumniDirectory',
        name: 'Alumni Directory',
        navLink: '/alumniDirectory',
        icon: 'address book'
    },
    {
        id: 'mentorship',
        name: 'Mentorship',
        navLink: '/mentorship',
        icon: 'handshake',
        notificationBubbleCounter: approvedRequestsCount
    },
    {
      id: 'workspaces',
      name: 'Workspaces',
      navLink: '/workspaces',
      icon: 'briefcase'
    }
  ]
  if (isModerator) {
    navBarItems.push({
        id: 'verification',
        name: 'Verify Students',
        navLink: '/verify',
        icon: 'users'
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
      userDetails: {},
      newRequestsCount: 0,
      unseenMessagesCount: 0,
      approvedRequestsCount: 0,
    };
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.completeLogin = this.completeLogin.bind(this);
    this.renderScreens = this.renderScreens.bind(this);
    this.renderLoggedInRoutes = this.renderLoggedInRoutes.bind(this);
    this.refreshProfile = this.refreshProfile.bind(this);
    this.liftRole = this.liftRole.bind(this);
    this.refreshMenuPopupCounters = this.refreshMenuPopupCounters.bind(this);
    this.getPrimaryRole = this.getPrimaryRole.bind(this)
  }

  /**
   * Gets roles available in order of priority
   * Find Alumni first, then student, and if neither are present,
   * return first value in array
   * @param roles, all roles available to user
   */
  getPrimaryRole(roles) {
    if (roles.includes(ALUMNI)) {
      return ALUMNI
    }
    if (roles.includes(STUDENT)) {
      return STUDENT
    }
    return roles[0]
  }

  async UNSAFE_componentWillMount() {
    var roles;
    var profile;
    var id;
    this.setState({
      fetchingAuth: true
    }) 
    try {
      const result = await makeCall({}, '/isLoggedIn', 'get')
      if (result && !result.error) {
        var jwtVal = document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        const parsedJWT = JSON.parse(atob(jwtVal.split('.')[1]));
        roles = parsedJWT.role;
        id = parsedJWT.id;
        let result = await this.fetchProfile(this.getPrimaryRole(roles), id);
        profile = result.result
        this.setState({
          accessContexts: result.accessContexts,
          role: this.getPrimaryRole(roles),
          userDetails: profile,
          approved: profile.approved,
          loggedIn: true,
          fetchingAuth: false
        }, async () => {
          await this.refreshMenuPopupCounters(roles, profile._id)
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
    let result = await this.fetchProfile(role, id)
    this.setState({
      userDetails: result.result,
      accessContexts: result.accessContexts
    })
  }

  async refreshMenuPopupCounters(roles, id) {
    if (roles && roles.length && id) {
      if (roles.includes(ALUMNI)) {
        let newRequestsCountResponse = await makeCall({}, `/alumni/newRequestsCount/${id}`, 'get')
        let unseenMessagesCountResponse = await makeCall({}, `/alumni/unseenMessagesCount/${id}`, 'get')
        this.setState({
          newRequestsCount: newRequestsCountResponse.newRequestsCount,
          unseenMessagesCount: unseenMessagesCountResponse.unseenMessagesCount
        })
      } else {
        let approvedRequestsCountResponse = await makeCall({}, `/student/approvedRequestsCount/${id}`, 'get')
        this.setState({
          approvedRequestsCount: approvedRequestsCountResponse.approvedRequestsCount
        })
      }
    }
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
      case COUNTRY_AMBASSADOR:
        result = await makeCall({}, ('/alumni/one/'+id), 'get')
        break;
      case ADMIN:
        result = await makeCall({}, ('/admin/one/'+id), 'get')
        break;
      case COLLEGE_REP:
        result = await makeCall({}, ('/collegeRep/one/'+id), 'get')
        break;
    }
    return result
  }

  login() {
    this.setState({
      loggedIn: true
    });
  }

  async logout() {
    await makeCall({}, '/logout', 'get');
    this.setState({
      loggedIn: false,
      userDetails: {},
      role: null
    });
  }


  completeLogin() {
    // TECH DEBT: Without window reload, there is an infinite loop of redirects to '/'
    window.location.reload();
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
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'home'}
                      />
                      <ReferralLinkGenerator
                        schoolId={this.state.userDetails.school._id}
                        schoolName={this.state.userDetails.school.name}
                        userId={this.state.userDetails.user}
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
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'profile'}
                      />
                      <AlumniProfile
                        isViewOnly={false}
                        details={this.state.userDetails}
                        refreshProfile={this.refreshProfile}
                        logout={this.logout}
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
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'alumniDirectory'}
                      />
                      <AlumniDirectory
                        schoolId={this.state.userDetails.school._id}
                        userDetails={this.state.userDetails}
                        accessContexts={this.state.accessContexts}
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
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'mentorship'}
                      />
                      <AlumniMentorship 
                          userDetails={this.state.userDetails}
                          refreshProfile={this.refreshProfile}
                          refreshMenuPopupCounters={this.refreshMenuPopupCounters}
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
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'networking'}
                      />
                      <AlumniNetworking 
                          userDetails={this.state.userDetails}
                          refreshMenuPopupCounters={this.refreshMenuPopupCounters}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path = {`/workspaces`} render={(props) =>
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'workspaces'}
                      />
                      <AlumniWorkspace 
                          userDetails={this.state.userDetails}
                          history={props.history}
                          activeItem={'opportunities'}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path = {`/workspaces/library`} render={(props) =>
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'workspaces'}
                      />
                      <AlumniWorkspace 
                          userDetails={this.state.userDetails}
                          activeItem={'library'}
                          history={props.history}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path = {`/workspaces/opportunities`} render={(props) =>
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'workspaces'}
                      />
                      <AlumniWorkspace 
                          userDetails={this.state.userDetails}
                          activeItem={'opportunities'}
                          history={props.history}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path = {`/workspaces/collegesAccepted`} render={(props) =>
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'workspaces'}
                      />
                      <AlumniWorkspace 
                          userDetails={this.state.userDetails}
                          activeItem={'collegesAccepted'}
                          history={props.history}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path = {`/workspaces/library/:articleId`} render={(props) =>
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'workspaces'}
                      />
                      <AlumniWorkspace 
                          userDetails={this.state.userDetails}
                          history={props.history}
                          articleId={props.match.params.articleId}
                          activeItem={'library'}
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
                          navItems={alumniNavBarItems(this.state.approved, this.state.newRequestsCount, this.state.unseenMessagesCount)}
                          activeItem={'verify'}
                      />
                        <AlumniVerification
                          gradYear={this.state.userDetails.gradYear}
                          schoolId={this.state.userDetails.school._id}
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
                          navItems={studentNavBarItems(this.state.userDetails.isModerator, this.state.approvedRequestsCount)}
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
                          navItems={studentNavBarItems(this.state.userDetails.isModerator, this.state.approvedRequestsCount)}
                          activeItem={'profile'}
                      />
                      <StudentProfile
                        isViewOnly={false}
                        details={this.state.userDetails}
                        logout={this.logout}
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
                          navItems={studentNavBarItems(this.state.userDetails.isModerator, this.state.approvedRequestsCount)}
                          activeItem={'alumniDirectory'}
                      />
                      <AlumniDirectory
                        schoolId={this.state.userDetails.school._id}
                        userDetails={this.state.userDetails}
                        accessContexts={this.state.accessContexts}
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
                          navItems={studentNavBarItems(this.state.userDetails.isModerator, this.state.approvedRequestsCount)}
                          activeItem={'mentorship'}
                      />
                      <StudentMentorship 
                          userDetails={this.state.userDetails}
                          refreshMenuPopupCounters={this.refreshMenuPopupCounters}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/workspaces`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator, this.state.approvedRequestsCount)}
                          activeItem={'workspaces'}
                      />
                      <StudentWorkspace 
                          userDetails={this.state.userDetails}
                          activeItem={'opportunities'}
                          history={props.history}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path = {`/workspaces/opportunities`} render={(props) =>
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator, this.state.approvedRequestsCount)}
                          activeItem={'workspaces'}
                      />
                      <StudentWorkspace 
                          userDetails={this.state.userDetails}
                          activeItem={'opportunities'}
                          history={props.history}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path = {`/workspaces/library`} render={(props) =>
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator, this.state.approvedRequestsCount)}
                          activeItem={'workspaces'}
                      />
                      <StudentWorkspace 
                          userDetails={this.state.userDetails}
                          activeItem={'library'}
                          history={props.history}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path = {`/workspaces/library/:articleId`} render={(props) =>
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator, this.state.approvedRequestsCount)}
                          activeItem={'workspaces'}
                      />
                      <StudentWorkspace 
                          userDetails={this.state.userDetails}
                          history={props.history}
                          articleId={props.match.params.articleId}
                          activeItem={'library'}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/verify`} render={(props) => 
                  this.state.loggedIn ?
                    (this.state.userDetails.isModerator ?
                      <>
                        <Navbar
                          navItems={studentNavBarItems(this.state.userDetails.isModerator, this.state.approvedRequestsCount)}
                          activeItem={'verification'}
                        />
                        <StudentVerification
                          grade={this.state.userDetails.grade}
                          schoolId={this.state.userDetails.school._id}
                          studentId={this.state.userDetails._id}
                        />
                      </>
                      : <Redirect to={"/"}/>)
                  : <Redirect to={"/login"}/>
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
                          currentRole={ADMIN}
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
                          currentRole={ADMIN}
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
                          currentRole={this.state.role}
                          userId={this.state.userDetails._id}
                          country={null}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/polls`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={adminNavBarItems()}
                          activeItem={'polls'}
                      />
                      <Polls
                        currentRole={ADMIN}
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
      case COUNTRY_AMBASSADOR:
        return (
          <>
          <Route exact path={`/`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={countryAmbassadorNavBarItems()}
                          activeItem={'schools'}
                      />
                      <SchoolsList
                          currentRole={this.state.role}
                          userId={this.state.userDetails._id}
                          country={this.state.userDetails.school.country}
                      />
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
                          navItems={countryAmbassadorNavBarItems()}
                          activeItem={'students'}
                      />
                      <ProfileList
                          viewing={'STUDENT'}
                          currentRole={COUNTRY_AMBASSADOR}
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
                          navItems={countryAmbassadorNavBarItems()}
                          activeItem={'alumni'}
                      />
                      <ProfileList
                          viewing={'ALUMNI'}
                          currentRole={COUNTRY_AMBASSADOR}
                          userDetails={this.state.userDetails}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/polls`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={countryAmbassadorNavBarItems()}
                          activeItem={'polls'}
                      />
                      <Polls
                        currentRole={COUNTRY_AMBASSADOR}
                        userDetails={this.state.userDetails}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
        </>
        )
      default:
        return (
          <Redirect to={"/login"}/>
        )
    }
  }

  renderScreens(role) {
    return (
        <Switch>
          <Route exact path={'/register'} render={
              (props) =>
              <>
                  {
                    this.state.loggedIn ? <Redirect to={"/"}/> :
                    registerButtonGroup(props)
                  }
              </>
          }/>
          <Route exact path={`/register/alumni`} render={
              (props) =>
                  this.state.loggedIn ? <Redirect to={"/"}/> : 
                  <Signup
                      isAlumni={true}
                      match={props.match}
                      history={props.history}
                  />
              }
          />
          <Route exact path={`/register/alumni/:referrerId/:schoolId`} render={
              (props) =>
                  this.state.loggedIn ? <Redirect to={"/"}/> : 
                  <Signup
                      isAlumni={true}
                      match={props.match}
                      history={props.history}
                  />
              }
          />
          <Route exact path={`/register/student`} render={
              (props) => 
                this.state.loggedIn ? <Redirect to={"/"}/> :
                <Signup
                  isAlumni={false}
                  match={props.match}
                  history={props.history}
                />
              }
          />
          <Route exact path={`/register/student/:referrerId/:schoolId`} render={
              (props) => 
              this.state.loggedIn ? <Redirect to={"/"}/> :
                <Signup
                    isAlumni={false}
                    match={props.match}
                    history={props.history}
                />
              }
          />
          <Route exact path={"/login"} render={(props) =>
              this.state.loggedIn ? <Redirect to={"/"}/> : <LandingPage/>
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
                school={this.state.userDetails && this.state.userDetails.school}
                name={this.state.userDetails && this.state.userDetails.name}
                userId={this.state.userDetails && this.state.userDetails.user}
                role={this.state.role}
                liftRole={this.liftRole}
                completeLogin={this.completeLogin}
                login={this.login}
                currentRole={this.state.role}
              />
              <Container>
                <SemanticToastContainer position="top-right"/>
                {this.renderScreens(this.state.role)}
              </Container>
              <Footer/>
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
