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
            imageFile: null,
            imageSize: false, 
        }
        this.selectFile = this.selectFile.bind(this)
        this.submit = this.submit.bind(this)
        this.fileTypeIsImage = this.fileTypeIsImage.bind(this)
        this.checkFileSizeLimit = this.checkFileSizeLimit.bind(this)
    }

    fileTypeIsImage (file) {
        return file && (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png')
    }

    checkFileSizeLimit(file) {
        return file.size > FILE_SIZE_LIMIT;
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
            return;
        }
        if (this.checkFileSizeLimit(file)) {
            this.setState({
                imageSize: true
            })
        } else {
            swal({
                title: "Whoops!",
                text: "Please select photo whose file size is less than 5MB",
                icon: "warning",
            });
            return;
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
                        disabled={!this.state.imageFile || !this.fileTypeIsImage(this.state.imageFile) || (this.state.imageSize === false)}
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