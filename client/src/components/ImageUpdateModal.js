import React, { Component } from 'react';
import {Button, Modal, Form} from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCallWithImage } from "../apis";

const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
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
        this.fileSizeIsWithinBound = this.fileSizeIsWithinBound.bind(this)
    }

    fileTypeIsImage (file) {
        return file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')
    }

    fileSizeIsWithinBound (file) {
        return file && file.size < FILE_SIZE_LIMIT
    }

    selectFile(e) {
        e.preventDefault();
        let file = e.target.files[0]
        if (this.fileTypeIsImage(file) && this.fileSizeIsWithinBound(file)) {
            this.setState({
                imageFile: e.target.files[0]
            })
        } else if (!this.fileTypeIsImage(file)) {
            swal({
                title: "Whoops!",
                text: "Please select a jpeg, jpg, or a png file",
                icon: "warning",
            });
        } else if (!this.fileSizeIsWithinBound(file)) {
            swal({
                title: "Whoops!",
                text: "Please select an image under 8 MB",
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
                const result = await makeCallWithImage({imageFile: this.state.imageFile}, `/image/${this.props.isAlumni?`alumni` : `student`}/${this.props.id}`, 'post');
                if (!result || result.error) {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Error!",
                            text: `Something went wrong, please try uploading again!`,
                            icon: "error",
                        });
                    });
                } else {
                    this.setState({
                        submitting: false
                    }, () => {
                        swal({
                            title: "Success!",
                            text: "Successfully updated photo!",
                            icon: "success",
                        }).then(() => {
                            this.props.closeModal()
                        });
                    });
                }
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
                        loading={this.state.submitting}
                        disabled={!this.state.imageFile || !this.fileTypeIsImage(this.state.imageFile) || this.state.submitting}
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