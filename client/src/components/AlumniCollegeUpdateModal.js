import  React, {Component} from 'react';
import {Modal, Step, Button} from 'semantic-ui-react';


export default class AlumniCollegeUpdateModal extends Component{
    render(){
        return(
            <Modal open={this.props.modalOpen}>
                <Modal.Header>Updated your College Acceptance</Modal.Header>
                <Modal.Content>
                    <Step.Group>
                        <Step.Title>
                            Select the colleges you were accepted into
                        </Step.Title>
                        <Step.Description>
                        (Only add new entries if they don't exist in dropdown!)
                        </Step.Description>
                    </Step.Group>
                </Modal.Content>
                <Modal.Actions>
                    <Button>
                        Submit
                    </Button>
                    <Button>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}