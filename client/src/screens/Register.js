import React from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Button, Grid, Segment, Message } from 'semantic-ui-react';
import { Route, BrowserRouter as Router, Link, Switch } from 'react-router-dom'
import Signup from '../components/Signup';

export default class Register extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {match} = this.props;
        let buttonGroup = (props) =>
        <Grid centered >
            <Grid.Row>
                <Message
                    content="Are you a student or an alumni?"
                />
            </Grid.Row>
            <Grid.Row>
                <Button centered onClick={
                    (e) => {
                        e.preventDefault(); props.history.goBack()
                        }
                    }
                >
                    Back
                </Button>
            </Grid.Row>
            <Grid.Row>
                <Button.Group size='massive' style={{
                    'padding': '200px 0 100px 0'
                }}>
                    <Link to={`${match.url}/student`}>
                        <Button 
                            color='yellow'
                        >
                                Student
                        </Button>
                    </Link>
                    <Button.Or />
                    <Link to={`${match.url}/alumni`}>
                        <Button
                            color='orange'
                        >
                                Alumni
                        </Button>
                    </Link>
                </Button.Group>
            </Grid.Row>
        </Grid>
        return (
            <Router>
                <Switch>
                    <Route exact path={match.url} render={
                        (props) =>
                        <>
                            {buttonGroup(props)}
                        </>
                    }/>
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