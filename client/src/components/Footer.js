import React from 'react';
import { Grid, Icon } from 'semantic-ui-react'

export default function Footer () {
    return (
        <Grid
            centered
            padded
        >
            <Grid.Row>
                Please contact us &nbsp;<b>
                    <a href="mailto:onefootincollege@gmail.com"> here </a>
                </b>&nbsp; for any issues, concerns, or comments!
            </Grid.Row>
            <Grid.Row>
                <Icon
                    size='large'
                    link
                    name='facebook'
                    onClick={() => {
                        window.open('https://www.facebook.com/onefootinorg')
                    }}
                />
                <Icon
                    size='large'
                    link
                    name='linkedin'
                    onClick={() => {
                        window.open('https://www.linkedin.com/company/one-foot-in/')
                    }}
                />
            </Grid.Row>
        </Grid>
    )
}