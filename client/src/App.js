import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { connect } from 'react-redux';
import { Container, Segment, Message } from 'semantic-ui-react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import Register from './screens/Register';
import { makeCall } from "./apis";
import Navbar from './components/Navbar'

export const SCHOOL_NAME = process.env.REACT_APP_SCHOOL_NAME || 'Template'

export const ALUMNI = "ALUMNI"

const App_LS = `OFI_Alumni_App`

export const PATHS = {
  root: "/",
  login: "/login",
  register: "/register",
}

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

const alumniNavBarItems = [
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

class App extends Component {
  constructor() {
    super();
    this.state = {
      loggedIn: true, // TODO: change to false for full-stack work
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
            loggedIn: true, // TODO: change to false for full-stack work
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
                          navItems={alumniNavBarItems}
                          activeItem={'home'}
                      />
                      <div> Home! </div>
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/profile`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          navItems={alumniNavBarItems}
                          activeItem={'profile'}
                      />
                      <div> Profile! </div>
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/alumniDirectory`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          navItems={alumniNavBarItems}
                          activeItem={'alumniDirectory'}
                      />
                      <div> Alumni Directory! </div>
                  </> :
                  <Redirect to={"/login"}/>
              }
          />
          <Route exact path={`/requests`} render={(props) => 
                  this.state.loggedIn ?
                  <>
                      <Navbar
                          navItems={alumniNavBarItems}
                          activeItem={'requests'}
                      />
                      <div> Requests! </div>
                  </> :
                  <Redirect to={"/login"}/>
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

export default connect()(App);
