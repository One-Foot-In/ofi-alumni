import React, { Component } from 'react';
import { Card, Image, Search, Pagination, Grid, Segment } from 'semantic-ui-react'

/*
props:
- entries: list of alumni profiles
*/
export default class AlumniDirectory extends Component {
    state = {
        activePage: 1,
        numEntries: this.props.entries.length,
        isLoading: false,
        value: '',
        pageSize: 3,
        totalPages: Math.ceil(this.props.entries.length/3)
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
            pageSize
        } = this.state

        let profiles=[]
        for (let post of this.props.entries) {
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