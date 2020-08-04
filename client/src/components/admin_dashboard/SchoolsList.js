import React, { useState, useEffect } from 'react';
import { Card, Image, Search, Pagination, Grid, Segment, Button, Dropdown } from 'semantic-ui-react'
import SchoolImageModal from './SchoolImageModal';
import NewSchoolModal from './NewSchoolModal';
import { makeCall } from '../../apis';

export default function SchoolsList(props) {
    const [allSchools, setAllSchools] = useState([])
    const [filteredSchools, setFilteredSchools] = useState([])
    const [display, setDisplay] = useState([])
    const [pages, setPages] = useState(0)
    const [currPage, setCurrPage] = useState(1)
    const [search, setSearch] = useState('')
    const [newSchoolModalOpen, setNewSchoolModalOpen] = useState(false)
    const [imageModalOpen, setImageModalOpen] = useState(false)
    const [currSchoolId, setCurrSchoolId] = useState('')
    const [currSchoolName, setCurrSchoolName] = useState('')

    const pageSize = 4;

    //Mounting
    useEffect(() => {
        if(!newSchoolModalOpen) {
            makeCall({}, '/admin/allSchools/' + props.userDetails._id, 'get')
                .then((res) => {
                    setAllSchools(res.schools)
                })
        }
    }, [props, newSchoolModalOpen]);

    //Setting up display post API calls
    useEffect(() => {
        completeSchools()
    }, [allSchools]);

    //Page change
    useEffect(() => {
        setPages(Math.ceil(filteredSchools.length / pageSize));
        constructDisplay()
    }, [currPage, filteredSchools]);

    //Search
    useEffect(() => {
        setFilteredSchools(allSchools.filter((school) => {
            return school.allText.includes(search.toLowerCase());
        }));
    }, [search])

    const completeSchools = () => {
        for (let school of allSchools) {
            school.allText = (school.name + ' ' + school.country).toLowerCase()
        }
        let sortedSchools = allSchools.sort((a,b) => {
            if(a.country < b.country) { return -1; }
            if(a.country > b.country) { return 1; }
            return 0;
        })
        setFilteredSchools(sortedSchools)
    }

    const constructDisplay = () => {
        if (!filteredSchools || !filteredSchools.length) return;
        let cardArray = []
        for (let i = 0; i < pageSize; i++) {
            let school = filteredSchools[(currPage - 1) * pageSize + i]
            if (school) { 
                cardArray.push(schoolCard(school))
            }
        }
        setDisplay(cardArray)
    }

    const schoolCard = (school) => {
        return(
            <Grid key={school._id}>
                <Grid.Row columns={2} verticalAlign='middle'>
                    <Grid.Column width={4}>
                        <Image
                            size='small'
                            centered
                            rounded
                            src={school.logoURL}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <Card fluid>
                            <Card.Content>
                                <Card.Header>
                                    {school.name}
                                </Card.Header>
                                <Card.Description>Location: {school.country}</Card.Description>
                            </Card.Content>
                            <Card.Content extra>
                                <Button
                                    primary
                                    onClick={handleImageModalOpen}
                                    schoolid={school._id}
                                    name={school.name}
                                >
                                    Add/Change Image
                                </Button>
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

    const handleImageModalOpen = (e, {schoolid, name}) => {
        setCurrSchoolId(schoolid)
        setCurrSchoolName(name)
        setImageModalOpen(true)
    }

    /* Display Elements */
    const searchBar = (
        <Grid centered>
            <Grid.Row columns={'equal'}>
                <Grid.Column>
                        <Search
                            open={false}
                            showNoResults={false}
                            onSearchChange={(e, {value}) => setSearch(value)}
                            input={{fluid: true}}
                            placeholder={"Search"}
                        />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )

    const resultsBar = (
        <Grid>
            <Grid.Row centered>
                Found {filteredSchools.length} Results!
            </Grid.Row>
        </Grid>
    )

    return(
        <div>
            <SchoolImageModal 
                    id={currSchoolId}
                    school={currSchoolName}
                    userId={props.userDetails._id}
                    modalOpen={imageModalOpen}
                    closeModal={() => setImageModalOpen(!setImageModalOpen)}
            />

            <NewSchoolModal 
                type={"SCHOOL"}
                modalOpen={newSchoolModalOpen}
                toggleModal={() => setNewSchoolModalOpen(false)}
                userId={props.userDetails._id}
            />
            {searchBar}
            {search && resultsBar}
            <br/>
            <Button
                primary
                onClick={() => setNewSchoolModalOpen(true)}
                fluid
            >
                Add New School
            </Button>
            <br/>
            {display}
            <Segment textAlign='center'>
                <Pagination
                    activePage={currPage}
                    totalPages={pages}
                    onPageChange={handlePaginationChange}
                />
            </Segment>
        </div>
    )
}