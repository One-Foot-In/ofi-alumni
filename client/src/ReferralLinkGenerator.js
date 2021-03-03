import React from 'react';
import { Card, Button } from 'semantic-ui-react'

/**
 * Button group that allows a user to copy a referral link to share
 * @param {*} props
 * schoolId - id for the user current school
 * schoolName - name of the user school
 * userId - userId for the student / alumnus 
 */
export default function ReferralLinkGenerator (props) {

    const copyLink = (role) => {
        let referralLink = `${window.location.href}register/${role}/${props.userId}/${props.schoolId}`
        navigator.clipboard.writeText(referralLink)
    }

    return (
        <Card
            centered
            fluid
        >
            <Card.Content>
                <Card.Description>
                Earn <strong>FootyPoints</strong> by bringing more users from {props.schoolName} to our network
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <div className='ui two buttons'>
                <Button
                    id='alumni-referral-link'
                    basic
                    color='orange'
                    onClick={copyLink('alumni')}
                >
                    Refer Alumni
                </Button>
                <Button
                    basic
                    color='yellow'
                    onClick={copyLink('student')}
                >
                    Refer Student
                </Button>
                </div>
            </Card.Content>
        </Card>
    )
}