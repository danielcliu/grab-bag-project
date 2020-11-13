import React from "react";
import {
	  GridContextProvider,
	  GridDropZone,
	  GridItem,
	  swap,
	  move
} from "react-grid-dnd";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {FaTrash, FaTrashRestore} from "react-icons/fa";
import "./App.css";
import Bag from "./Bag.js";

class Collection extends React.Component{
	
	constructor(props){
		super(props);

	}

	render(){
	  console.log("P{RPS: ", this.props);
	  return (
		  <div>
		      <GridContextProvider onChange={this.props.onChange}>
		        <div className="container">
				<Search handleSubmit={this.props.handleSubmit}/>
				<Bag bagName="iFixitBag" 
					bagDevices={this.props.iFixitBag.devices} 
					bagPage={this.props.iFixitBag.page} 
					changeBagPage={this.props.changeIFIPage} 
					selectDevice={this.props.selectGBDevice} />
				<div>
				<Bag bagName="grabBag" 
					bagDevices={this.props.grabBag.devices[this.props.grabBag.page]} 
					bagPage={this.props.grabBag.page} 
					changeBagPage={this.props.changeGBPage} 
					selectDevice={this.props.selectGBDevice} />
					  <GridDropZone
					    className="drop-trash trash"
					    id="trash"
					    boxesPerRow={1}
					    rowHeight={4}
					  >
						<FaTrash class="fa-trash" />
					  </GridDropZone>
				</div>
		  	</div>
		      </GridContextProvider>
		  </div>
		  );
	}
}

class Search extends React.Component{
	constructor(props){
		super(props);
		this.state = {searchString : ''};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event){
		this.setState({searchString : event.target.value});
	}
	
	handleSubmit(event){
		event.preventDefault();
		console.log("here");
		this.props.handleSubmit(this.state.searchString);
	}
	
	render(){
		return(	
		<form onSubmit={this.handleSubmit}>
			<label>
		  	Name:
	  		<input type="text" value={this.state.searchString} onChange={this.handleChange} />
			</label>
			<input type="submit" value="Submit" />
	      	</form>
		);
	}

}
export default Collection;
