import React, { Component } from 'react';
import {Dropdown, Icon, Label, Grid, Segment, Button, Input } from 'semantic-ui-react';
import { makeCall } from "../apis";

/*
props:
    - endpoint 
    - getInputs: ({old: {value, text}, new: {value, text}}) // value for entries is old is mongoId
    - dataType: string
    - allowAddition: Boolean
*/
export default class PooledMultiSelectDropdown extends Component {
    constructor(props){
        super(props)
        this.state = {
            options: [],
            value: [],
            customSelections: [],
            customValue: '', // for input control
            addEntry: false,
        }
        this.removeCustomValue = this.removeCustomValue.bind(this)
        this.getEnteredCustomValues = this.getEnteredCustomValues.bind(this)
        this.handleSelection = this.handleSelection.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.commitCustomValue = this.commitCustomValue.bind(this)
        this.customValueAlreadyAdded = this.customValueAlreadyAdded.bind(this)
    }

    async componentWillMount() {
        let result = await makeCall(null, this.props.endpoint, 'get')
        this.setState({
            options: result.options,
        })
    }

    customValueAlreadyAdded() {
        let oldCustomSelections = this.state.customSelections
        let oldCustomSelectionsValues = oldCustomSelections.map(selection => selection.value).flat()
        return oldCustomSelectionsValues.includes(this.state.customValue)
    }

    commitCustomValue(e) {
        e.preventDefault()
        let oldCustomSelections = this.state.customSelections
        oldCustomSelections.push({
            value: this.state.customValue,
            text: this.state.customValue
        })
        this.setState({
            customSelections: oldCustomSelections,
            customValue: '',
            addEntry: false
        }, () => {
            this.props.getInputs({
                old: this.state.options
                    .filter(option => this.state.value.includes(option.value))
                    .map(option => {
                    return {
                        value: option.value,
                        text: option.text
                    }
                }),
                new: this.state.customSelections
            })
        })
    }

    handleChange(e) {
        e.preventDefault()
        this.setState({
            customValue: e.target.value 
        })
    }
    
    handleSelection(e, {value}) {
        e.preventDefault()
        this.setState({
            value
        }, () => {
            this.props.getInputs({
                old: this.state.options
                    .filter(option => this.state.value.includes(option.value))
                    .map(option => {
                    return {
                        value: option.value,
                        text: option.text
                    }
                }),
                new: this.state.customSelections
            })
        })
    }

    removeCustomValue(e, toRemove) {
        e.preventDefault()
        this.setState({
            customSelections: this.state.customSelections.filter( selection => selection.value !== toRemove)
        }, () => {
            this.props.getInputs({
                old: this.state.options
                        .filter(option => this.state.value.includes(option.value))
                        .map(option => {
                        return {
                            value: option.value,
                            text: option.text
                        }
                    }),
                new: this.state.customSelections
            })
        })
    }

    getEnteredCustomValues() {
        return (
            this.state.customSelections && this.state.customSelections.length ?
            <Segment>
                <Label color='blue' ribbon>
                    Your entries for {this.props.dataType}s
                </Label>
                {
                    this.state.customSelections.map(selection => {
                        return (
                            <Label
                                key={selection.value}
                                style={{'margin': '2px'}}
                            >
                                {selection.value}
                                <Icon
                                    onClick={(e) => this.removeCustomValue(e, selection.value)}
                                    name='delete'
                                />
                            </Label>
                        )
                    })
                }
            </Segment> :
            null
        )
    }

    render() {
        return (
            <Grid>
                {
                    this.state.customSelections && this.state.customSelections.length ? 
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
                    <Dropdown
                        style={{'margin':'5px'}}
                        disabled={this.state.addEntry}
                        placeholder={`Search for ${this.props.dataType}`}
                        fluid
                        multiple
                        search
                        selection
                        options={this.state.options}
                        value={this.state.value}
                        onChange={this.handleSelection}
                    />
                </Grid.Row>
                {
                    this.props.allowAddition ?
                        this.state.addEntry ?
                        <Grid.Row centered columns={2}>
                            <Grid.Column centered width={12}>
                                <Input
                                    placeholder={`Add if option not available!`}
                                    fluid
                                    label={`Add new ${this.props.dataType}`} 
                                    name='customValue'
                                    onChange={this.handleChange}
                                    value={this.state.customValue}
                                />
                            </Grid.Column>
                            <Grid.Column centered width={4}>
                                {
                                    this.state.customValue ?
                                    <Button
                                        primary
                                        color="blue"
                                        onClick={this.commitCustomValue}
                                        disabled={this.customValueAlreadyAdded() || !this.state.customValue}
                                    >
                                        Commit {this.props.dataType}
                                    </Button>
                                    : 
                                    <Button
                                        primary
                                        color="blue"
                                        onClick={() =>{this.setState({addEntry: false})}}
                                    >
                                        Cancel
                                    </Button>
                                }

                            </Grid.Column>
                        </Grid.Row>
                        :
                        <Grid.Row centered>
                            <Button
                                primary
                                color="blue"
                                onClick={() =>{this.setState({addEntry: true})}}
                            >
                                {this.state.customSelections.length ? `Add another ${this.props.dataType}` : `Add your own ${this.props.dataType}` }
                            </Button>
                        </Grid.Row>
                    :
                    null
                }
            </Grid>
        )
    }
}