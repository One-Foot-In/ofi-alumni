import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Dropdown } from 'semantic-ui-react'
import swal from 'sweetalert'
import { makeCall } from '../../apis';

/**
 * Allows an admin or a country ambassador to add a school or a college
 * @param {*} props:
 * country: the country is specified for a country ambassador, null for regular admin
 * type: SCHOOL | COLLEGE
 * userId: alumni Id of the admin
 */
export default function NewInstitutionModal(props) {
    const [name, setName] = useState('')
    const [countries, setCountries] = useState([])
    const [country, setCountry] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState({})

    useEffect(() => {
        if (!countries.length) {
            makeCall({}, '/drop/countries/', 'get')
            .then((res) => {
                setCountries(res.options)
                setCountry('')
                setName('')
                setLoading(false)
            })
        }
        if (props.country) {
            setCountry(props.country)    
        }
    }, [props]);

    useEffect(() => {
        if (!loading && (!result || result.error)) {
            swal({
                title: "Error!",
                text: `Something went wrong, please try uploading again!`,
                icon: "error",
            });
        } else if (!loading && result) {
            props.toggleModal()
        }
    }, [loading]);

    useEffect(() => {
        setLoading(false);
    }, [result])

    const urlBuilder = (path) => {
        let prepend = ''
        let identifierParams = ''
        if (props.country) {
            prepend = 'ambassador'
            identifierParams = `${props.userId}/${props.country}`
        } else {
            prepend = 'admin'
            identifierParams = props.userId
        }
        return `/${prepend}/${path}/${identifierParams}`
    }

    const handleClick = () => {
        setLoading(true)
        if (props.type === "SCHOOL") {
            makeCall({name: name, country: country},
                urlBuilder('addSchool'), 'post').then((res) => {
                    setResult(res)
                })
        } else if (props.type === "COLLEGE") {
            makeCall({name: name, country: country},
                '/admin/addCollege/' + props.userId, 'post').then((res) => {
                    setResult(res)
                })
        }
    }

    return(
        <Modal open={props.modalOpen} onClose={props.toggleModal} closeIcon>
            <Modal.Header>Add a New {props.type === "SCHOOL" ? "School" : "College"} {props.country ? `for ${props.country}` : ``}</Modal.Header>
            <Modal.Content>
                {
                    props.country ? 
                    null :
                    <>
                        <h3>Country:</h3>
                        <Dropdown
                            fluid
                            selection
                            options={countries}
                            placeholder={'Select Country'}
                            onChange={(e, {value}) => setCountry(value)}
                        />
                    </>
                }
                <h3>{props.type === "SCHOOL" ? "School" : "College"} Name:</h3>
                <Input 
                    fluid 
                    value={name} 
                    onChange={(e, { value }) => setName(value)}
                    placeholder={'Enter the name of the school'}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button disabled={!name || !country} primary onClick={handleClick.bind(this)} loading={loading}>
                    Add {props.type === "SCHOOL" ? "School" : "College"}
                </Button>
                <Button onClick={props.toggleModal}>Close</Button>
            </Modal.Actions>
        </Modal>
    )
}