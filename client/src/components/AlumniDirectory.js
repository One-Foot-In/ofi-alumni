import React, { Component } from 'react';
import { Card, Image, Search, Pagination, Grid, Segment, Button, Dropdown, Responsive, Label } from 'semantic-ui-react'
import { makeCall } from '../apis';
import RequestModal from './RequestModal'
import AlumniContactModal from './AlumniContactModal'
import AccessControlDropdown from './AccessContextDropdown'
import FootyPoints from './FootyPoints';

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
        key: 'Interests',
        text: 'Interests',
        value: 'interests'
    },
    {
        key: 'Consultancy Topics',
        text: 'Consultancy Topics',
        value: 'topics'
    },
]

const pageSize = 3;

/*
props:
- schoolId: String
- userDetails: {}
- accessContexts: []
- role
*/
export default class AlumniDirectory extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activePage: 1,
            numEntries: 0,
            isLoading: false,
            searchValue: '',
            totalPages: 0,
            entries:[],
            gradYears: [],
            allText: [],
            display: [],
            interestOptions: [],
            topicOptions: [],
            numResults: 0,
            filter: 'all',
            requestModalOpen: false,
            alumniContactModalOpen: false,
            alumniDetails: null,
            accessContext: "INTRASCHOOL"
        }
        this.toggleRequestModal = this.toggleRequestModal.bind(this)
        this.toggleAlumniContactModal = this.toggleAlumniContactModal.bind(this)
        this.liftAccessContext = this.liftAccessContext.bind(this)
        this.setAlumniDirectory = this.setAlumniDirectory.bind(this)
        this.getSearchInputField = this.getSearchInputField.bind(this)
    }

    liftAccessContext(newAccessControl) {
        this.setState({
            accessContext: newAccessControl
        }, async () => {
            let result = await this.getEntries()
            if (!result || result.error) {
                // TECH DEBT: Error toast
            } else {
                this.setAlumniDirectory(result)
            }
        })
    }

    setAlumniDirectory(result) {
        let totalPages = 0;
        if (result.alumni !== null) {
            totalPages = Math.ceil(result.alumni.length/pageSize);
        }
        this.setState({
            entries: result.alumni,
            totalPages: totalPages,
            numEntries: result.alumni.length
        }, () => {
            this.populateSearchDropdownStates(this.state.entries)
        })
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

    async UNSAFE_componentWillMount() {
        let result = await this.getEntries()
        if (!result || result.error) {
            // TECH DEBT: Error toast
        } else {
            let interestsByCount = result.alumni.reduce(
                (interestByCountMap, alumnus) => {
                    for (let interest of alumnus.interests) {
                        interestByCountMap[interest.name] = (interestByCountMap[interest.name] || 0) + 1
                    }
                    return interestByCountMap
                },
            {})
            let topicsByCount = result.alumni.reduce(
                (topicByCountMap, alumnus) => {
                    for (let topic of alumnus.topics) {
                        topicByCountMap[topic] = (topicByCountMap[topic] || 0) + 1
                    }
                    return topicByCountMap
                },
            {})
            let interestOptions = []
            for (let [interest, count] of Object.entries(interestsByCount)) {
                interestOptions.push({
                    key: interest,
                    value: interest,
                    text: `${interest} (${count})`,
                })
            }
            let topicOptions = []
            for (let [topic, count] of Object.entries(topicsByCount)) {
                topicOptions.push({
                    key: topic,
                    value: topic,
                    text: `${topic} (${count})`,
                })
            }
            this.setState({
                interestOptions,
                topicOptions
            }, () => {
                this.setAlumniDirectory(result)
            })
        }
    }

    populateSearchDropdownStates(entries) {
        let gradYears = [];
        let allText = [];
        let display = [];
        let i = 0;
        for (let post of entries) {
            if(!gradYears.find(year => year['value'] === post.gradYear)) {
                gradYears.push({
                    key: post.gradYear,
                    text: post.gradYear,
                    value: post.gradYear
                });
            }
            allText.push(
                        post.city + ' '
                         + post.country + ' '
                         + post.jobTitleName + ' '
                         + post.companyName + ' '
                         + post.collegeName + ' '
                         + post.name + ' '
                         + post.gradYear
                         + post.interests.map(interest => interest.name).join(' ')
                         + post.topics.join(' ')
                         );
            display.push(this.constructProfile(post, i));
            i++;
        }
        gradYears.sort(function(a,b){return a.value-b.value})
        this.setState({
                        gradYears: gradYears,
                        allText: allText,
                        display: display
                     })
    }

    constructProfile(post, i) {
        return (
            <Grid.Row columns={2} key={i}>
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
                                <Grid.Row columns={3}>
                                    <Grid.Column width={8}>{post.name}</Grid.Column>
                                    <Grid.Column textAlign='right' width={4}>
                                        Graduated: {post.gradYear}
                                    </Grid.Column>
                                    <Grid.Column width={4}>
                                        <FootyPoints points={ post.footyPoints } 
                                                    style={{
                                                        'margin-left': 0,
                                                        'margin-top': '3px'
                                                    }}/>
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                            </Card.Header>
                                            
                            <Card.Meta>{post.profession}</Card.Meta>
                            <Card.Description>College: {post.collegeName}</Card.Description>
                            <Card.Description>Location: {(post.city && post.country) && `${post.city} (${post.country})`}</Card.Description>
                            <Card.Description>Profession: {post.jobTitleName || 'Unavailable'}</Card.Description>
                            <Card.Description>Company: {post.companyName || 'Unavailable'}</Card.Description>
                            {post.interests && post.interests.length ? <Card.Description>Interests: {this.getInterests(post.interests)}</Card.Description> : null}
                            {post.topics && post.topics.length ? <Card.Description>Topics of Consultancy: {this.getTopics(post.topics)}</Card.Description> : null}

                            <br />
                        </Card.Content>
                        {this.requestButton(post, i)}
                    </Card>
                </Grid.Column>
            </Grid.Row>
        )
    }

    requestButton(post, i) {
        if (!this.props.userDetails.approved) {
            return (
                <Button
                    primary
                    disabled
                >
                    Your account is pending approval
                </Button>
            )
        }
        if (!post.approved) {
            return (
                <Button
                    primary
                    disabled
                >
                    User is pending approval
                </Button>
            )
        }
        if (post._id !== this.props.userDetails._id && (this.props.role === 'STUDENT')) {
            return (
                <Button 
                    primary 
                    data-id={i}
                    onClick={this.handleRequestButton.bind(this)}
                >
                    Connect with {post.name}!
                </Button>
            )
        } else if (post._id !== this.props.userDetails._id && this.props.role === 'ALUMNI') {
            return (
                <Button
                    primary
                    data-id={i}
                    onClick={this.handleConnectButton.bind(this)}
                >
                    Connect with {post.name}!
                </Button>
            )
        }
        return null
    }

    // Deprecated at early stages when contact is not restricted by missing zoomLink and/or topics
    requestButtonRestricted(post, i) {
        var requestButton;
            if (post._id !== this.props.userDetails._id && this.props.role === 'STUDENT') {
                if (('zoomLink' in post && post.zoomLink) && post.topics.length > 0) {
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
        return makeCall(null, `/alumni/all/${this.props.schoolId}/${this.state.accessContext}/${this.props.userDetails.user}`, 'get').catch(e => console.log(e))
    }

    getInterests(allInterests, displayLimit = 4) {
        return (
            <div
                style={{
                    margin: '5px'
                }}
            >
            {
                allInterests.slice(0, displayLimit).map(interest => {
                    return (
                        <Label
                            key={interest._id}
                            style={{
                                'margin': '3px'
                            }}
                            color='teal'
                        >
                            {interest.name}
                        </Label>
                    )
                })
            }
            {
                allInterests.length > displayLimit ?
                `+ ${allInterests.length - displayLimit} more...`
                : null
            }
            </div>
        )
    }

    getTopics(topics, displayLimit = 3) {
        return (
            <div
                style={{
                    margin: '5px'
                }}
            >
            {
                topics.slice(0, displayLimit).map(topic => {
                    return (
                        <Label
                            key={topic}
                            style={{
                                'margin': '3px'
                            }}
                            color='olive'
                        >
                            {topic}
                        </Label>
                    )
                })
            }
            {
                topics.length > displayLimit ?
                `+ ${topics.length - displayLimit} more...`
                : null
            }
            </div>
        )
    }

    search(value) {
        this.setState({searchValue: value})
        this.setState({results: 0})
        var numResults = 0;
        if (typeof(value) === 'string') {
            value = value.replace(/[^a-zA-Z0-9_,/-]+/g," ")
        }
        let searchPattern = new RegExp(value, 'i');
        let display = [];
        let i = 0;
        for (let post of this.state.entries) {
            if (this.state.filter !== 'all' && post[this.state.filter]) {
                let isMatch = false
                if (this.state.filter === 'interests') {
                    for (let interest of post.interests) {
                        isMatch = interest.name.toString().match(searchPattern) !== null
                    }
                } else if (this.state.filter === 'topics') {
                    for (let topic of post.topics) {
                        isMatch = topic.toString().match(searchPattern) !== null
                    }
                } else {
                    isMatch = post[this.state.filter].toString().match(searchPattern) !== null
                }
                if (isMatch) {
                    numResults += 1
                    display.push(this.constructProfile(post, i));
                }
            } else if (this.state.filter === 'all') {
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

    handleFilterOrYearSelectionChange = (e, { name, value }) => {
        if (name === 'year') {
            // when called from the graduation year dropdown
            this.search(value)
        } else {
            this.setState({
                filter: value,
                searchValue: ''
            }, () => {
                this.search('')
            })
        }
    }

    handleInterestSelectionChange = (e, {value}) => {
        this.search(value)
    }

    handleTopicSelectionChange = (e, {value}) => {
        this.search(value)
    }

    handleRequestButton(e) {
        this.setState({alumniDetails: this.state.entries[e.currentTarget.dataset.id]})
        this.toggleRequestModal()
    }
    handleConnectButton(e) {
        this.setState({alumniDetails: this.state.entries[e.currentTarget.dataset.id]})
        this.toggleAlumniContactModal()
    }

    getSearchInputField(filter) {
        switch(filter) {
            case 'gradYear':
                return (
                    <Dropdown 
                        placeholder='Graduation Year'
                        fluid
                        floating
                        selection
                        name='year'
                        options={this.state.gradYears}
                        onChange={this.handleFilterOrYearSelectionChange}
                    />
                )
            case 'interests':
                return (
                    <Dropdown 
                        placeholder='Interest'
                        fluid
                        floating
                        selection
                        search
                        name='interest'
                        options={this.state.interestOptions}
                        onChange={this.handleInterestSelectionChange}
                    />
                )
            case 'topics':
                return (
                    <Dropdown 
                        placeholder='Consultancy Topics'
                        fluid
                        floating
                        selection
                        search
                        name='topics'
                        options={this.state.topicOptions}
                        onChange={this.handleTopicSelectionChange}
                    />
                )
            default:
                return (
                    <Search
                        open={false}
                        showNoResults={false}
                        onSearchChange={this.handleSearchChange}
                        input={{fluid: true}}
                        placeholder="Search"
                        value={this.state.searchValue}
                    />
                )
        }
    }

    render() {
        const {
            totalPages,
            activePage,
            filter,
            numResults,
            display,
            searchValue,
        } = this.state

        /* results row */
        let resultsRow;
        if (searchValue !== '') {
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
        let hasMoreThanOneAccessContext = this.props.accessContexts && this.props.accessContexts.length > 1
        let accessContextDropdown = (
            hasMoreThanOneAccessContext ?
            <Grid.Column width={4}>
                <AccessControlDropdown
                    liftAccessContext={this.liftAccessContext}
                    accessContexts={this.props.accessContexts}
                    accessContext={this.state.accessContext}
                />
            </Grid.Column>
            : null
        )
        searchRow = (
            <Grid.Row columns={hasMoreThanOneAccessContext ? 3 : 2}>
                { accessContextDropdown }
            <Grid.Column width={hasMoreThanOneAccessContext ? 8 : 10}>
                {this.getSearchInputField(filter)}
            </Grid.Column>
            <Grid.Column width={hasMoreThanOneAccessContext ? 4 : 6}>
                <Dropdown
                    placeholder='Search By:'
                    floating
                    selection
                    options={searchOptions}
                    name='filter'
                    onChange={this.handleFilterOrYearSelectionChange}
                />
            </Grid.Column>
            </Grid.Row>
        )
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
                        <Segment
                            textAlign='center'
                        >
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