import React, { Component } from 'react';
import {Button, Modal, Form} from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCallWithImage } from "../../apis";

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

    async submit(e) {
        e.preventDefault()
        this.setState({loading: true})
        const result = await makeCallWithImage({schoolId: this.props.id, adminId: this.props.userId, imageFile: this.state.imageFile}, '/image/school', 'post');
        if (!result || result.error) {
            this.setState({
                loading: false
            }, () => {
                swal({
                    title: "Error!",
                    text: `Something went wrong, please try uploading again!`,
                    icon: "error",
                });
            });
        } else {
            this.setState({
                loading: false
            }, () => {
                this.props.closeModal()
            }); 
        }
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Upload a new logo for {this.props.school}</Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <label>Choose logo</label>
                            <input type="file" onChange={this.selectFile} className="ui huge yellow center floated button"/>
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        onClick={this.submit}
                        loading={this.state.loading}
                        disabled={!this.state.imageFile || !this.fileTypeIsImage(this.state.imageFile) || this.state.loading}
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