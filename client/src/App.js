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
import Profile from './components/Profile'

import * as actions from './redux/actions'
// TODO: Remove once TimePreferencesModal can be embedded into Profile
import TimePreferencesModal from './components/TimePreferencesModal';

export const SCHOOL_NAME = process.env.REACT_APP_SCHOOL_NAME || 'Template'
const isDevMode = () => {
  return !!process.env.REACT_APP_DEV_MODE
} 
export const ALUMNI = "ALUMNI"
const App_LS = `OFI_Alumni_App`

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
function withLoginCheck(RouterComponent, isLoggedIn, navItems, routePath, activeItem) {
  return class extends React.Component {
    constructor(props) {
      super(props)
    }
    render() {
      return (
        <Route exact path={routePath} render={(props) => 
            isLoggedIn ? 
            <>
                <Navbar
                    navItems={navItems}
                    activeItem={activeItem}
                />
                <RouterComponent {...this.props} />
            </> :
            <Redirect to={'/login'} />
          }
        />
      )
    }
  }
}

const alumniNavBarItems = () => {
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
    }
  ]
  if (isDevMode()) {
    navBarItems.push({
      id: 'playground',
      name: 'Playground (DEV MODE only)',
      navLink: '/playground'
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
      role: null,
      userDetails: {},
    };
    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.liftPayload = this.liftPayload.bind(this);
    this.renderScreens = this.renderScreens.bind(this);
    this.renderLoggedInRoutes = this.renderLoggedInRoutes.bind(this);
  }

  componentDidMount() {
    this.setState({
      fetchingAuth: true
    }, async () => {
      try {
        const result = await makeCall({}, '/isLoggedIn', 'get')
        this.setState({
          fetchingAuth: false
        });
        if (result && !result.error) {
          this.setState({
            loggedIn: true
          });
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
    })
    const persistedState = JSON.parse(localStorage.getItem(App_LS));
    if (persistedState) {
      try {
        const role = persistedState.role;
        const userDetails = persistedState.userDetails;
        this.setState({role, userDetails});
      } catch (e) {
        console.log(`Could not get fetch state from local storage for ${App_LS}`, e);
      }
    }
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
      }, () => {
        localStorage.setItem(App_LS, JSON.stringify(this.state))
      });
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
                          navItems={alumniNavBarItems()}
                          activeItem={'home'}
                      />
                      <div> Home! Welcome {this.props.details && this.props.details.name} ({this.props.role})</div>
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/profile`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          navItems={alumniNavBarItems()}
                          activeItem={'profile'}
                      />
                      <Profile
                        isViewOnly={false}
                        imageURL={this.props.details && this.props.details.imageURL}
                        name={this.props.details && this.props.details.name}
                        college={this.props.details && this.props.details.college}
                        location={this.props.details && this.props.details.location}
                        company={this.props.details && this.props.details.company}
                        jobTitle={this.props.details && this.props.details.jobTitle}
                      />
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/alumniDirectory`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          navItems={alumniNavBarItems()}
                          activeItem={'alumniDirectory'}
                      />

                      <AlumniDirectory isAlumniView={true}/>
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/requests`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          navItems={(alumniNavBarItems())}
                          activeItem={'requests'}
                      />
                      <div> Requests! </div>
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/playground`} render={(props) => 
              <>
                <Navbar
                    navItems={alumniNavBarItems()}
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
                <TimePreferencesModal
                  modalOpen={true}
                />
              </>
            }
          />
          </>
        )
      default:
        return null
    }
  }

  renderScreens() {
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
          {this.renderLoggedInRoutes(ALUMNI)}
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
            />
            <Container>
              {this.renderScreens()}
            </Container>
            </>
          }
        </Router>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
