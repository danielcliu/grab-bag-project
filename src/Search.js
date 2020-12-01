import React from "react";
import "./App.css";
import "./Search.css";
import iFixitApi from './iFixitApi';
import Autosuggest from 'react-autosuggest';
import { FaSearch } from 'react-icons/fa';

const getSuggestionValue = suggestion => suggestion.display_title;

const renderSuggestion = suggestion => (
	<span>{suggestion.display_title}</span>
);

const renderInputComponent = inputProps => (
	  <div className="inputContainer">
	    <FaSearch className="icon" />
	    <input {...inputProps} />
	  </div>
);

class SearchBar extends React.Component{
	constructor(props){
		super(props);
		this.state = {value : '', suggestions:[]};
	}

	onChange = (event, { newValue }) => {
		this.setState({ value: newValue	});
	};

	onSuggestionsFetchRequested = async ({ value }) => {
		let newSuggestions = await iFixitApi.get(`suggest/${value}?doctypes=category`).then(response => { 
			return response.data.results.map( device => ({ display_title: device.display_title, id: device.wikiid}));
		});
		this.setState({
		  suggestions: newSuggestions
		});
	};
	
	onSuggestionsClearRequested = () => {
		this.setState({
	  		suggestions: []
		});
		};
	

	handleSubmit = (event) => {
		event.preventDefault();
		this.props.handleSubmit(this.state.value);
	};

	render(){
		const { value, suggestions } = this.state;
		const inputProps = {
			      placeholder: 'Search iFixit Devices',
			      value,
			      onChange: this.onChange
			    };

		return(	
		<form className="search-bar" onSubmit={this.handleSubmit}>
			<Autosuggest
			        suggestions={suggestions}
			        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
			        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
				getSuggestionValue={getSuggestionValue}
			        renderSuggestion={renderSuggestion}
			        inputProps={inputProps}
			      	renderInputComponent={renderInputComponent}
			/>
		</form>
		);
	}

}
export default SearchBar;
