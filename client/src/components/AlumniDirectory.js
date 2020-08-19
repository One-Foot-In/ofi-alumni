import React, { Component } from 'react';
import { Card, Image, Search, Pagination, Grid, Segment, Button, Dropdown, Responsive } from 'semantic-ui-react'
import { makeCall } from '../apis';
import RequestModal from './RequestModal'
import AlumniContactModal from './AlumniContactModal'

// Filter dropdown options
const searchOptions = [
    {
        key: 'All Fields',
        text: 'All Fields',
        value: 'all'
    },
    {
        key: 'Country',
        text: 'Country',
        value: 'country'
    },
    {
        key: 'College',
        text: 'College',
        value: 'collegeName'
    },
    {
        key: 'Profession',
        text: 'Profession',
        value: 'jobTitleName'
    },
    {
        key: 'Company',
        text: 'Company',
        value: 'companyName'
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
    },
    {
        key: 'Topics of Consultancy',
        text: 'Topics of Consultancy',
        value: 'topics'

    },
    {
        key: 'Interests',
        text: 'Interests',
        value: 'interests'
    }
]

const pageSize = 3;

/*
props:
- schoolId: String
- userDetails: {}
- role
*/
export default class AlumniDirectory extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activePage: 1,
            numEntries: 0,
            isLoading: false,
            value: '',
            totalPages: 0,
            entries: [],
            gradYears: [],
            allText: [],
            topicsArray: [],
            interestsArray: [],
            display: [],
            numResults: 0,
            filter: 'all',
            requestModalOpen: false,
            alumniContactModalOpen: false,
            alumniDetails: null,
        }
        this.toggleRequestModal = this.toggleRequestModal.bind(this)
        this.toggleAlumniContactModal = this.toggleAlumniContactModal.bind(this)
    }

    toggleRequestModal() {
        this.setState({
            requestModalOpen: !this.state.requestModalOpen
        })
    }
    toggleAlumniContactModal() {
        this.setState({
            alumniContactModalOpen: !this.state.alumniContactModalOpen
        })
    }

    async componentWillMount() {
        let result = await this.getEntries()
        let totalPages = 0;
        if (result.alumni !== null) {
            totalPages = Math.ceil(result.alumni.length/pageSize);
        }
        this.setState({
            entries: result.alumni,
            totalPages: totalPages,
            numEntries: result.alumni.length
        })
        this.populateSearchDropdownStates(this.state.entries)
    }

    populateSearchDropdownStates(entries) {
        let gradYears = [];
        let allText = [];
        let topicsArray = [];
        let topicsSet = new Set();
        let interestsArray = [];
        let interestsSet = new Set();
        let display = [];
        let i = 0, j = 0;

        for (let post of entries) {
            if (!gradYears.find(year => year['value'] === post.gradYear)) {
                gradYears.push({
                    key: post.gradYear,
                    text: post.gradYear,
                    value: post.gradYear
                });
            }

            let topicsForAlumnus = post.topics;
            for (let topic in topicsForAlumnus) {
                if (!topicsSet.has(topicsForAlumnus[topic])) {
                    topicsSet.add({
                        key: topicsForAlumnus[topic],
                        text: topicsForAlumnus[topic],
                        value: topicsForAlumnus[topic]
                    });
                }
            }

            console.log("1. Topics Set: ", topicsSet)

            let interestsForAlumnus = post.interests;
            let interestStringValuesForAlumnus = interestsForAlumnus.map(interestObj => interestObj.text);
            
            for (let interest in interestStringValuesForAlumnus) {
                if (!interestsSet.has(interestsForAlumnus[interest])) {
                    interestsSet.add({
                        key: interestsForAlumnus[interest]._id,
                        text: interestsForAlumnus[interest].name,
                        value: interestsForAlumnus[interest]._id

                    });
                }
            }

            console.log("2. Interests Set: ", interestsSet)

            allText.push(
                        post.collegeName + ' '
                         + post.city + ' '
                         + post.country + ' '
                         + post.jobTitleName + ' '
                         + post.companyName + ' '
                         + post.name + ' '
                         + post.gradYear + ' '
                         + post.topics);
            
            display.push(this.constructProfile(post, i));
            i++;
        }

        topicsArray = Array.from(topicsSet)
        interestsArray = Array.from(interestsSet)

        console.log("3. Topics Array: ", topicsArray)
        console.log("4. Interests Array: ", interestsArray)

        gradYears.sort(function(a,b){return a.value-b.value})
        this.setState({ gradYears: gradYears,
                        allText: allText,
                        topicsArray: topicsArray,
                        interestsArray: interestsArray,
                        display: display
                        })
    }

    constructProfile(post, i) {
        return (
            <Grid.Row columns={2}>
                <Grid.Column width={4}>
                    <Image
                        size='small'
                        centered
                        rounded
                        src={post.imageURL}
                    />
                </Grid.Column>
                <Grid.Column>
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
                            <Card.Description>College: {post.collegeName}</Card.Description>
                            <Card.Description>Location: {(post.city && post.country) && `${post.city} (${post.country})`}</Card.Description>
                            <Card.Description>Company: {post.companyName}</Card.Description>
                            <br />
                        </Card.Content>
                        {this.requestVisible(post, i)}
                    </Card>
                </Grid.Column>
            </Grid.Row>
        )
    }

    requestVisible(post, i) {
        var requestButton;
            if (post._id !== this.props.userDetails._id && this.props.role === 'STUDENT') {
                if (('zoomLink' in post && 
                    (post.zoomLink !== null && post.zoomLink !== '')) && post.topics.length > 0) {
                    requestButton = <Button 
                                        primary 
                                        data-id={i}
                                        onClick={this.handleRequestButton.bind(this)}
                                    >
                                        Connect with {post.name}!
                                    </Button>
                } else {
                    requestButton = <Button disabled>Connect with {post.name}!</Button>
                }
            } else if (post._id !== this.props.userDetails._id && this.props.role === 'ALUMNI') {
                requestButton = <Button
                                    primary
                                    data-id={i}
                                    onClick={this.handleConnectButton.bind(this)}
                                >
                                    Connect with {post.name}!
                                </Button>
            } else {
                requestButton = null;
            }
        return requestButton
    }

    getEntries() {
        return makeCall(null, `/alumni/all/${this.props.schoolId}`, 'get').catch(e => console.log(e))
    }

    search(value) {
        this.setState({value: value})
        this.setState({results: 0})
        var numResults = 0;
        let searchPattern = new RegExp(value, 'i');
        let display = [];
        let i = 0;

        for (let post of this.state.entries) {
            if (this.state.filter !== 'all' && post[this.state.filter]) {
                if (post[this.state.filter].toString().match(searchPattern) !== null) {
                    numResults += 1
                    display.push(this.constructProfile(post));
                }
            } else {
                if (this.state.allText[i].match(searchPattern) !== null) {
                    numResults += 1
                    display.push(this.constructProfile(this.state.entries[i], i))
                }
            }
            i++;
        }
        this.setState({ numResults: numResults,
                        display: display,
                        totalPages: Math.ceil(display.length/pageSize),
                        activePage: 1
                    })
    }

    handlePaginationChange = (e, { activePage }) => {
        this.setState({ activePage })
    }
    handleSearchChange = (e, { value }) => {
        this.search(value)
    }
    handleDropdownChange = (e, { name, value }) => {
        if (name === 'year') {
            this.search(value)
        } else if (name == 'topics') {
            this.search(value)
        }
        this.setState({ [name]: value })
    }
    handleRequestButton(e) {
        this.setState({alumniDetails: this.state.entries[e.currentTarget.dataset.id]})
        this.toggleRequestModal()
    }
    handleConnectButton(e) {
        this.setState({alumniDetails: this.state.entries[e.currentTarget.dataset.id]})
        this.toggleAlumniContactModal()
    }

    render(){
        const {
            totalPages,
            activePage,
            filter,
            numResults,
            gradYears,
            topicsArray,
            interestsArray,
            display,
            value,
            allText,
        } = this.state


        console.log("5. Topics Array: ", topicsArray)
        console.log("6. Interests Array: ", interestsArray)

        /* results row */
        let resultsRow;
        if (value !== '') {
            resultsRow = (
                <Grid.Row centered>
                        Found {numResults} results
                </Grid.Row>
            )
        } else {
            resultsRow = null
        }

        /* Search Area */
        let searchRow;
        if (filter !== 'gradYear' && filter !== 'topics' && filter !== 'interests') {
            searchRow = (
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
                        name='filter'
                        onChange={this.handleDropdownChange}
                    />
                </Grid.Column>
                </Grid.Row>
            )
        } else if (filter == 'topics') {
            searchRow = (
                console.log("7. TopicsArray in Render: ", topicsArray),

                <Grid.Row columns={2}>
                <Grid.Column>
                        <Dropdown
                            button
                            fluid
                            floating
                            search
                            label='Topics Of Consultancy:'
                            name='topics'
                            options={topicsArray}
                            onChange={this.handleDropdownChange}
                        />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown
                        placeholder='Search By:'
                        floating
                        selection
                        name='filter'
                        options={searchOptions}
                        onChange={this.handleDropdownChange}
                    />
                </Grid.Column>
                </Grid.Row>
            )
        } else if (filter == 'interests') {
            searchRow = (
                console.log("8. InterestsArray in Render: ", interestsArray),

                <Grid.Row columns={2}>
                <Grid.Column>
                        <Dropdown
                            button
                            fluid
                            floating
                            search
                            label='Interests:'
                            name='interests'
                            options={interestsArray}
                            onChange={this.handleDropdownChange}
                        />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown
                        placeholder='Search By:'
                        floating
                        selection
                        name='filter'
                        options={searchOptions}
                        onChange={this.handleDropdownChange}
                    />
                </Grid.Column>
                </Grid.Row>
            )
        } else {
            searchRow = (
                <Grid.Row columns={2}>
                <Grid.Column>
                        <Dropdown 
                            placeholder='Year:'
                            fluid
                            floating
                            selection
                            name='year'
                            options={gradYears}
                            onChange={this.handleDropdownChange}
                        />
                </Grid.Column>
                <Grid.Column>
                    <Dropdown
                        placeholder='Search By:'
                        floating
                        selection
                        name='filter'
                        options={searchOptions}
                        onChange={this.handleDropdownChange}
                    />
                </Grid.Column>
                </Grid.Row>
            )
        }
        /* Search Area */

        return ( 
            <Grid stackable divided="vertically">
                
                {searchRow}
                {resultsRow}
                {this.state.requestModalOpen && 
                    <RequestModal
                    modalOpen={this.state.requestModalOpen}
                    closeModal={this.toggleRequestModal}
                    alumni={this.state.alumniDetails}
                    userDetails={this.props.userDetails}
                    role={this.props.role}
                    />
                }
                {this.state.alumniContactModalOpen && 
                    <AlumniContactModal
                    modalOpen={this.state.alumniContactModalOpen}
                    closeModal={this.toggleAlumniContactModal}
                    alumni={this.state.alumniDetails}
                    userDetails={this.props.userDetails}
                    role={this.props.role}
                    />
                }
                
                {pageGenerator(display, pageSize, activePage)}

                <Grid.Row stretched>
                    <Grid.Column>
                        <Segment>
                            <Responsive as={Pagination} minWidth={726}
                                activePage={activePage}
                                totalPages={totalPages}
                                onPageChange={this.handlePaginationChange}
                            />
                            <Responsive as={Pagination} maxWidth={726}
                                activePage={activePage}
                                totalPages={totalPages}
                                siblingRange={0}
                                boundaryRange={0}
                                onPageChange={this.handlePaginationChange}
                            />
                        </Segment>
                    </Grid.Column>
                </Grid.Row> 
            </Grid>
        )
    }
}

// Helper Functions

// Args: list of generated alumni cards(jsx objects)
//       desired page size (int), active page (int)
// Returns: jsx for the cards to display on the page the user is viewing
function pageGenerator(profiles, pageSize, activePage) {
    let display=[]
    for (let i = 0; i < pageSize; i++) {
        display.push(profiles[(activePage - 1) * pageSize + i])
    }
    return display
}