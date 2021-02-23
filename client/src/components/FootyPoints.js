import React from 'react';
import { Label } from 'semantic-ui-react';
const logo = require('./logo.png');

function FootyPoints (props) {
    return (
        <Label image style={props.style}>
            <img src={logo}/>
            {props.points}
        </Label>
    )

}

export default FootyPoints;