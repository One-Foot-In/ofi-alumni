import React, { Component } from 'react';
import { Dropdown } from 'semantic-ui-react'
import { makeCall } from '../apis'

var timeZoneOptions = [
    {
        key: '-1200',
        value: '-1200',
        text: 'BIT/IDLW (UTC/GMT -12)'
    },
    {
        key: '-1100',
        value: '-1100',
        text: 'NUT/SST (UTC/GMT -11)',
    },
    {
        key: '-1000',
        value: '-1000',
        text: 'HST/SDT (UTC/GMT -10)',
    },
    {
        key: '-900',
        value: '-900',
        text: 'AKST/HDT (UTC/GMT -9)',
    },
    {
        key: '-800',
        value: '-800',
        text: 'PST/AKDT (UTC/GMT -8)',
    },
    {
        key: '-700',
        value: '-700',
        text: 'MST/PDT (UTC/GMT -7)',
    },
    {
        key: '-600',
        value: '-600',
        text: 'CST/MDT (UTC/GMT -6)',
    },
    {
        key: '-500',
        value: '-500',
        text: 'EST/CDT (UTC/GMT -5)',
    },
    {
        key: '-400',
        value: '-400',
        text: 'AST/EDT (UTC/GMT -4)',
    },
    {
        key: '-300',
        value: '-300',
        text: 'ART/ADT (UTC/GMT -3)',
    },
    {
        key: '-200',
        value: '-200',
        text: 'BST (UTC/GMT -2)',
    },
    {
        key: '-100',
        value: '-100',
        text: 'CVT/EGT (UTC/GMT -1)',
    },
    {
        key: '0',
        value: '0',
        text: 'UTC/GMT +0',
    },
    {
        key: '100',
        value: '100',
        text: 'BST/IST/WAT (UTC/GMT +1)',
    },
    {
        key: '200',
        value: '200',
        text: 'CAT/EET (UTC/GMT +2)',
    },
    {
        key: '300',
        value: '300',
        text: 'EAT/FET (UTC/GMT +3)',
    },
    {
        key: '400',
        value: '400',
        text: 'AZT/GST (UTC/GMT +4)',
    },
    {
        key: '500',
        value: '500',
        text: 'PKT/TJT (UTC/GMT +5)',
    },
    {
        key: '600',
        value: '600',
        text: 'BST/KGT (UTC/GMT +6)',
    },
    {
        key: '700',
        value: '700',
        text: 'ICT/WIT (UTC/GMT +7)',
    },
    {
        key: '800',
        value: '800',
        text: 'AWST/CT/HKT (UTC/GMT +8)',
    },
    {
        key: '900',
        value: '900',
        text: 'EIT/JST (UTC/GMT +9)',
    },
    {
        key: '1000',
        value: '1000',
        text: 'AEST/PGT (UTC/GMT +10)',
    },
    {
        key: '1100',
        value: '1100',
        text: 'AEDT/NFT (UTC/GMT +11)',
    },
    {
        key: '1200',
        value: '1200',
        text: 'NZST (UTC/GMT +12)',
    }
]

export default class TimeZoneDropdown extends Component {
    state={
        offset: 0
    }

    componentWillMount() {
        this.setState({offset: this.props.userDetails.timeZone.toString()})
    }

    handleDropdownChange = (e, { name, value }) => {
        this.setState({ [name]: value })
        console.log(this.props.userDetails)
        console.log(this.props.role)
        let updateProfile = makeCall({
            id: this.props.userDetails._id,
            role: this.props.userRole,
            timeZone: parseInt(value)
        }, '/changeTimeZone', 'patch')
        this.props.liftTimezone(value)
    }

    render() {
        return(
            <Dropdown
                compact={this.props.compact}
                placeholder={'Select Timezone'}
                selection
                search
                floating
                name='offset'
                onChange={this.handleDropdownChange}
                options={timeZoneOptions}
                defaultValue={this.state.offset}
            />
        )
    }
}