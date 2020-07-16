import React, { useState } from 'react';
import { Modal, Input, List, Button } from 'semantic-ui-react'
import { makeCall } from '../../apis';

export default function MergeModal(props) {
    const [name, setName] = useState('')

    const constructDisplay = () => {
        let display = [];
        for (const value of Object.values(props.selectedItems)) {
            display.push(<List.Item key={value.name}>{value.name}</List.Item>);
        }
        return display;
    }

    const handleClick = () => {
        if (props.viewing === 'COLLEGES')
            makeCall(
                {
                    items: Object.keys(props.selectedItems),
                    name: name
                }, '/admin/mergeColleges/' + props.userDetails, 'patch'
            ).then(() => {
                props.toggleModal()
            })
    }

    return(
        <Modal open={props.modalOpen} onClose={props.toggleModal} closeIcon>
            <Modal.Header>Merge Selected Options:</Modal.Header>
            <Modal.Content>
                <List bulleted divided>
                    {constructDisplay(props.selectedItems)}
                </List>
                <Input 
                    fluid 
                    value={name} 
                    onChange={(e, { value }) => setName(value)}
                    placeholder={'Enter a new name for the items selected...'}
                />
            </Modal.Content>
            <Modal.Actions>
                <Button disabled={!name} primary onClick={handleClick.bind(this)}>
                    Submit Changes
                </Button>
            </Modal.Actions>
        </Modal>
    )
}