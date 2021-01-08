import React, { useState, useEffect } from 'react';
import { Card, Image, Search, Pagination, Grid, Segment, Button, Dropdown, List, Checkbox } from 'semantic-ui-react'
import FeedbackModal from './FeedbackModal'
import { makeCall } from '../../apis';

export default function ProfileList(props){
    const [allProfiles, setAllProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([])
    const [display, setDisplay] = useState([])
    const [pages, setPages] = useState(0)
    const [currPage, setCurrPage] = useState(1)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [secondaryFilter, setSecondaryFilter] = useState('')
    const [secondaryFilterOptions, setSecondaryFilterOptions] = useState([])
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
    const [profileId, setProfileId] = useState('')
    
    const pageSize = 4;

    const gradeOptions = () => {
        let options = [];
        for (let profile of allProfiles) {
            if(!options.find(year => year['value'] === profile.grade)) {
                options.push({
                    key: profile.grade,
                    text: profile.grade,
                    value: profile.grade
                });
            }
        }
        options.sort(function(a,b){return a.value-b.value})
        return options;
    }
    const schoolOptions = () => {
        let options = [];
        for (let profile of allProfiles) {
            if(!options.find(year => year['value'] === profile.school.name)) {
                options.push({
                    key: profile.school.name,
                    text: profile.school.name,
                    value: profile.school.name
                });
            }
        }
        return options;
    };
    const gradYearOptions = () => {
        let options = [];
        for (let profile of allProfiles) {
            if(!options.find(year => year['value'] === profile.gradYear)) {
                options.push({
                    key: profile.gradYear,
                    text: profile.gradYear,
                    value: profile.gradYear
                });
            }
        }
        options.sort(function(a,b){return a.value-b.value})
        return options;
    };
    const filterOptions = () => {
        let filters = [
            {
                key: 'All Fields',
                text: 'All Fields',
                value: 'all'
            },
            {
                key: 'School',
                text: 'School',
                value: 'School:'
            }
        ]
        if (props.viewing === 'ALUMNI') {
            filters.push({
                key: 'Graduation Year',
                text: 'Graduation Year',
                value: 'Grad Year:'
            })
        } else {
            filters.push({
                key: 'Grade',
                text: 'Grade',
                value: 'Grade:'
            }) 
        }
        return filters;
    }

    //Mounting
    useEffect(() => {
        if (props.viewing === 'ALUMNI') {
            makeCall({}, '/admin/allAlumni/' + props.userDetails._id, 'get')
                .then((res) => {
                    // null check to ensure server-side error does not return a non-iterable
                    if (res.alumni) {
                        setAllProfiles(res.alumni)
                    }
                })
        } else if (props.viewing === 'STUDENT') {
            makeCall({}, '/admin/allStudents/' + props.userDetails._id, 'get')
                .then((res) => {
                    if (res.students) {
                        setAllProfiles(res.students)
                    }
                })
        }
    }, [props]);

    //Setting up display post API calls
    useEffect(() => {
        completeProfile();
        constructDisplay();
    }, [allProfiles]);

    //Page change
    useEffect(() => {
        setPages(Math.ceil(filteredProfiles.length / pageSize));
        constructDisplay()
    }, [currPage, filteredProfiles]);

    //Search change
    useEffect(() => {
        if (filter === 'all') {
            setFilteredProfiles(allProfiles.filter((profile) => {
                return profile.allText.includes(search.toLowerCase());
            }));
        } else if (filter === 'School:') {
            setFilteredProfiles(allProfiles.filter((profile) => {
                return (profile.allText.includes(search.toLowerCase()) 
                    && profile.school.name.includes(secondaryFilter));
            }));
        } else if (filter === 'Grade:') {
            setFilteredProfiles(allProfiles.filter((profile) => {
                return (profile.allText.includes(search.toLowerCase()) 
                    && profile.grade === secondaryFilter);
            }));
        } else if (filter === 'Grad Year:') {
            setFilteredProfiles(allProfiles.filter((profile) => {
                return (profile.allText.includes(search.toLowerCase()) 
                    && profile.gradYear === secondaryFilter);
            }));
        }
    }, [search, secondaryFilter])

    //Filter category change
    useEffect(() => {
        if (filter === 'School:') {
            setSecondaryFilterOptions(schoolOptions)
        } else if (filter === 'Grad Year:') {
            setSecondaryFilterOptions(gradYearOptions)
        } else if (filter === 'Grade:') {
            setSecondaryFilterOptions(gradeOptions)
        }
        setSecondaryFilter('')
    }, [filter])

    /* Helper functions */
    const completeProfile = () => {
        for (let profile of allProfiles) {
            if (props.viewing === 'ALUMNI') {
                profile.allText = (
                    profile.city + ' ' + profile.country + ' '
                    + profile.jobTitleName + ' ' + profile.companyName + ' '
                    + profile.name + ' ' + profile.gradYear + ' '
                    + profile.school.name
                ).toLowerCase();
            } else if (props.viewing === 'STUDENT') {
                profile.allText = (
                    profile.name + ' ' + profile.grade + ' '
                    + profile.school.name
                ).toLowerCase();
            }
        }
        setFilteredProfiles(allProfiles)
    }

    const constructDisplay = () => {
        if (!filteredProfiles || !filteredProfiles.length) return;
        let cardArray = []
        for (let i = 0; i < pageSize; i++) {
            let profile = filteredProfiles[(currPage - 1) * pageSize + i]
            if (profile) {
                cardArray.push(profileCard(profile, props.viewing))
            }
        }
        setDisplay(cardArray)
    }

    const accessContextCheckBox = (accessContexts, userId) => {
        return (
            <List>
                <List.Item>
                    <Checkbox
                        checked={accessContexts.includes('INTRASCHOOL')}
                        label='INTRASCHOOL'
                        userId={userId}
                        onChange={handleAccessChange.bind(this)}
                    />
                </List.Item>
                <List.Item>
                    <Checkbox
                        checked={accessContexts.includes('INTERSCHOOL')}
                        label='INTERSCHOOL'
                        userId={userId}
                        onChange={handleAccessChange.bind(this)}
                    />
                </List.Item>
                <List.Item>
                    <Checkbox
                        checked={accessContexts.includes('GLOBAL')}
                        label='GLOBAL'
                        userId={userId}
                        onChange={handleAccessChange.bind(this)}
                    />
                </List.Item>
            </List>
        )
    }

    const profileCard = (profile, role) => {
        return(
            <Grid key={profile._id}>
                <Grid.Row columns={2} verticalAlign='middle'>
                    <Grid.Column width={4}>
                        <Image
                            size='small'
                            centered
                            rounded
                            src={profile.imageURL}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <Card fluid>
                            <Card.Content>
                                <Card.Header>
                                <Grid>
                                    <Grid.Row columns={2}>
                                        <Grid.Column>{profile.name}</Grid.Column>
                                        {role === 'ALUMNI' ? 
                                            (
                                                <Grid.Column textAlign='right'>
                                                    Graduated: {profile.gradYear}
                                                </Grid.Column> 
                                            ) : (
                                                <Grid.Column textAlign='right'>
                                                    Grade: {profile.grade}
                                                </Grid.Column>
                                            )
                                        }
                                    </Grid.Row>
                                </Grid>
                                </Card.Header>
                                {role === 'STUDENT' && profile.isModerator && 
                                    <Card.Meta>Moderator</Card.Meta>
                                }
                                <Card.Description>School: {profile.school.name}</Card.Description>
                            </Card.Content>
                            <Card.Content extra>
                                { profile.approved ?
                                    <Button
                                        negative
                                        dataid={profile._id}
                                        op={'toggle_approve'}
                                        onClick={handleButtonPress.bind(this)}
                                    >
                                        Suspend
                                    </Button> :
                                    <Button
                                        positive
                                        dataid={profile._id}
                                        op={'toggle_approve'}
                                        onClick={handleButtonPress.bind(this)}
                                    >
                                        Approve
                                    </Button>
                                }  
                                {role === 'ALUMNI' ? 
                                    (
                                        <Button
                                            basic
                                            primary
                                            dataid={profile._id}
                                            op={'view_feedback'}
                                            onClick={handleButtonPress.bind(this)}
                                        >
                                            Feedback
                                        </Button>
                                    ) : (
                                        <Button
                                            basic
                                            primary
                                            dataid={profile._id}
                                            op={'toggle_moderator'}
                                            onClick={handleButtonPress.bind(this)}
                                        >
                                            {profile.isModerator ? 'Demote' : 'Promote'}
                                        </Button>
                                    )
                                }
                            </Card.Content>
                            <Card.Content extra>
                                <Grid stackable>
                                    <Grid.Row>
                                        <Grid.Column width="6">Access levels granted</Grid.Column>
                                        <Grid.Column>
                                            {accessContextCheckBox(profile.accessContexts, profile.user)}
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Card.Content>
                        </Card>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }

    const handlePaginationChange = (e, { activePage }) => {
        setCurrPage(activePage)
    }

    const handleButtonPress = (e, { dataid, op }) => {
        if (op === 'toggle_approve') {
            makeCall({profileId: dataid, type: props.viewing}, 
                '/admin/toggleApprove/' + props.userDetails._id, 'patch')
                .then((res) => {
                    if (res.profiles) {
                        setAllProfiles(res.profiles)
                    }
                })
        } else if (op === 'view_feedback') {
            setProfileId(dataid)
            setFeedbackModalOpen(true)
        } else if (op === 'toggle_moderator') {
            makeCall({studentId: dataid}, '/admin/toggleModerator/' + props.userDetails._id, 'patch')
                .then((res) => {
                    if (res.students) {
                        setAllProfiles(res.students)
                    }
                })
        }
    }

    const handleAccessChange = (e, { userId, label, checked }) => {
        makeCall(
            {
                userId: userId,
                type: props.viewing,
                newAccessContext: label,
                isGranting: checked
            }, 
            '/admin/changeAccess/' + props.userDetails._id,
            'patch'
        ).then((res) => {
            if (res.profiles) {
                setAllProfiles(res.profiles)
            }
        })
    }

    const closeFeedbackModal = () => {
        setFeedbackModalOpen(false)
        setProfileId('')
    }

    /* Display Elements */
    const searchBar = (
        <Grid>
            <Grid.Row columns={'equal'}>
                <Grid.Column width={8}>
                        <Search
                            open={false}
                            showNoResults={false}
                            onSearchChange={(e, {value}) => setSearch(value)}
                            input={{fluid: true}}
                            placeholder={"Search"}
                        />
                </Grid.Column>
                <Grid.Column width={3} textAlign='left'>
                    <Dropdown
                        placeholder='Search By:'
                        floating
                        selection
                        options={filterOptions()}
                        name='filter'
                        onChange={(e, {value}) => setFilter(value)}
                    />
                </Grid.Column>
                {filter !== 'all' &&
                    <Grid.Column width={3}>
                        <Dropdown 
                            placeholder={filter}
                            options={secondaryFilterOptions}
                            selection
                            floating
                            onChange={(e, {value}) => setSecondaryFilter(value)}
                        />
                    </Grid.Column>
                }
            </Grid.Row>
        </Grid>
    )

    const resultsBar = (
        <Grid>
            <Grid.Row centered>
                Found {filteredProfiles.length} Results!
            </Grid.Row>
        </Grid>
    )

    return(
        <div>
            {feedbackModalOpen && 
                <FeedbackModal
                    modalOpen={feedbackModalOpen}
                    toggleModal={closeFeedbackModal}
                    profileId={profileId}
                    userDetails={props.userDetails._id}
                />
            }
            {searchBar}
            {(search || secondaryFilter) && resultsBar}
            {display}
            <Segment>
                <Pagination
                    activePage={currPage}
                    totalPages={pages}
                    onPageChange={handlePaginationChange}
                />
            </Segment>
        </div>
    )
}