import React from 'react';
import Collection from './App';
import {
	  swap,
	  move
} from "react-grid-dnd";
import iFixitApi from './iFixitApi'

class GrabBag extends React.Component{
	constructor(props) {
    		super(props);
    		this.state = {
			limit: '20',
			iFixitBag:{'devices': [], 'page': 0, 'selected': {'display_title': '', 'url': ''}},
			grabBag: {'devices': [[]], 'page': 0, 'selected': {'display_title': '', 'url': ''}},
			trash:{'devices': [], 'page': 0 },
		};
		this.onChange = this.onChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.selectGBDevice = this.selectGBDevice.bind(this);
 	 }
	 
	async componentDidMount(){
		const devices = await this.getDeviceList(this.state.iFixitBag.page, this.state.limit);
		this.setState(prevState => {
			prevState.iFixitBag.devices = devices;
			return  { iFixitBag: prevState.iFixitBag}
		})
	}

	async getDeviceList(page, limit){
		return iFixitApi.get(`wikis/CATEGORY?limit=${limit}&offset=${page}`).then(response => {
			return Array.from(response.data, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
		});
	}
	
	async handleSubmit(text){
		const devices = await iFixitApi.get(`search/${text}?filter=category&limit=${this.state.limit}&offset=${this.state.iFixitBag.page}`).then(response => {
			return Array.from(response.data.results, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
			});
		console.log(devices);
	 	this.setState(prevState => {
			prevState.iFixitBag.devices = devices;
			return	{iFixitBag: prevState.iFixitBag}}
		);	
		console.log(text);
	}
	
	selectGBDevice(item){
		console.log("selected Item : ", item);
		this.setState(prevState => {
			prevState.grabBag.selected = item;
			return {grabBag : prevState.grabBag}
		});
	}

	onChange(sourceId, sourceIndex, targetIndex, targetId) {
		console.log("the: ", this.state)
		console.log(sourceId, ' ', sourceIndex , ' ', targetIndex, ' ', targetId);
		const sourceBag = this.state[sourceId];
		const targetBag = this.state[targetId];
		let targetDevices = this.state[targetId];
		if (targetId){
			if (targetId === "grabBag" && targetBag.devices[targetBag.page].indexOf(sourceBag.devices[sourceIndex]) === -1){
				const result = move(
				    sourceBag.devices,
				    targetBag.devices[targetBag.page],
				    sourceIndex,
				    targetIndex
				  );

				return this.setState(prevState => {
					prevState[targetId].devices[prevState[targetId].page] = result[1];
					return {[targetId]: prevState[targetId]}
			  	});
		    	}
			else if (targetId === "trash" && sourceId === "grabBag"){
				const result = move(
				    sourceBag.devices[sourceBag.page],
				    targetBag.devices,
				    sourceIndex,
				    targetIndex
				  );

				return this.setState(prevState => {
					prevState[sourceId].devices[prevState[sourceId].page] = result[0];
					return {[targetId]: prevState[sourceId]}
			  	});

			} 
		}
		else{
			let sourceDevices = sourceBag.devices;
			if (sourceId === "grabBag" ) {
				sourceDevices = sourceBag.devices[sourceBag.page];
				const result = swap(sourceDevices, sourceIndex, targetIndex);
				return this.setState(prevState => {
					prevState[sourceId].devices[prevState[sourceId].page] = result;
					return {[sourceId]: prevState[sourceId]}
			  	});
			}
			else{
				const result = swap(sourceDevices, sourceIndex, targetIndex);
				return this.setState(prevState => {
					prevState[sourceId].devices = result;
					return {[sourceId]: prevState[sourceId]}
			  	});
			
			}
		}
	    }

	render(){
		console.log(this.state);
		return (
			<div>
				<Collection 
					iFixitBag={this.state.iFixitBag.devices} 
					grabBag={this.state.grabBag.devices[this.state.grabBag.page]}
					onChange={this.onChange}
					handleSubmit={this.handleSubmit}
					selectGBDevice={this.selectGBDevice}
				/>
				<button onClick={() => console.log(this.state)}>
				  Click me
				</button>
				<a href={this.state.grabBag.selected.url} target="_blank" >{this.state.grabBag.selected.display_title}</a>
			</div>
		)
	}




}
export default GrabBag;
