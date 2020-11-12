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
		const grabBagSavedDevices = JSON.parse(sessionStorage.getItem('grabBagDevices')) || [[]];
    		this.state = {
			limit: 4,
			
			iFixitBag:{'devices': [], 'page': 0, 'selected': {'display_title': '', 'url': ''}},
			grabBag: {'devices': grabBagSavedDevices, 'page': 0, 'selected': {'display_title': '', 'url': ''}},
			grabBagDevices: grabBagSavedDevices,
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
		window.addEventListener(
		      "beforeunload",
		      this.saveGrabBag.bind(this)
		    );
	}
	
	componentWillUnmount(){
		window.removeEventListener(
		      "beforeunload",
		      this.saveGrabBag.bind(this)
		    );
		this.saveGrabBag();
	}

	saveGrabBag(){
		sessionStorage.setItem('grabBagDevices', JSON.stringify(this.state.grabBag.devices));
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

	handleIdCheck(val){
		const allGBDevices = this.state.grabBag.devices;
		return allGBDevices.flat().some(device => val.id === device.id);
	}

	redistributeGBDevices(stateDevices){
		console.log("state Devices: ", stateDevices);
		const deepCopy = stateDevices;
		let newDevices = []
		let flatCopy = deepCopy.flat();
		console.log("howdy ", flatCopy);
		let flatLen = flatCopy.length;
		console.log("howdy ", flatLen);
		for (let i = 0; i < flatLen; i += this.state.limit){
			let itemList = [];
			console.log("limit: ", this.state.limit, " i: ", i);
			for (let j = 0; j < this.state.limit; j++){
				console.log("in inner loop");
				if(j+i == flatLen){break;}
				console.log("about to push loop", );
				itemList.push(flatCopy[i+j]);
			
			} 
			console.log("IN LOOP x: ", i, ' ', itemList);
			newDevices.push(itemList);
		}
		console.log("NEW DEVICES: ", newDevices);
		return newDevices;
	}

	onChange(sourceId, sourceIndex, targetIndex, targetId) {
		const sourceBag = this.state[sourceId];
		if (targetId){
			const targetBag = this.state[targetId];
			if (targetId === "grabBag" && !this.handleIdCheck(sourceBag.devices[sourceIndex])){
				const result = move(
				    sourceBag.devices,
				    targetBag.devices[targetBag.page],
				    sourceIndex,
				    targetIndex
				  );

				return this.setState(prevState => {
					let localState = prevState;
					prevState.grabBagDevices[prevState[targetId].page] = result[1];
					let newDevices = this.redistributeGBDevices(prevState.grabBagDevices);

					localState[targetId].devices = newDevices;
					return {'grabBagDevices': newDevices}
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
					let localState = prevState;
					prevState.grabBagDevices[prevState[sourceId].page] = result[0];
					
					let newDevices = this.redistributeGBDevices(prevState.grabBagDevices);

					localState[sourceId].devices = newDevices;
					return {[sourceId]: localState[sourceId], 'grabBagDevices': newDevices}
			  	});

			} 
		}
		else{
			let sourceDevices = sourceBag.devices;
			if (sourceId === "grabBag" ) {
				sourceDevices = sourceBag.devices[sourceBag.page];
				const result = swap(sourceDevices, sourceIndex, targetIndex);
				return this.setState(prevState => {
					console.log(prevState);
					prevState[sourceId].devices[prevState[sourceId].page] = result;
					prevState.grabBagDevices[prevState[sourceId].page] = result;
					return {[sourceId]: prevState[sourceId], 'grabBagDevices': prevState.grabBagDevices}
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
		console.log("Render GrabBag: ",this.state);
		return (
			<div>
				<Collection 
					iFixitBag={this.state.iFixitBag} 
					grabBag={this.state.grabBag}
					grabBagDevices={this.state.grabBagDevices}
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
