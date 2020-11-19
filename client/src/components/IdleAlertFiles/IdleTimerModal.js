import React, {Component} from 'react';
//import Modal from 'react-bootstrap/Modal';
//import Button from 'react-bootstrap/Button';
import {Button, Modal, Header} from 'semantic-ui-react';

const IdleTimeModal = ({showModal, handleClose, logout, remainingTime}) => {
    return (
        <>
        <Modal show={showModal} onHide={handleClose}>
            <p>second test</p>
            <Header as="h2" content='You Have Been Idle' subheader="You have been idle for too long. Do you wish to stay"/>
            <Modal.Actions>
                <Button.Group>
                    <Button variant="danger" onClick={logout}>
                        Logout
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Stay
                    </Button>
                </Button.Group>
            </Modal.Actions>
        </Modal> 
        {/*<Modal show={showModal} onHide={handleClose}>
            <Modal.Body>You Will Get Timed Out. Do You Wish to Stay</Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={logout}>
                    Logout
                </Button>
                <Button variant="primary" onClick={handleClose}>
                    Stay
                </Button>
            </Modal.Footer>
    </Modal> */}
        </>
        
    )
}

export default IdleTimeModal