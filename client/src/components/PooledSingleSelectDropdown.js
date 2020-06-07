import React, { Component } from 'react';
import {Dropdown, Icon, Label, Grid, Segment, Input, Button } from 'semantic-ui-react';
import { makeCall } from "../apis";

/*
props:
    - endpoint 
    - getInput: (selection: String | {}, isNew: Boolean)
    - dataType
    - allowAddition: Boolean
*/
export default class PooledSingleSelectDropdown extends Component {
    constructor(props){
        super(props)
        this.state = {
            options: [],
            value: null,
            customValue: '', // for input control
            customSelection: null,
            addEntry: false
        }
        this.removeCustomValue = this.removeCustomValue.bind(this)
        this.getEnteredCustomValue = this.getEnteredCustomValue.bind(this)
        this.handleSelection = this.handleSelection.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.commitCustomValue = this.commitCustomValue.bind(this)
    }

    async componentWillMount() {
        let result = await makeCall(null, this.props.endpoint, 'get')
        this.setState({
            options: result.options,
        })
    }

    commitCustomValue(e) {
        e.preventDefault()
        this.setState({
            customSelection: {
                value: this.state.customValue,
                text: this.state.customValue
            },
            customValue: '',
            value: null,
            addEntry: false
        }, () => {
            this.props.getInput(this.state.customSelection, true)
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
            this.props.getInput(
                this.state.options
                    .filter(option => this.state.value === option.value)
                    .map(option => {
                        return {
                            value: option.value,
                            text: option.text
                        }
                    }
                )[0],
                false
            ) 
        })
    }

    removeCustomValue(e) {
        e.preventDefault()
        this.setState({
            customSelection: null
        }, () => {
            this.props.getInput({
                value: '',
                text: ''
            }, true)
        })
    }

    getEnteredCustomValue() {
        return (
            this.state.customSelection ?
            <Segment>
                <Label color='blue' ribbon>
                    Your entry for {this.props.dataType}
                </Label>
                {
                    <Label
                        key={this.state.customSelection.value}
                        style={{'margin': '2px'}}
                    >
                        {this.state.customSelection.value}
                        <Icon
                            onClick={this.removeCustomValue}
                            name='delete'
                        />
                    </Label>
                }
            </Segment> :
            null
        )
    }

    render() {
        return (
            <Grid>
                    {
                        this.state.customSelection ? 
                        <Grid.Row
                            centered
                        >
                            {this.getEnteredCustomValue()}
                        </Grid.Row>
                        :
                    <>
                    <Grid.Row centered>
                        <Dropdown
                            style={{'margin':'5px'}}
                            placeholder={`Search for ${this.props.dataType}`}
                            search
                            fluid
                            selection
                            options={this.state.options}
                            value={this.state.value}
                            disabled={this.state.customSelection}
                            onChange={this.handleSelection}
                            clearable
                        />
                    </Grid.Row>
                    {
                        this.props.allowAddition ?
                            this.state.addEntry ?
                            <Grid.Row centered columns={2}>
                                <Grid.Column centered width={12}>
                                    <Input
                                        disabled={this.state.value}
                                        placeholder={`Add if option not available!`}
                                        fluid
                                        label={`Add new ${this.props.dataType}`} 
                                        name='customValue'
                                        onChange={this.handleChange}
                                        value={this.state.customValue}
                                    />
                                </Grid.Column>
                                <Grid.Column centered width={4}>
                                    <Button
                                        disabled={this.state.value || !this.state.customValue}
                                        primary
                                        color="blue"
                                        onClick={this.commitCustomValue}
                                    >
                                        Commit {this.props.dataType}
                                    </Button>
                                </Grid.Column>
                            </Grid.Row> :
                            <Grid.Row centered>
                                <Button
                                    primary
                                    color="blue"
                                    disabled={this.state.value}
                                    onClick={() =>{this.setState({addEntry: true})}}
                                >
                                    {this.state.customSelection ? `Add another ${this.props.dataType}` : `Add your own ${this.props.dataType}` }
                                </Button>
                            </Grid.Row>   
                        :
                        null
                    }
                    </>
                }
            </Grid>
        )
    }
}