import React, { Component } from 'react';
import {Button, Modal, Form} from 'semantic-ui-react';
import swal from "sweetalert";

const BACKEND = process.env.REACT_APP_BACKEND = "http://localhost:5000"

/*
props:
    - modalOpen: boolean
    - closeModal: ()
    - isAlumni: boolean
    - id
*/
export default class ImageUpdateModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            submitting: false,
            imageFile: null
        }
        this.selectFile = this.selectFile.bind(this)
        this.submit = this.submit.bind(this)
        this.fileTypeIsImage = this.fileTypeIsImage.bind(this)
    }

    fileTypeIsImage (file) {
        return file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')
    }

    selectFile(e) {
        e.preventDefault();
        let file = e.target.files[0]
        if (this.fileTypeIsImage(file)) {
            this.setState({
                imageFile: e.target.files[0]
            })
        } else {
            swal({
                title: "Whoops!",
                text: "Please select a jpeg, jpg, or a png file",
                icon: "warning",
            });
        }
    }

    submit(e) {
        e.preventDefault()
        this.setState({
            submitting: true
        }, async () => {
            try {
                let data = new FormData();
                data.append('imageFile', this.state.imageFile);
                fetch(`${BACKEND}/image/${this.props.isAlumni?`alumni` : `student`}/${this.props.id}`, {
                    method: 'POST',
                    body: data
                }).then(
                    response => response.json()
                ).then(parsedReponse => {
                    if (parsedReponse.success) {
                        swal({
                            title: "Success!",
                            text: "Successfully updated photo!",
                            icon: "success",
                        }).then(() => {
                            this.props.closeModal()
                        });
                    } else {
                        swal({
                            title: "Whoops!",
                            text: "There was an error updating profile image, please try again.",
                            icon: "error",
                        });
                    }
                })
            } catch (e) {
                this.setState({
                    submitting: false
                }, () => {
                    console.log("Error: ImageUpdateModal#submit", e);
                })
            }
        })
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Upload your new profile image</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <label>Choose profile photo</label>
                            <input type="file" onChange={this.selectFile} class="ui huge yellow center floated button"/>
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        onClick={this.submit}
                        disabled={!this.state.imageFile || !this.fileTypeIsImage(this.state.imageFile)}
                    >
                        Upload
                    </Button>
                    <Button onClick={this.props.closeModal}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}