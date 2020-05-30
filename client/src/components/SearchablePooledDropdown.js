import React, { Component } from 'react';
import {Dropdown, Segment, Button, Input, Icon, Label, Grid, Message, Header} from 'semantic-ui-react';
import { makeCall } from "../apis";

/*
props:
    - endpoint 
    - isSingleSelect
    - placeholder
    - textForCustomEntry
    - getInputs: ()
    - learnNewInputValues
    - title
*/
export default class SearchablePooledDropdown extends Component {
    constructor(props){
        super(props)
        this.state = {
            options: [],
            value: this.props.isSingleSelect ? null : [],
            customValue: '',
            customValues: [] // used when !isSingleSelect
        }
        this.handleSelection = this.handleSelection.bind(this)
        this.removeCustomValue = this.removeCustomValue.bind(this)
        this.getEnteredCustomValues = this.getEnteredCustomValues.bind(this)
        this.commitSelection = this.commitSelection.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.disableCommitButton = this.disableCommitButton.bind(this)
    }

    async componentWillMount() {
        let result = await makeCall(null, this.props.endpoint, 'get')
        this.setState({
            options: result.options
        })
    }

    handleSelection(e, {value}) {
        e.preventDefault()
        this.setState({
            value
        },() => {
            if (this.props.isSingleSelect) {
                this.props.getInputs(this.state.customValue)
            } else {
                if (this.props.learnNewInputValues) {
                    this.props.getInputs({customValues: this.state.customValues, values: this.state.value})
                } else {
                    this.props.getInputs([...this.state.customValues, ...this.state.value])
                }
            }
        })
    }

    handleChange(e) {
        e.preventDefault();
        let change = {}
        change[e.target.name] = e.target.value
        this.setState(change)
    }

    commitSelection(e) {
        e.preventDefault()
        let newSelections = []
        if (!this.props.isSingleSelect) {
            newSelections = this.state.customValues
        } else {
            this.setState({
                value: null
            })
        }
        newSelections.push(this.state.customValue)
        this.setState({
            customValues: newSelections,
            customValue: ''
        }, () => {
            if (this.props.isSingleSelect) {
                this.props.getInputs(this.state.customValue)
            } else {
                if (this.props.learnNewInputValues) {
                    this.props.getInputs({customValues: this.state.customValues, values: this.state.value})
                } else {
                    this.props.getInputs([...this.state.customValues, ...this.state.value])
                }
            }
        })
    }

    removeCustomValue(e, toRemove) {
        e.preventDefault()
        this.setState({
            customValues: this.state.customValues.filter(value => value !== toRemove)
        })
    }

    getEnteredCustomValues() {
        return this.state.customValues && this.state.customValues.map(value => {
            return (
            <Label
                key={value}
                style={{'margin': '2px'}}
            >
                {value}
                <Icon
                    onClick={(e) => this.removeCustomValue(e, value)}
                    name='delete'
                />
            </Label>
            )
        })
    }

    disableCommitButton() {
        if (this.props.isSingleSelect) {
            return (this.state.customValues.includes(this.state.customValue) || !this.state.customValue || (this.state.customValues && this.state.customValues.length > 0))
        } else {
            return (this.state.customValues.includes(this.state.customValue) || !this.state.customValue)
        }
    }

    render() {
        return (
            <Grid>
                <Grid.Column>
                    <Grid.Row
                        centered
                    >
                        <Header>{this.props.title || 'Title here'}</Header>
                    </Grid.Row>
                        <Grid>
                            <Grid.Row
                                centered
                            >
                                <Dropdown
                                    style={{ 'margin': '5px', 'width': '80%'}}
                                    placeholder={this.props.placeholder}
                                    fluid
                                    multiple={!this.props.isSingleSelect}
                                    disabled={this.props.isSingleSelect && this.state.customValues && this.state.customValues.length > 0}
                                    search
                                    selection
                                    options={this.state.options}
                                    value={this.state.value}
                                    onChange={this.handleSelection}
                                />
                            </Grid.Row>
                            <Grid.Row
                                centered
                            >
                                <Message
                                    style={{'width': '80%', 'margin': '5px'}}
                                > 
                                    Your custom inputs (Please add only if there isn't an existing option)
                                </Message>
                            </Grid.Row>
                            {
                                this.state.customValues && this.state.customValues.length ? 
                                <Grid.Row
                                    centered
                                >
                                    {this.getEnteredCustomValues()}
                                </Grid.Row> :
                                null
                            }
                            <Grid.Row
                                centered
                            >
                                <Input
                                    placeholder={'Custom input here...'}
                                    style={{'margin': '5px', 'width': '50%'}}
                                    onChange={this.handleChange}
                                    name='customValue'
                                    value={this.state.customValue}
                                    disabled={this.props.isSingleSelect && (this.state.customValues && this.state.customValues.length > 0) }
                                />
                                <Button
                                    primary
                                    style={{'margin': '5px'}}
                                    color='blue'
                                    disabled={this.disableCommitButton()}
                                    onClick={this.commitSelection}
                                >
                                    Commit Entry
                                </Button>
                            </Grid.Row>
                        </Grid>
                </Grid.Column>
            </Grid>
        )
    }
}