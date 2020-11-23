import React from "react";
import {
	  GridContextProvider,
	  GridDropZone,
} from "react-grid-dnd";
import "./App.css";
import Bag from "./Bag.js";
import {FaTrash}  from "react-icons/fa";

class Collection extends React.Component{
	
	render(){
	  return (
		  <div>
		      <GridContextProvider onChange={this.props.onChange}>
		        <div className="container">
				<div className="inner-container">
		  			<div className="title">iFixit Devices</div>
					<Bag bagName="iFixitBag" 
						bagDevices={this.props.iFixitBag.devices} 
						bagPage={this.props.iFixitBag.page} 
						changeBagPage={this.props.changeIFIPage} 
						selectDevice={this.props.selectGBDevice} />
				</div>
		  		<div className="inner-container">
		  			<div className="title">Grab Bag</div>
					<Bag bagName="grabBag" 
						bagDevices={this.props.grabBag.devices[this.props.grabBag.page]} 
						bagPage={this.props.grabBag.page} 
						changeBagPage={this.props.changeGBPage} 
						selectDevice={this.props.selectGBDevice} />
				</div>
				<div className="trash-container"> 
					<GridDropZone
					    className="drop-trash trash"
					    id="trash"
					    boxesPerRow={0}
					    rowHeight={3}
					  >
						<FaTrash className="fa-trash" />
					  </GridDropZone>
				</div>
		  	</div>
		      </GridContextProvider>
		  </div>
		  );
	}
}

export default Collection;
