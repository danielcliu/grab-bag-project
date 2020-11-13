import React from 'react';
import Collection from './App';
import {
	  swap,
	  move
} from "react-grid-dnd";
import iFixitApi from './iFixitApi';
import _ from "lodash";

class GrabBag extends React.Component{
	constructor(props) {
    		super(props);
		const grabBagSavedDevices = JSON.parse(sessionStorage.getItem('grabBagDevices')) || [[]];
    		this.state = {
			limit: 20,
			searchString: '',	
			iFixitBag:{'devices': [], 'page': 0, 'selected': {'display_title': '', 'url': ''}},
			grabBag: {'devices': grabBagSavedDevices, 'page': 0, 'selected': {'display_title': '', 'url': ''}},
			grabBagDevices: grabBagSavedDevices,
			trash:{'devices': [], 'page': 0 },
		};
		this.onChange = this.onChange.bind(this);
		this.changeGBPage = this.changeGBPage.bind(this);
		this.changeIFIPage = this.changeIFIPage.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
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
	
	async handleSearch(text){
		let localState = _.cloneDeep(this.state.iFixitBag);
		const devices = await iFixitApi.get(`search/${text}?filter=category&limit=${this.state.limit}&offset=${0}`).then(response => {
			return Array.from(response.data.results, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
			});
		console.log(devices);
		localState.devices = devices;
		localState.page = 0;
	 	this.setState({iFixitBag: localState, searchString: text});	
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
		//console.log("state Devices: ", stateDevices);
		const deepCopy = _.cloneDeep(stateDevices);
		let newDevices = []
		let flatCopy = deepCopy.flat();
		//console.log("howdy ", flatCopy);
		let flatLen = flatCopy.length;
		//console.log("howdy ", flatLen);
		for (let i = 0; i < flatLen; i += this.state.limit){
			let itemList = [];
		//	console.log("limit: ", this.state.limit, " i: ", i);
			for (let j = 0; j < this.state.limit; j++){
		//		console.log("in inner loop");
				if(j+i === flatLen){break;}
		//		console.log("about to push loop", );
				itemList.push(flatCopy[i+j]);
			
			} 
		//	console.log("IN LOOP x: ", i, ' ', itemList);
			newDevices.push(itemList);
		}
		if (newDevices.length===0) newDevices.push([]);
		console.log("NEW DEVICES: ", newDevices);
		return newDevices;
	}

	changeGBPage(diff){
		//console.log("IN GB Pasge Change", diff);
		let nextPage = this.state.grabBag.page + diff;
		//console.log("IN NextPage ", nextPage, ' and; ', this.state.grabBag.devices.length -1);
		if(nextPage >= 0 && nextPage <= (this.state.grabBag.devices.length -1)){
			this.setState(prevState => {
				prevState.grabBag.page = nextPage;
				return {'grabBag': prevState.grabBag}})
		}
		else{ console.log("Not a legit page");}
	}

	async changeIFIPage(diff){
		let localState = _.cloneDeep(this.state.iFixitBag);
		localState.page += diff;
		const offset = localState.page * this.state.limit;
		if (localState.page <0){return 0;} 
		if(this.state.searchString === ''){
			const devices = await this.getDeviceList(offset, this.state.limit);
			localState.devices = devices
			this.setState({ iFixitBag: localState})
		}
		else{
			const devices = await iFixitApi.get(`search/${this.state.searchString}?filter=category&limit=${this.state.limit}&offset=${offset}`).then(response => {
				return Array.from(response.data.results, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
			});
			localState.devices = devices;
			console.log(devices);
			this.setState({iFixitBag: localState});	
		}	
	
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
				const deepCopy = _.cloneDeep(this.state[sourceId]);

				deepCopy.devices[deepCopy.page] = result[0];
					
				let newDevices = this.redistributeGBDevices(deepCopy.devices);
				let page;
				if (Math.max(newDevices.length-1, 0) < deepCopy.page){
					deepCopy.page -=  1;
					console.log("DC we should jump to page: ", page);
				}
				deepCopy.devices = newDevices;
				return this.setState(prevState => {
					prevState.grabBagDevices[prevState[sourceId].page] = result[0];
					
					let newDevices = this.redistributeGBDevices(prevState.grabBagDevices);
					return {[sourceId]: deepCopy, 'grabBagDevices': newDevices}
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
					if (result.length === 0){
						
					}
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
					handleSubmit={this.handleSearch}
					changeGBPage={this.changeGBPage}
					changeIFIPage={this.changeIFIPage}
					selectGBDevice={this.selectGBDevice}
				/>
				<a className="pager" href={this.state.grabBag.selected.url} target="_blank" >{this.state.grabBag.selected.display_title}</a>
			</div>
		)
	}




}
export default GrabBag;
