import React, { Component } from 'react';
import { Card, Image, Search, Pagination, Grid, Segment, Button } from 'semantic-ui-react'
import { makeCall } from '../apis';

/*
props:
- entries: list of alumni profiles
*/
export default class AlumniDirectory extends Component {
    state = {
        activePage: 1,
        numEntries: 0,
        isLoading: false,
        value: '',
        pageSize: 3,
        totalPages: Math.ceil(0/3),
        entries:[]
    }

    componentWillMount() {
        this.getEntries().then(result => this.setState({
            entries: result.alumnus,
            totalPages: Math.ceil(result.alumnus.length/3),
            numEntries: result.alumnus.length
        }))
    }

    getEntries() {
        return makeCall(null, '/alumni/all', 'get')
    }

    handlePaginationChange = (e, { activePage }) => {
        this.setState({ activePage })
    }
    handleSearchChange = (e, { value }) => {
        this.setState({ value })
    }

    render(){
        const {
            totalPages,
            activePage,
            pageSize,
            entries
        } = this.state
        console.log(entries)
        let profiles=[]
        for (let post of entries) {
            var requestButton;
            if ('zoomLink' in post) {
                requestButton = <Button primary>Make Request</Button>
            } else {
                requestButton = <Button disabled>Make Request</Button>
            }
            profiles.push(
                <Grid.Row columns={2}>
                    <Grid.Column width={4}>
                        <Card fluid>
                            <Image
                                fluid
                                centered
                                rounded
                                src={post.imageURL}
                            />
                        </Card>
                    </Grid.Column>
                    <Grid.Column>
                        <Card fluid>
                            <Card.Content>
                                <Card.Header>{post.name}</Card.Header>
                                <Card.Meta>{post.jobTitle}</Card.Meta>

                                <Card.Description>College: {post.college}</Card.Description>
                                <Card.Description>Location: {post.location}</Card.Description>
                                <Card.Description>Company: {post.company}</Card.Description>
                                <br />
                            </Card.Content>
                            {requestButton}
                        </Card>
                    </Grid.Column>
                </Grid.Row>
            )
        }

        return (
            <Grid divided="vertically">
                <Grid.Row>
                    <Grid.Column>
                            <Search
                                open={false}
                                showNoResults={false}
                                onSearchChange={this.handleSearchChange}
                                input={{fluid: true}}
                                placeholder={"Search"}
                            />
                    </Grid.Column>
                </Grid.Row>
                
                {pageGenerator(profiles, pageSize, activePage)}

                <Grid.Row stretched>
                    <Grid.Column>
                        <Segment>
                            <Pagination
                                activePage={activePage}
                                totalPages={totalPages}
                                onPageChange={this.handlePaginationChange}
                            />
                        </Segment>
                    </Grid.Column>
                </Grid.Row> 
            </Grid>
        )
    }
}

function pageGenerator(profiles, pageSize, activePage) {
    let display=[]
    for (let i = 0; i < pageSize; i++) {
        display.push(profiles[(activePage - 1) * pageSize + i])
    }
    return display
}