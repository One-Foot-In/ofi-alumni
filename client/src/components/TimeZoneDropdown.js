import React, { Component } from 'react';
import { Dropdown, Menu } from 'semantic-ui-react'
import { makeCall } from '../apis'

var timeZoneOptions = [
    {
        key: '-1200',
        value: '-1200',
        text: 'BIT/IDLW'
    },
    {
        key: '-1100',
        value: '-1100',
        text: 'NUT/SST',
    },
    {
        key: '-1000',
        value: '-1000',
        text: 'HST/SDT',
    },
    {
        key: '-900',
        value: '-900',
        text: 'AKST/HDT',
    },
    {
        key: '-800',
        value: '-800',
        text: 'PST/AKDT',
    },
    {
        key: '-700',
        value: '-700',
        text: 'MST/PDT',
    },
    {
        key: '-600',
        value: '-600',
        text: 'CST/MDT',
    },
    {
        key: '-500',
        value: '-500',
        text: 'EST/CDT',
    },
    {
        key: '-400',
        value: '-400',
        text: 'AST/EDT',
    },
    {
        key: '-300',
        value: '-300',
        text: 'ART/ADT',
    },
    {
        key: '-200',
        value: '-200',
        text: 'BST',
    },
    {
        key: '-100',
        value: '-100',
        text: 'CVT/EGT',
    },
    {
        key: '0',
        value: '0',
        text: 'GMT/UTC',
    },
    {
        key: '100',
        value: '100',
        text: 'BST/IST/WAT',
    },
    {
        key: '200',
        value: '200',
        text: 'CAT/EET',
    },
    {
        key: '300',
        value: '300',
        text: 'EAT/FET',
    },
    {
        key: '400',
        value: '400',
        text: 'AZT/GST',
    },
    {
        key: '500',
        value: '500',
        text: 'PKT/TJT',
    },
    {
        key: '600',
        value: '600',
        text: 'BST/KGT',
    },
    {
        key: '700',
        value: '700',
        text: 'ICT/WIT',
    },
    {
        key: '800',
        value: '800',
        text: 'AWST/CT/HKT',
    },
    {
        key: '900',
        value: '900',
        text: 'EIT/JST',
    },
    {
        key: '1000',
        value: '1000',
        text: 'AEST/PGT',
    },
    {
        key: '1100',
        value: '1100',
        text: 'AEDT/NFT',
    },
    {
        key: '1200',
        value: '1200',
        text: 'NZST',
    }
]

/*
 * DETAILS:
 * Custom Dropdown as MenuItem for timezone selection
 * Side Effects: On value change, will refresh the page
 * to update the users profile across all props (in Navbar)
 * PROPS:
 * userDetails - users profile information
 * userRole - role of logged in user
 * liftTimezone - prop enabling parent behavior
 */ 
export default class TimeZoneDropdown extends Component {
    state={
        offset: 0
    }

    UNSAFE_componentWillMount() {
        this.setState({offset: this.props.userDetails.timeZone.toString()})
    }

    async updateTimeZone(value) {
        try {
            let update = await makeCall({
                id: this.props.userDetails._id,
                role: this.props.userRole,
                timeZone: parseInt(value)
            }, '/changeTimeZone', 'patch')
        } catch (e) {
            console.log('timezone update failed')
        }
    }

    handleDropdownChange = (e, { name, value }) => {
        this.setState({ [name]: value })
        this.updateTimeZone(value)
        this.props.liftTimezone(value)
    }

    render() {
        return(
            <Dropdown as={Menu.Item}
                position={'right'}
                placeholder={'Select Timezone'}
                selection
                search
                name='offset'
                onChange={this.handleDropdownChange}
                options={timeZoneOptions}
                defaultValue={this.state.offset}
            />
        )
    }
}