import React, { Component } from 'react'
import { makeCall } from '../apis'
import { List, Checkbox, Loader } from 'semantic-ui-react'

class StudentActionItems extends Component {
   constructor(props) {
       super(props);
       this.state = {
       	actionItemsToDisplay: null,
       	readyToDisplay: false
       }
   }
   async componentDidMount() {
   	  let studentId = this.props.userDetails._id;
   	  let requests = await makeCall({}, `/request/StudentActionItems/${studentId}/`, 'get')
   	  this.setState({
   	  	actionItemsToDisplay: requests.actionItemsArray,
   	  	readyToDisplay: true
   	  })
   }
   render() {
   	   console.log(this.state.actionItemsToDisplay);
       return (
       		<>
           {
           	!this.state.readyToDisplay &&
           	<>
            <Loader /> <br /> Loading Action Items
            </>
           }
           {
           	this.state.readyToDisplay &&
           	<>
           	<h1> Action Items for You </h1>
           	    <List divided relaxed>
           		{this.state.actionItemsToDisplay.map((actionItem, index) => (
           			<List.Item>
           				<Checkbox /> {actionItem} 
           			</List.Item>
           		))}
           		</List>
            </>

           }
           </>
       )
   }
}
export default StudentActionItems;