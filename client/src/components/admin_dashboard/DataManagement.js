import React,{useState, useEffect, Component} from 'react';
import { Card, Search, Pagination, Grid, Segment, Button, Dropdown, Checkbox, Label, GridColumn } from 'semantic-ui-react'
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
        text: 'In·terest',
        value: 'interest'
    }
]

const pageSize = 6;

export default class DataManagement extends Component {
    constructor(props){
        super(props)
        this.state={
            allInterests : [],
            checkedInterests : [],
            sortedInterests : [],
            display : [],      
            search : '',  
            currPage : 1,
            pageSize : 0,
            mergeMoalOpen : false, 
            mergeButtonActive : false,         
        }
        this.getInterests = this.getInterests.bind(this)
        this.interestCard  = this.interestCard.bind(this)
        this.handlePaginationChange =  this.handlePaginationChange.bind(this)
    }

    async getInterests(){
        // makeCall({}, '/admin/allInterests/' + this.props.userDetails._id, 'get')
        // .then((res) =>{
        //     this.setState(
        //         {allInterests : res.interests})
        // })
        let res = await  makeCall({},'/admin/allInterests/' + this.props.userDetails._id, 'get')
        this.setState({allInterests : res.interests})
    };

    

    componentDidßMount(){
        this.getInterests();
        let items = this.state.allInterests;
        let sortedInterests = items.sort( (a,b) => {
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;
        })
        let length = Math.ceil(sortedInterests.length / pageSize)
        this.setState(
            {sortedInterests : sortedInterests,
            pageSize: length}
        )
        this.constructDisplay();

    };
    
    constructDisplay(){
        let interestsArray = []
        for (let i = 0; i < pageSize; i++){
            let interest = this.state.sortedInterests[(this.state.currPage - 1) * pageSize + i]
            if (interest){
                interestsArray.push(this.interestCard(interest))
            }
        }
        this.setState({display : interestsArray})
    }

    interestCard(interset){
        return (
            <Card fluid key={interset._id}>
                <Card.Content>
                    <Card.Header>
                    <Grid>
                        <Grid.Row columns={1}>
                            <Grid.Column>{interset.name}</Grid.Column>
                        </Grid.Row>
                    </Grid>
                    </Card.Header>
                </Card.Content>
            </Card>
        )
    }
       
    handlePaginationChange = (e, { activePage }) => {
        this.setState({currPage  :  activePage})
    }


    render() {
        return (
        <div>
            <Grid centered>
            <Grid.Row>
                <Grid.Column width={10}>
                    {this.state.display}
                </Grid.Column>
            </Grid.Row>
        </Grid>
        <Segment textAlign='center'>
            <Pagination
                activePage={this.state.currPage}
                totalPages={this.state.pages}
                onPageChange={this.handlePaginationChange}
            />
        </Segment>
        </div>
        )
        
    }
}

