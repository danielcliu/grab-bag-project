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

class Collection extends React.Component{
	
	constructor(props){
		super(props);

		this.imageClick = this.imageClick.bind(this);
		this.switchGrabBagPageDown = this.switchGrabBagPageDown.bind(this);
		this.switchGrabBagPageUp = this.switchGrabBagPageUp.bind(this);
		this.switchIFIBagPageDown = this.switchIFIBagPageDown.bind(this);
		this.switchIFIBagPageUp = this.switchIFIBagPageUp.bind(this);
	}
	imageClick(item) {
		this.props.selectGBDevice(item);
	}
	
	switchGrabBagPageDown(){
		this.props.changeGBPage(-1)
	}
	
	switchGrabBagPageUp(){
		this.props.changeGBPage(+1)
	}
	
	switchIFIBagPageDown(){
		this.props.changeIFIPage(-1)
	}
	
	switchIFIBagPageUp(){
		this.props.changeIFIPage(+1)
	}

	render(){
	  console.log("P{RPS: ", this.props);
	  //console.log(this.props.iFixitBag);
	  return (
		  <div>
		      <GridContextProvider onChange={this.props.onChange}>
		        <div className="container">
		        <div className="device-bag">  
		      		<Search handleSubmit={this.props.handleSubmit}/>
				<GridDropZone
				    className="dropzone iFixitBag"
				    id="iFixitBag"
				    boxesPerRow={4}
				    rowHeight={70}
				  >
				    {this.props.iFixitBag.devices.map(item => (
							<GridItem key={item.id}>
							  <div className="grid-item">
							    <img className="grid-item-content grid-item-image" src={item.image} alt={item.display_name}/>
							  </div>
							</GridItem>
						      ))}
				  </GridDropZone>
				    <div className="pager">
					<button onClick={this.switchIFIBagPageDown}>
						<FiChevronLeft />
					</button>
					<span>
						Page {this.props.iFixitBag.page+1}
					</span>
					<button onClick={this.switchIFIBagPageUp}>
						<FiChevronRight/>
					</button>
				    </div>
		  	</div>
		  	<div className="device-bag">
				  <GridDropZone
				    className="dropzone grabBag"
				    id="grabBag"
				    boxesPerRow={4}
				    rowHeight={70}
				  >
				    {this.props.grabBag.devices[this.props.grabBag.page].map(item => (
							<GridItem key={item.id}>
							  <div className="grid-item">
							    <img className="grid-item-content grid-item-image" src={item.image} alt={item.display_title} onDoubleClick={() => this.imageClick(item)}/>
							   </div>
							</GridItem>
						      ))}
				  </GridDropZone>
				    <div className="pager">
					<button onClick={this.switchGrabBagPageDown}>
						<FiChevronLeft />
					</button>
					<span>
						Page {this.props.grabBag.page+1}
					</span>
					<button onClick={this.switchGrabBagPageUp}>
						<FiChevronRight/>
					</button>
				    </div>
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
