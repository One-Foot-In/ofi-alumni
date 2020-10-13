import React, { Component } from 'react';
import { Dropdown, Menu } from 'semantic-ui-react'
import { makeCall } from '../apis'

var timeZoneOptions = [
    {
        key: '-1200',
        value: '-1200',
        text: 'Baker Island | BIT/IDLW'
    },
    {
        key: '-1100',
        value: '-1100',
        text: 'Jarvis Island | NUT/SST',
    },
    {
        key: '-1000',
        value: '-1000',
        text: 'Honululu (HI, USA) | HST/SDT',
    },
    {
        key: '-900',
        value: '-900',
        text: 'Anchorage (AK, USA) | AKST/HDT',
    },
    {
        key: '-800',
        value: '-800',
        text: 'Los Angeles (CA, USA) | PST/AKDT',
    },
    {
        key: '-700',
        value: '-700',
        text: 'Phonenix (AZ, USA) | MST/PDT',
    },
    {
        key: '-600',
        value: '-600',
        text: 'Chicago (IL, USA) | CST/MDT',
    },
    {
        key: '-500',
        value: '-500',
        text: 'New York (NT, USA) | EST/CDT',
    },
    {
        key: '-400',
        value: '-400',
        text: 'Santiago (Chile) | AST/EDT',
    },
    {
        key: '-300',
        value: '-300',
        text: 'Buenos Aires (Argentina) | ART/ADT',
    },
    {
        key: '-200',
        value: '-200',
        text: 'Fernando de Noronha (Brazil) | BST',
    },
    {
        key: '-100',
        value: '-100',
        text: 'Cape Verde | CVT/EGT',
    },
    {
        key: '0',
        value: '0',
        text: 'London (UK) | UTC/GMT +0',
    },
    {
        key: '100',
        value: '100',
        text: 'Paris (France) | BST/IST/WAT',
    },
    {
        key: '200',
        value: '200',
        text: 'Athens (Greece) | CAT/EET',
    },
    {
        key: '300',
        value: '300',
        text: 'Istanbul (Turkey) | EAT/FET',
    },
    {
        key: '400',
        value: '400',
        text: 'Dubai (UAE) | AZT/GST',
    },
    {
        key: '500',
        value: '500',
        text: 'Karachi (Pakistan) | PKT/TJT',
    },
    {
        key: '600',
        value: '600',
        text: 'Dhaka (Bangladesh) | BST/KGT',
    },
    {
        key: '700',
        value: '700',
        text: 'Jakarta (Indonesia) | ICT/WIT',
    },
    {
        key: '800',
        value: '800',
        text: 'Shanghai (China) | AWST/CT/HKT',
    },
    {
        key: '900',
        value: '900',
        text: 'Seoul (South Korea) | EIT/JST',
    },
    {
        key: '1000',
        value: '1000',
        text: 'Sydney (Australia) | AEST/PGT',
    },
    {
        key: '1100',
        value: '1100',
        text: 'Magadan (Russia) | AEDT/NFT',
    },
    {
        key: '1200',
        value: '1200',
        text: 'Auckland (New Zealand) | NZST',
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