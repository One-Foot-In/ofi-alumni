import React from 'react';
import { Button } from 'semantic-ui-react';

const LINKEDIN_RIDERECT = 'http://localhost:5000/linkedin'
const LINKEDIN_CLIENT_ID = process.env.REACT_APP_LINKEDIN_API_KEY

/*
    Props:
    - email
*/
export default class LinkedInUpdate extends React.Component {
    constructor(props) {
        super(props);
        this.fetchFromLinkedIn = this.fetchFromLinkedIn.bind(this);
    }
    
    fetchFromLinkedIn() {
        var oauthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&scope=r_liteprofile&state=${this.props.email || 'email_missing'}&redirect_uri=${LINKEDIN_RIDERECT}`
        window.open(oauthUrl)
    }

    render() {
      return (
        <Button
          primary
          onClick={this.fetchFromLinkedIn}
          style={{'margin': '2px'}}  
        >
            Fetch Photo from LinkedIn
        </Button>
      )
    }
  
  }