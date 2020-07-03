import React, { Component } from 'react';
import {Button, Modal, Form} from 'semantic-ui-react';
import swal from "sweetalert";
import { makeCallWithImage } from "../apis";

const BACKEND = process.env.REACT_APP_BACKEND = "http://localhost:5000"

/*
props:
    - modalOpen: boolean
    - close: ()
    - getInput: ()
    - email
    - id
*/
export default class ImageSelectModal extends Component {
    constructor(props){
        super(props)
        this.state = {
            imageFile: null,
            loading: false
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
        const result = await makeCallWithImage({email: this.props.email, imageFile: this.state.imageFile}, '/image/add', 'post');
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
                this.props.getInput(result.imageUrl)
                this.props.close()
            }); 
        }
    }

    render() {
        return (
            <Modal
                open={this.props.modalOpen}
            >
                <Modal.Header>Upload a profile image</Modal.Header>
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
                        loading={this.state.loading}
                        disabled={!this.state.imageFile || !this.fileTypeIsImage(this.state.imageFile) || this.state.loading}
                    >
                        Upload
                    </Button>
                    <Button onClick={this.props.close}>
                        Close
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}