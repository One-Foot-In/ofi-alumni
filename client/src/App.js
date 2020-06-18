import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { connect } from 'react-redux';
import { Container, Segment, Message , Button} from 'semantic-ui-react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import AlumniDirectory from './components/AlumniDirectory'
import Register from './screens/Register';
import { makeCall } from "./apis";
import Navbar from './components/Navbar'
import AlumniProfile from './components/AlumniProfile'
import StudentProfile from './components/StudentProfile'
import AlumniVerification from './components/AlumniVerification'
import StudentVerification from './components/StudentVerification'
import RequestsView from './components/RequestsView'
import SchedulingsView from './components/SchedulingsView'
import NewsFeed from './components/NewsFeed'

import * as actions from './redux/actions'
// TODO: for demo only, remove for release
import SearchablePooledMultiSelectDropdown from './components/SearchablePooledMultiSelectDropdown';
import SearchablePooledSingleSelectDropdown from './components/SearchablePooledSingleSelectDropdown';

export const SCHOOL_NAME = process.env.REACT_APP_SCHOOL_NAME || 'Template'
const isDevMode = () => {
  return !!process.env.REACT_APP_DEV_MODE
} 
export const ALUMNI = "ALUMNI"
export const STUDENT = "STUDENT"

export const PATHS = {
  root: "/",
  login: "/login",
  register: "/register",
}

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

/*
  STORE SETUP
*/

// TODO extract Routes into this higher-order component
// function withLoginCheck(RouterComponent, isLoggedIn, navItems, routePath, activeItem) {
//   return class extends React.Component {
//     constructor(props) {
//       super(props)
//     }
//     render() {
//       return (
//         <Route exact path={routePath} render={(props) => 
//             isLoggedIn ? 
//             <>
//                 <Navbar
//                     navItems={navItems}
//                     activeItem={activeItem}
//                 />
//                 <RouterComponent {...this.props} />
//             </> :
//             <Redirect to={'/login'} />
//           }
//         />
//       )
//     }
//   }
// }

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
        id: 'requests',
        name: 'Requests',
        navLink: '/requests'
    },
    {
        id: 'schedulings',
        name: 'Schedulings',
        navLink: '/schedulings'
    }
  ]
  if (approved) {
    navBarItems.push({
        id: 'verification',
        name: 'Verify Alumni',
        navLink: '/verify'
    })
  }
  if (isDevMode()) {
    navBarItems.push({
      id: 'playground',
      name: 'Playground (DEV MODE only)',
      navLink: '/playground'
    })
  }
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
        id: 'schedulings',
        name: 'Schedulings',
        navLink: '/schedulings'
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      fetchingAuth: true,
      approved: false,
      role: null,
      schoolId: '',
      userDetails: {},
      // TODO: for demo only, remove for release
      pooledDropdownValueLifted: null
    };
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.liftPayload = this.liftPayload.bind(this);
    this.renderScreens = this.renderScreens.bind(this);
    this.renderLoggedInRoutes = this.renderLoggedInRoutes.bind(this);
    this.refreshProfile = this.refreshProfile.bind(this);
    // TODO: for demo only, remove for release
    this.getInputs = this.getInputs.bind(this);
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
        profile = await this.fetchProfile(role, id);
        this.setState({
          role: role,
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
    this.setState({
      userDetails: userDetails
    })
  }

  async fetchProfile(role, id) {
    let result;
    if (role === 'STUDENT') {
      result = await makeCall({}, ('/student/one/'+id), 'get')
    } else {
      result = await makeCall({}, ('/alumni/one/'+id), 'get')
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

  // TODO: for demo only, remove for release
  getInputs(inputs) {
    this.setState({
      pooledDropdownValueLifted: inputs
    }, () => {
      console.log("dropdown value extracted is", this.state.pooledDropdownValueLifted)
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
                      <div> Home! Welcome {this.state.userDetails && this.state.userDetails.name} ({this.state.role})</div>
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
          <Route exact path={`/requests`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved)}
                          activeItem={'requests'}
                      />
                      <RequestsView 
                          userDetails={this.state.userDetails}
                          role={role}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/schedulings`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={alumniNavBarItems(this.state.approved)}
                          activeItem={'schedulings'}
                      />
                      <SchedulingsView 
                          userDetails={this.state.userDetails}
                          role={role}
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
          <Route exact path={`/playground`} render={(props) => 
              <>
                <Navbar
                    userDetails={this.state.userDetails}
                    navItems={alumniNavBarItems(this.state.approved)}
                    activeItem={'playground'}
                />
                <Button
                  primary
                  onClick={(e) => this.props.increment(1)}
                >
                  Click to increase counter
                </Button>
                <Segment>
                  Count in store is {this.props.count ? this.props.count : 0}
                </Segment>
                <SearchablePooledMultiSelectDropdown
                  endpoint={'/drop/jobTitles'}
                  getInputs={this.getInputs}
                  dataType={'Colleges'}
                  allowAdditions={true}
                />
                <SearchablePooledSingleSelectDropdown
                  endpoint={'/drop/jobTitles'}
                  getInput={this.getInputs}
                  dataType={'Colleges'}
                  allowAddition={true}
                />
              </>
            }
          />
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
                      <div> Home! Welcome {this.state.userDetails && this.state.userDetails.name} ({this.state.role})</div>
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
          <Route exact path={`/schedulings`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          userDetails={this.state.userDetails}
                          role={role}
                          timezoneActive={true}
                          navItems={studentNavBarItems(this.state.userDetails.isModerator)}
                          activeItem={'schedulings'}
                      />
                      <SchedulingsView 
                          userDetails={this.state.userDetails}
                          role={role}
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
      default:
        return (
          <Route exact path={`/`} render={(props) => 
            this.state.loggedIn ?
            <>
                <Navbar
                    navItems={studentNavBarItems(this.state.userDetails.isModerator)}
                    activeItem={'home'}
                />
                <div> Home! Welcome!</div>
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
          <Route exact path={PATHS.register} render={(props) => 
              <Register match={props.match}/>
            }
          />
          <Route exact path={PATHS.login} render={(props) => 
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
            />
            <Container>
              {this.renderScreens(this.state.role)}
            </Container>
            </>
          }
        </Router>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
