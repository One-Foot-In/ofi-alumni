import React, { Component } from 'react';
import {Dropdown, Icon, Label, Grid, Segment } from 'semantic-ui-react';
import { makeCall } from "../apis";

const NEW_ENTRY_TEXT = "Add new entry "

/*
    NOTE: There is a bug on using `allowableAdditions` on dropdowns as here:
    https://github.com/Semantic-Org/Semantic-UI-React/issues/2624
    Use onAddItem prop to handle change of options when user adds a new option
*/

/*
props:
    - endpoint 
    - getInputs: ({old: {value, text}, new: {value, text}}) // value for entries is old is mongoId
    - dataType: string
    - allowAddition: Boolean
*/
export default class SearchablePooledMultiSelectDropdown extends Component {
    constructor(props){
        super(props)
        this.state = {
            options: [],
            value: [], // for dropdown form control only
            customSelections: []

        }
        this.removeCustomValue = this.removeCustomValue.bind(this)
        this.getEnteredCustomValues = this.getEnteredCustomValues.bind(this)
        this.handleSelection = this.handleSelection.bind(this)
    }

    async UNSAFE_componentWillMount() {
        let result = await makeCall(null, this.props.endpoint, 'get')
        this.setState({
            options: result.options,

        })
    }

    handleSelection(e, {value}) {
        e.preventDefault()
        let text = e.target.textContent // e.target is dom element for newly added dropdown selection
        // if custom value
        if (text && text.startsWith(NEW_ENTRY_TEXT)) {
            let oldCustomSelections = this.state.customSelections
            const textToAdd = text.substring(14)
            let oldCustomValues = this.state.customSelections.map(selection => selection.value).flat()
            if (oldCustomValues.includes(textToAdd)) {
                // avoid duplicate custom values
                return
            }
            oldCustomSelections.push({
                value: textToAdd,
                text: textToAdd
            })
            this.setState({
                customSelections: oldCustomSelections
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
        } else {
        // if original selection
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
                    Your entries for {this.props.dataType}
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
                        placeholder={`Select ${this.props.dataType}`}
                        multiple
                        search
                        selection
                        allowAdditions={this.props.allowAdditions}
                        additionLabel={NEW_ENTRY_TEXT}
                        options={this.state.options}
                        value={this.state.value}
                        onChange={this.handleSelection}
                    />
                </Grid.Row>
            </Grid>
        )
    }
}