import React, { Component } from 'react';
import { Card, Image, Search, Pagination, Grid, Segment } from 'semantic-ui-react'

/*
props:
- entries: list of alumni profiles
*/
export default class AlumniDirectory extends Component {
    state = {
        activePage: 1,
        numEntries: Object.keys(this.props.entries).length,
        isLoading: false,
        value: '',
        totalPages: Math.ceil(Object.keys(this.props.entries).length/3)
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
            activePage
        } = this.state

        let profiles=[]
        for (let post in this.props.entries) {
            profiles.push(
                <Grid.Row columns={2}>
                    <Grid.Column width={4}>
                        <Card fluid>
                            <Image
                                fluid
                                centered
                                rounded
                                src={this.props.entries[post]['imageURL']}
                            />
                        </Card>
                    </Grid.Column>
                    <Grid.Column>
                        <Card fluid>
                            <Card.Content>
                                <Card.Header>{this.props.entries[post]['name']}</Card.Header>
                                <Card.Meta>{this.props.entries[post]['jobTitle']}</Card.Meta>

                                <Card.Description>College: {this.props.entries[post]['college']}</Card.Description>
                                <Card.Description>Location: {this.props.entries[post]['location']}</Card.Description>
                                <Card.Description>Company: {this.props.entries[post]['company']}</Card.Description>
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
                
                {profiles[(activePage - 1) * 3]}
                {profiles[(activePage - 1) * 3 + 1]}
                {profiles[(activePage - 1) * 3 + 2]}

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