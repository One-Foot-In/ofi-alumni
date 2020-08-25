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
    - getInput: (selection: String | {}, isNew: Boolean)
    - dataType
    - allowAddition: Boolean
*/
export default class SearchablePooledSingleSelectDropdown extends Component {
    constructor(props){
        super(props)
        this.state = {
            options: [],
            value: null, // for dropdown form control only
            customSelection: null

        }
        this.removeCustomValue = this.removeCustomValue.bind(this)
        this.getEnteredCustomValue = this.getEnteredCustomValue.bind(this)
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
            const textToAdd = text.substring(14)
            this.setState({
                customSelection: {
                    value: textToAdd,
                    text: textToAdd
                }
            }, () => {
                this.props.getInput(
                    this.state.customSelection, true
                )
            })
        } else {
        // if original selection
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
                <Grid.Row
                    centered
                >
                    {
                        this.state.customSelection ? 
                        this.getEnteredCustomValue()
                        :
                        <Dropdown
                            placeholder={`Select ${this.props.dataType}`}
                            search
                            selection
                            allowAdditions={this.props.allowAddition}
                            additionLabel={NEW_ENTRY_TEXT}
                            options={this.state.options}
                            value={this.state.value}
                            disabled={this.state.customSelection}
                            onChange={this.handleSelection}
                        />
                    }
                </Grid.Row>
            </Grid>
        )
    }
}