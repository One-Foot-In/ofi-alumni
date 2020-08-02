import React,{useState, useEffect, Component} from 'react';
import { Card, Search, Pagination, Grid, Segment, Button, Dropdown, Checkbox, Label } from 'semantic-ui-react'
import { makeCall } from '../../apis';
import MergeModal from './MergeModal'

// import source data

// define a fileter 
const searchOptions = [
    {
        key:"All Fields",
        text:"All Fields",
        value:"all"
    },
    {
        key:"Profession",
        text:"Profession",
        value:"jobTitleName"
    },
    {
        key: 'Company',
        text: 'Company',
        value: 'companyName'
    },
    {
        key: 'Major',
        text: 'Major',
        value: 'major'
    },
    {
        key: 'Interest',
        text: 'Interest',
        value: 'interest'
    }
]

const pageSize = 3;

export default class MergeData extends Component {
    constructor(props){
        super(props)
        this.state={
            allColleges : [],
            checkedColleges : [],
            display : [],
            search : '',  
            mergeMoalOpen : false, 
            mergeButtonActive : false,         
        }
        this.toggleRequestModal = this.toggleRequestModal.bind(this)
    }

    
    closeMergeModal = () => {
        this.setState({
            mergeModalOpen : false,
            mergeButtonActive : false,
        })
        makeCall({}, '/admin/allColleges/' + props.userDetails._id, 'get')
            .then((res) => {
                    setAllColleges(res.colleges)
                })
    }
    

    // when I use class can I put a const at here?
    searchBar = (
        
    )

    // show how many result is being found.
    render() {
        return (
        <div>
            { mergeModalOpen &&
                <MergeModal
                    viewing={'COLLEGES'}
                    modalOpen={mergeModalOpen}
                    toggleModal={closeMergeModal}
                    selectedItems={selectedIds}
                    userDetails={props.userDetails._id}
                />
            }
            {searchBar}
        </div>
        )
        
    }
}





//
