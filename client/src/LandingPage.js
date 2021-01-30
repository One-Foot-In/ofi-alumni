import React from 'react';
import { Grid } from 'semantic-ui-react'

const mobileWidthThreshold = 500

export default function LandingPage () {
    const viewPortWidth = (window && window.innerWidth) || mobileWidthThreshold

    return (
        <Grid
            centered
            style={{
                overflow: 'auto',
                maxHeight: (viewPortWidth < mobileWidthThreshold) ? 250 : 450,
            }}
            
        >
            
        </Grid>
    )
}