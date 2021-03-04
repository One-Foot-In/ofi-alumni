import React from 'react';
import { Label, Flag } from 'semantic-ui-react';
import { flagCodeByCountry } from '../flags';
import FootyPoints from './FootyPoints';

function WelcomeBadge(props) {
    const { role, name, country, footyPoints } = props;
    const readableRole = {
        'ALUMNI': 'Alumnus',
        'STUDENT': 'Student',
        'COUNTRY_AMBASSADOR': 'Ambassador',
        'ADMIN': 'Admin'
    };
    const showFlag = (role === 'COUNTRY_AMBASSADOR');

    let welcomeMessage = '';
    if (role === 'COUNTRY_AMBASSADOR') {
        welcomeMessage = `Welcome ${readableRole[role]} ${name}`;
    } 
    else {
        welcomeMessage = `Welcome ${name} (${readableRole[role]})`;
    }

    return (
        role ? 
            <div>
                <Label style={{
                    backgroundColor: 'black',
                    color: 'white'
                }}>
                    {showFlag ?
                        <Flag name={ country && flagCodeByCountry[country] }/> :
                        null
                    }
                    {welcomeMessage}
                    <br/>
                    <br/>
                    <FootyPoints points={footyPoints}
                                 style={{
                                    float: 'left',
                                    'margin-left': 0
                                 }} />
                </Label>
            </div> :
            null
    )
}

export default WelcomeBadge