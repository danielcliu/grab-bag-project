import React from "react";
import "./App.css";

class SearchBar extends React.Component{
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
		//to do, pass state limit instead of hardcoding 24
		this.props.handleSubmit(this.state.searchString, 0, 0, 24);
	}
	
	render(){
		return(	
		<form className="search-bar" onSubmit={this.handleSubmit}>
	  		<input type="text" value={this.state.searchString} onChange={this.handleChange} placeholder="Search iFixit Devices" />
			<input type="submit" value="Search" />
	      	</form>
		);
	}

}
export default SearchBar;
