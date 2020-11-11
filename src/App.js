import React from "react";
import {
	  GridContextProvider,
	  GridDropZone,
	  GridItem,
	  swap,
	  move
} from "react-grid-dnd";
import "./App.css";

class Collection extends React.Component{
	
	imageClick(item) {
		this.props.selectGBDevice(item);
	}

	render(){
	  console.log("P{RPS: ", this.props);
	  console.log(this.props.iFixitBag);
	  return (
		  <div>
		      <Search handleSubmit={this.props.handleSubmit}/>
		      <GridContextProvider onChange={this.props.onChange}>
		        <div className="container">
		          <GridDropZone
		            className="dropzone iFixitBag"
		            id="iFixitBag"
		            boxesPerRow={4}
		            rowHeight={70}
		          >
		            {this.props.iFixitBag.map(item => (
				                <GridItem key={item.id}>
				                  <div className="grid-item">
				                    <img className="grid-item-content grid-item-image" src={item.image} alt={item.display_name}/>
				                  </div>
				                </GridItem>
				              ))}
		          </GridDropZone>
		          <GridDropZone
		            className="dropzone grabBag"
		            id="grabBag"
		            boxesPerRow={4}
		            rowHeight={70}
		          >
		            {this.props.grabBag.map(item => (
				                <GridItem key={item.id}>
				                  <div className="grid-item">
				                    <img className="grid-item-content grid-item-image" src={item.image} alt={item.display_title} onDoubleClick={() => this.imageClick(item)}/>
				    		   </div>
				                </GridItem>
				              ))}
		          </GridDropZone>
		  	</div>
		          <GridDropZone
		            className="dropzone trash"
		            id="trash"
		            boxesPerRow={1}
		            rowHeight={4}
		          >
		  		<div> Trash </div>
		  	  </GridDropZone>
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
