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

	handleSubmit(text){
		return event => {
			event.preventDefault()
			console.log(text);
		}
	}
	
	render(){
	  return (
		  <div>
		      <Search handleSubmit={this.handleSubmit}/>
		      <GridContextProvider onChange={this.props.onChange}>
		        <div className="container">
		          <GridDropZone
		            className="dropzone iFixitDevices"
		            id="iFixitDevices"
		            boxesPerRow={4}
		            rowHeight={70}
		          >
		            {this.props.iFixitDevices.map(item => (
				                <GridItem key={item.name}>
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
				                <GridItem key={item.name}>
				                  <div className="grid-item">
				                    <img className="grid-item-content grid-item-image" src={item.image} alt={item.display_name}/>
				    		   </div>
				                </GridItem>
				              ))}
		          </GridDropZone>
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
	}

	handleChange(event){
		this.setState({searchString : event.target.value});
	}

	render(){
		return(	
		<form onSubmit={this.props.handleSubmit(this.state.searchString)}>
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
