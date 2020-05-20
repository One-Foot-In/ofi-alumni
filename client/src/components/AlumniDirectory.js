import React, { Component } from 'react';
import { Card, Image, Search, Pagination, Grid, Segment, Button, Dropdown } from 'semantic-ui-react'
import { makeCall } from '../apis';

const searchOptions = [
    {
        key: 'All Fields',
        text: 'All Fields',
        value: 'all'
    },
    {
        key: 'Location',
        text: 'Location',
        value: 'location'
    },
    {
        key: 'College',
        text: 'College',
        value: 'college'
    },
    {
        key: 'Profession',
        text: 'Profession',
        value: 'profession'
    },
    {
        key: 'Company',
        text: 'Company',
        value: 'company'
    },
    {
        key: 'Name',
        text: 'Name',
        value: 'name'
    },
    {
        key: 'Graduation Year',
        text: 'Graduation Year',
        value: 'gradYear'
    }
]

/*
props:
- isAlumniView: shows book request button if false
*/
export default class AlumniDirectory extends Component {
    state = {
        activePage: 1,
        numEntries: 0,
        isLoading: false,
        value: '',
        pageSize: 3,
        totalPages: Math.ceil(0/3),
        entries:[],
        filter: 'all'
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
    handleDropdownChange = (e, { value }) => {
        this.setState({ filter: value })
    }

    render(){
        const {
            totalPages,
            activePage,
            pageSize,
            entries,
            filter
        } = this.state
        console.log(entries)
        let profiles=[]
        for (let post of entries) {
            profiles.push(
                <Grid.Row columns={2}>
                    <Grid.Column width={4}>
                            <Image
                                size='small'
                                fluid
                                centered
                                rounded
                                src={post.imageURL}
                            />
                    </Grid.Column>
                    <Grid.Column fluid>
                        <Card fluid>
                            <Card.Content>
                                <Card.Header>
                                <Grid>
                                    <Grid.Row columns={2}>
                                        <Grid.Column>{post.name}</Grid.Column>
                                        <Grid.Column textAlign='right'>
                                          Graduated: {post.gradYear}
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                                </Card.Header>
                                
                                <Card.Meta>{post.profession}</Card.Meta>
                                <Card.Description>College: {post.college}</Card.Description>
                                <Card.Description>Location: {post.location}</Card.Description>
                                <Card.Description>Company: {post.company}</Card.Description>
                                <br />
                            </Card.Content>
                            {requestVisible(this.props.isAlumniView, post)}
                        </Card>
                    </Grid.Column>
                </Grid.Row>
            )
        }

        return (
            
            <Grid divided="vertically">
                <p>{filter}</p>
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <Search
                            open={false}
                            showNoResults={false}
                            onSearchChange={this.handleSearchChange}
                            input={{fluid: true}}
                            placeholder={"Search"}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <Dropdown
                            placeholder='Search By:'
                            floating
                            selection
                            options={searchOptions}
                            onChange={this.handleDropdownChange}
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

function requestVisible(isAlumniView, post) {
    var requestButton;
            if (('zoomLink' in post) && !isAlumniView) {
                requestButton = <Button primary>Make Request</Button>
            } else if (!isAlumniView){
                requestButton = <Button disabled>Make Request</Button>
            } else {
                requestButton = null;
            }
    return requestButton
}