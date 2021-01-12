import React, { useState, useEffect } from "react";
import { Message, Segment, Pagination, Card, Button, Label, Icon } from "semantic-ui-react";
import { makeCall } from "../apis";

const pageSize = 6;

/*
    studentId
*/
export default function StudentOpportunities(props) {
    const [opportunities, setOpportunities] = useState([])
    const [pages, setPages] = useState(0)
    const [currPage, setCurrPage] = useState(1)
    const [existingOpportunitiesDisplay, setExistingOpportunitiesDisplay] = useState([])
    const [sendingRequest, setSendingRequest] = useState(false)
    
    const fetchOpportunities = () => {
        return makeCall({}, `/student/bookmarkedOpportunities/${props.studentId}`, 'get')
            .then(opportunitiesResponse => {
                if (opportunitiesResponse && opportunitiesResponse.opportunities) {
                    setOpportunities(opportunitiesResponse.opportunities)
                    setSendingRequest(false)
                } else {
                    // TODO: error
                    setSendingRequest(false)
                }
            })
    }

    // Mounting
    useEffect(() => {
        setSendingRequest(true)
        fetchOpportunities()
    }, [props])

    //Page change
    useEffect(() => {
        setPages(Math.ceil(opportunities.length / pageSize));
        constructDisplay()
    }, [currPage, opportunities]);

    const handlePaginationChange = (e, { activePage }) => {
        setCurrPage(activePage)
    }

    const constructDisplay = () => {
        if (opportunities && opportunities.length) {
            let cardArray = []
            for (let i = 0; i < pageSize; i++) {
                let opportunity = opportunities[(currPage - 1) * pageSize + i]
                if (opportunity) { 
                    cardArray.push(createOpportunityCard(opportunity))
                }
            }
            setExistingOpportunitiesDisplay(cardArray)
        }
    }

    const unbookmarkOpportunity = (e, {oppId}) => {
        setSendingRequest(true)
        makeCall(
            {},
            `/student/unbookmarkOpportunity/${props.studentId}/${oppId}`,
            'patch')
            .then(res => {
                if (res && res.error) {
                    // TODO: error
                    setSendingRequest(false)
                } else {
                    fetchOpportunities()
                }
            })
    }

    const createOpportunityCard = (opportunity) => {
        return (
            <Card
                centered
            >
                <Card.Content>
                    <Card.Description
                    >
                        {opportunity.description}
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    {
                        opportunity.link && 
                        <Button
                            style={{
                                margin: '5px'
                            }}
                            color='blue' 
                            tiny
                            onClick={ () => {window.open(opportunity.link, '_blank')}}
                        >
                            Link to opportunity
                        </Button>
                    }
                    {
                        opportunity.interests.length ? 
                        getInterestsForExistingOpportunities(opportunity.interests)
                        : null
                    }
                    <Icon
                        circular
                        color='red'
                        name='remove'
                        oppId={opportunity._id}
                        onClick={unbookmarkOpportunity.bind(this)}
                    />
                </Card.Content>
            </Card>
        )
    }

    const getInterestsForExistingOpportunities = (allInterests) => {
        return (
            <div
                style={{
                    margin: '5px'
                }}
            >
            {
                allInterests.map(interest => {
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
            </div>
        )
    }

    return (
        <Segment
            textAlign="center"
            loading={sendingRequest}
        >
            {
                opportunities.length ? 
                    existingOpportunitiesDisplay
                 :
                <Message info>
                    <Message.Header>
                        You have no bookmarked alumni-curated opportunities. Keep an eye on your Home page for opportunities 
                    </Message.Header>
                    <Message.Content>
                        Keep an eye on your home page for opportunities alumni list that are relevant to you! These may be scholarships, exchange programs, internships, or any other experience that our mentors feel springboarded them!
                    </Message.Content>
                </Message>
            }
            {
                opportunities.length ? 
                <Pagination
                    activePage={currPage}
                    totalPages={pages}
                    onPageChange={handlePaginationChange}
                />
                 :
                null
            }

        </Segment>
    )
}