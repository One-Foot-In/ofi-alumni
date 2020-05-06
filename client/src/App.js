import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Container, Segment, Message } from 'semantic-ui-react';
import { Route, BrowserRouter as Router, Switch, Redirect } from 'react-router-dom'
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import StaffView from './components/StaffView';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';
import Register from './screens/Register';
import { makeCall } from "./apis";

export const SCHOOL_NAME = process.env.REACT_APP_SCHOOL || 'Dhanmondi Tutorial';
const App_LS = `DT_Notify_App`

export const PATHS = {
  root: "/",
  login: "/login",
  register: "/register",
}

export default class App extends Component {
  constructor() {
    super();
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
    this.userView = this.userView.bind(this);
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

  userView(role) {
    switch (role && role.toUpperCase()) {
      case 'STUDENT':
        return <StudentView 
          isLoggedIn={this.state.loggedIn}
          user={this.state.userDetails}
        />
      case 'STAFF':
        return <StaffView 
          isLoggedIn={this.state.loggedIn}
        />
      case 'TEACHER':
        return <TeacherView
          isLoggedIn={this.state.loggedIn}
          user={this.state.userDetails}
        />
      default:
        return null
    }
  }

  liftPayload(details) {
      this.setState({
        role : details.userRole,
        userDetails: details.userToSend
      }, () => {
        localStorage.setItem(App_LS, JSON.stringify(this.state))
      });
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
          <Route exact path={PATHS.root} render={(props) => 
              this.state.loggedIn ? this.userView(this.state.role) : <Redirect to="/login" />
            }
          />
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
