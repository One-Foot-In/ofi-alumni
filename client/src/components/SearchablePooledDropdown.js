import React, { Component } from 'react';
import {Dropdown, Button, Input, Icon, Label, Grid, Message } from 'semantic-ui-react';
import { makeCall } from "../apis";

/*
props:
    - endpoint 
    - isSingleSelect
    - placeholderExisting
    - placeholderCustom
    - getInputs: ()
    - dataType
*/
export default class SearchablePooledDropdown extends Component {
    constructor(props){
        super(props)
        this.state = {
            options: [],
            value: this.props.isSingleSelect ? {} : [],
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

    handleSelection(e, {value, text}) {
        e.persist()
        e.preventDefault()
        this.setState({
            value: {
                value,
                text: e.target && e.target.textContent
            }
        },() => {
            if (this.state.isSingleSelect) {
                this.props.getInputs({customValue: this.state.customValue, value: this.state.value})
            } else {
                this.props.getInputs({customValues: this.state.customValues, value: this.state.value})
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
        if (!this.props.isSingleSelect) {
            let newSelections = []
            newSelections.push(this.state.customValue)
            this.setState({
                customValue: '',
                customValues: newSelections,
            }, () => {
                this.props.getInputs({customValues: this.state.customValues, value: this.state.value})
            })
        } else {
            this.setState({
                customValues: [],
                customValue: this.state.customValue
            }, () => {
                this.props.getInputs({customValue: this.state.customValue, value: this.state.value})
            })
        }
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
                    </Grid.Row>
                        <Grid>
                            <Grid.Row
                                centered
                            >
                                <Dropdown
                                    style={{ 'margin': '5px'}}
                                    fluid
                                    placeholder={`Select ${this.props.dataType}`}
                                    multiple={!this.props.isSingleSelect}
                                    disabled={this.props.isSingleSelect && this.state.customValues && this.state.customValues.length > 0}
                                    search
                                    selection
                                    options={this.state.options}
                                    value={this.state.value}
                                    onChange={this.handleSelection}
                                />
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
                                columns={2}
                            >
                                <Grid.Column
                                    width={10}
                                >
                                    <Input
                                        label={`Add New ${this.props.dataType}`}
                                        placeholder={`Enter ${this.props.dataType} name...`}
                                        style={{'margin': '5px', 'width': '50%'}}
                                        onChange={this.handleChange}
                                        name='customValue'
                                        value={this.state.customValue}
                                        disabled={this.props.isSingleSelect && (this.state.customValues && this.state.customValues.length > 0) }
                                    />
                                </Grid.Column>
                                <Grid.Column
                                    width={6}
                                >
                                    <Button
                                        primary
                                        style={{'margin': '5px'}}
                                        color='blue'
                                        disabled={this.disableCommitButton()}
                                        onClick={this.commitSelection}
                                    >
                                        Commit {this.props.dataType}
                                    </Button>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                </Grid.Column>
            </Grid>
        )
    }
}