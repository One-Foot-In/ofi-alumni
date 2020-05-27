import React, { Component } from 'react';
import { Segment } from 'semantic-ui-react';

export default class AlumniVerification extends Component {
    render(){
        return (
        <Segment inverted color='red' secondary>Please only verify individuals that you know personally!</Segment>
        )
    }
}