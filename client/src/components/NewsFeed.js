import React, { Component } from 'react';
import { Segment, Feed, Image, Header, Icon, Divider} from 'semantic-ui-react'
import { makeCall } from '../apis';

export default class NewsFeed extends Component {
    render() {
        console.log(this.props.userDetails)
        
        return(
            <Segment>
                <Header>
                    <Icon name={'newspaper outline'}/>
                    <Header.Content>Recent News</Header.Content>
                </Header>
                <Divider/>
                <Feed size='large'>
                    <Feed.Event>
                        <Feed.Label>
                            <img src={this.props.userDetails.imageURL} />
                        </Feed.Label>
                        <Feed.Content>
                            <Feed.Summary>
                                <Feed.User>{this.props.userDetails.name}</Feed.User> joined the network!
                                <Feed.Date>Just Now</Feed.Date>
                            </Feed.Summary>
                            <Feed.Extra>
                            {this.props.userDetails.name} graduated in {this.props.userDetails.gradYear}, and currently lives in {this.props.userDetails.city}, {this.props.userDetails.country}
                            </Feed.Extra>
                        </Feed.Content>
                    </Feed.Event>
                </Feed>
            </Segment>
            
        )
    }
}