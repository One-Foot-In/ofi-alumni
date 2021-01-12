import React, { useState, useEffect } from "react";
import { Message, Segment, Pagination, Card, Form, Button, TextArea, Label, Icon, Input } from "semantic-ui-react";
import { makeCall } from "../apis";
import AddInterestsModal from './AddInterestsModal'

const pageSize = 6;

/*
    alumniId
*/
export default function AlumniOpportunities(props) {
    const [opportunities, setOpportunities] = useState([])
    const [pages, setPages] = useState(0)
    const [currPage, setCurrPage] = useState(1)
    const [desc, setDesc] = useState("")
    const [link, setLink] = useState("")
    const [interestsModalOpen, setInterestsModalOpen] = useState(false)
    const [existingOpportunitiesDisplay, setExistingOpportunitiesDisplay] = useState([])
    const [newInterests, setNewInterests] = useState([])
    const [existingInterests, setExistingInterests] = useState([])
    const [sendingRequest, setSendingRequest] = useState(false)
    
    const fetchOpportunities = () => {
        return makeCall({}, `/alumni/opportunities/${props.alumniId}`, 'get')
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

    const deleteOpportunity = (e, {oppId}) => {
        setSendingRequest(true)
        makeCall(
            {},
            `/alumni/opportunity/${props.alumniId}/${oppId}`,
            'delete')
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
                    {
                        opportunity.timesBookmarked ? 
                        <Label
                            style={{ marginRight: '5px'}}
                        >
                            <Icon 
                                color="yellow"
                                name='star'
                            /> {opportunity.timesBookmarked}
                      </Label>
                      : null
                    }
                    <Icon
                        circular
                        color='red'
                        name='trash alternate'
                        oppId={opportunity._id}
                        onClick={deleteOpportunity.bind(this)}
                    />
                </Card.Content>
            </Card>
        )
    }

    const handleDescChange = (e, {value}) => {
        setDesc(value)
    }

    const handleLinkChange = (e, {value}) => {
        setLink(value)
    }

    const newOppIsSubmitReady = () => {
        return (existingInterests.length || newInterests.length) && desc
    }

    const handleInterestsModal = () => {
        setInterestsModalOpen(!interestsModalOpen)
    }

    const getInterestsInput = (existingInterests, newInterests) => {
        setNewInterests(existingInterests)
        setExistingInterests(newInterests)
    }

    const removeInterest = (e, interestMarker) => {
        e.preventDefault()
        setExistingInterests(existingInterests.filter(interest => interest.value !== interestMarker))
        setNewInterests(newInterests.filter(interest => interest.value !== interestMarker))
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

    const getInterestsForDisplay = () => {
        let allInterests = [...existingInterests, ...newInterests]
        return (
            <>
            {
                allInterests.map(interest => {
                    return (
                        <Label
                            key={interest.value}
                            style={{
                                'margin': '3px'
                            }}
                            color='teal'
                        >
                            {interest.text}
                            {
                                <Icon
                                    onClick={(e) => removeInterest(e, interest.value)}
                                    name='delete'
                                />
                            }
                        </Label>
                    )
                })
            }
            <Button
                primary
                color="blue"
                type="button"
                size="mini"
                onClick={() => {setInterestsModalOpen(true)}}
            >
                {allInterests.length ? `Add more Interests` : `Add Interests`}
                <Icon
                    name="add"
                    style={{
                        'margin': '3px'
                    }}
                />
            </Button>
            </>
        )
    }

    const submitOpportunity = () => {
        setSendingRequest(true)
        makeCall(
            {
                newInterests: newInterests,
                existingInterests: existingInterests,
                description: desc,
                link: link
            },
            `/alumni/opportunity/${props.alumniId}`,
            'post')
            .then(res => {
                if (res && res.error) {
                    // TODO: error
                    setSendingRequest(false)
                } else {
                    fetchOpportunities()
                    setNewInterests([])
                    setExistingInterests([])
                    setDesc("")
                    setLink("")
                }
            })
    }

    const inputOpportunityFormCard = () => {
        return (
            <Card
                centered
            >
                <Form
                    style={{
                        margin: '5px'
                    }}
                >
                    <Form.Field
                        required
                    >
                        <label>Description</label>
                        <TextArea
                            placeholder='Describe the opportunity, requirements, how this has benefitted you, etc...'
                            onChange={handleDescChange.bind(this)}
                            value={desc}
                        />
                    </Form.Field>
                    <Form.Field
                        required
                    >
                        <label>Tag Interests</label>
                        <>
                            {getInterestsForDisplay()}
                        </>
                    </Form.Field>
                    <Form.Field>
                        <label>Link to opportunity's webpage</label>
                        <Input 
                            placeholder="https://www.institution.com/your_wonderful_opportunity"
                            name='link'
                            onChange={handleLinkChange.bind(this)}
                            value={link}
                        />
                    </Form.Field>
                    <Button
                        type='submit'
                        primary
                        onClick={submitOpportunity.bind(this)}
                        disabled={!newOppIsSubmitReady()}
                    >
                        Add New Opportunity
                    </Button>
                </Form>
            </Card>
        )
    }

    return (
        <Segment
            textAlign="center"
            loading={sendingRequest}
        >
            {
                existingOpportunitiesDisplay.length ? 
                    existingOpportunitiesDisplay
                 :
                <Message info>
                    <Message.Header>
                        Describe an opportunity that may benefit students! 
                    </Message.Header>
                    <Message.Content>
                        These may be scholarships, study-abroad programs, competitions, internships, or any experience that you know of, or has personally benefitted you.
                    </Message.Content>
                </Message>
            }
            {inputOpportunityFormCard()}
            <AddInterestsModal
                getInput={getInterestsInput.bind(this)}
                modalOpen={interestsModalOpen}
                closeModal={handleInterestsModal.bind(this)}
                title={'Tag interests relevant to this opportunity'}
            />
            {
                existingOpportunitiesDisplay.length ? 
                <Pagination
                    activePage={currPage}
                    totalPages={pages}
                    onPageChange={handlePaginationChange}
                />
                : null
            }
        </Segment>
    )
}