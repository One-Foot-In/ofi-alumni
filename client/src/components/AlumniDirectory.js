import React, { Component } from 'react';
import { Card, Image, Search, Pagination, Grid, Segment } from 'semantic-ui-react'

/*
props:
- entries: dictionary
- query: string
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

        return (
            <Grid columns={1} divided>
                <Grid.Row stretched>
                    <Grid.Column>
                        <Segment>
                            <Search
                                showNoResults={false}
                                onSearchChange={this.handleSearchChange}
                            />
                        </Segment>
                        <Segment>
                            <Card.Group>
                                <Card fluid>
                                    <Image 
                                        floated='left'
                                        rounded
                                        size='small'
                                        src={this.props.entries[0]['imageURL']}
                                    />
                                    <Card.Header>{this.props.entries[0]['name']}</Card.Header>
                                </Card>
                <Card fluid>
                    <Image 
                        floated='left'
                        rounded
                        size='small'
                        src={this.props.entries[1]['imageURL']}
                    />
                    <Card.Header>{this.props.entries[1]['name']}</Card.Header>
                </Card>
                <Card fluid>
                    <Image 
                        floated='left'
                        rounded
                        size='small'
                        src={this.props.entries[2]['imageURL']}
                    />
                    <Card.Header>{this.props.entries[2]['name']}</Card.Header>
                </Card>
            </Card.Group>
                        </Segment>
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

function createPage(page, entries) {
    var cards = []
    let firstCard = (page - 1) * 3
    for (let i = firstCard; i < firstCard + 3; i++) {
        cards.push((
            <Card fluid>
                <Image 
                    floated='right'
                    rounded
                    size="medium"
                    src={entries[i]['imageURL']}
                />
                <Card.Content>
                    <Card.Header>{entries[i]['name']}</Card.Header>
                </Card.Content>

            </Card>
        ));
    }


}