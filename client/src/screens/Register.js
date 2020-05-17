import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Button, Grid, Segment } from 'semantic-ui-react';
import { Route, BrowserRouter as Router, Link, Switch } from 'react-router-dom'
import {primary, secondary} from "../colors";
import Signup from '../components/Signup';

export default class Register extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {match} = this.props;
        let buttonGroup = 
        <Grid centered >
            <Button.Group size='massive' style={{
                'padding': '200px 0 100px 0'
            }}>
                <Link to={`${match.url}/student`}>
                    <Button 
                        style={{
                            'background': primary,
                            }}
                    >
                            Student
                    </Button>
                </Link>
                <Button.Or />
                <Link to={`${match.url}/alumni`}>
                    <Button
                        style={{
                            'background': secondary,
                            }}
                    >
                            Alumni
                    </Button>
                </Link>
            </Button.Group>
        </Grid>
        return (
            <Router>
                <Switch>
                    <Route exact path={match.url}>
                        {buttonGroup}
                    </Route>
                    <Route exact path={`${match.url}/alumni`} render={
                        (props) => 
                            <Signup
                                isAlumni={true}
                                match={props}
                            />
                        }
                    />
                    <Route exact path={`${match.url}/student`} render={
                        (props) => 
                            <Signup
                                isAlumni={false}
                                match={props}
                            />
                        }
                    />
                    <Route>
                        <Segment>
                            This page does not exist!
                        </Segment>
                    </Route>
                </Switch>
            </Router>
        )
    }
}