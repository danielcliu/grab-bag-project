import React from 'react';
import Collection from './Collection';
import {
	  swap,
	  move
} from "react-grid-dnd";
import iFixitApi from './iFixitApi';
import Search from './Search';
import "./App.css";
import cogoToast from 'cogo-toast';

class GrabBag extends React.Component{
	constructor(props) {
    		super(props);
		const grabBagSavedDevices = JSON.parse(sessionStorage.getItem('grabBagDevices')) || [[]];
    		this.state = {
			limit: 24,
			searchString: '',	
			iFixitBag:{'devices': [], 'page': 0, 'selected': {'display_title': '', 'url': ''}},
			grabBag: {'devices': grabBagSavedDevices, 'page': 0, 'selected': {'display_title': '', 'url': ''}},
			trash:{'devices': [], 'page': 0 },
		};
		this.onChange = this.onChange.bind(this);
		this.changeGBPage = this.changeGBPage.bind(this);
		this.changeIFIPage = this.changeIFIPage.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.selectGBDevice = this.selectGBDevice.bind(this);
 		this.getRandomDevices = this.getRandomDevices.bind(this); 
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

	
	async getRandomDevices(){
		const devices = await this.getDeviceList(this.state.iFixitBag.page, this.state.limit);
		this.setState(prevState => {
			prevState.iFixitBag.devices = devices;
			prevState.iFixitBag.page=0;
			return  { iFixitBag: prevState.iFixitBag, searchString: ''}
		})
	}

	async getDeviceList(page, limit){
		return iFixitApi.get(`wikis/CATEGORY?limit=${limit}&offset=${page}`).then(response => {
			return Array.from(response.data, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
		});
	}
	
	async handleSearch(text){
		let localState = this.state.iFixitBag;
		const devices = await iFixitApi.get(`search/${text}?filter=category&limit=${this.state.limit}&offset=${0}`).then(response => {
			return Array.from(response.data.results, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
			});
		localState.devices = devices;
		localState.page = 0;
	 	this.setState({iFixitBag: localState, searchString: text});
		if(devices.length === 0) cogoToast.error(`There were no results for "${text}"`);
	}
	
	selectGBDevice(item){
		this.setState(prevState => {
			prevState.grabBag.selected = item;
			return {grabBag : prevState.grabBag}
		});
	}

	handleIdCheck(val){
		const allGBDevices = this.state.grabBag.devices;
		const ans = allGBDevices.flat().some(device => val.id === device.id);
		if (ans) cogoToast.error(`The device ${val.display_title} is already in the user Grab Bag`);
		return ans;
	}

	redistributeGBDevices(stateDevices){
		const deepCopy = stateDevices;
		
		let newDevices = []
		let flatCopy = deepCopy.flat();
		let flatLen = flatCopy.length;
		for (let i = 0; i < flatLen; i += this.state.limit){
			let itemList = [];
			for (let j = 0; j < this.state.limit; j++){
				if(j+i === flatLen){break;}
				itemList.push(flatCopy[i+j]);
			
			} 
			newDevices.push(itemList);
		}
		if (newDevices.length===0) newDevices.push([]);
		return newDevices;
	}

	changeGBPage(diff){
		let nextPage = this.state.grabBag.page + diff;
		if(nextPage >= 0 && nextPage <= (this.state.grabBag.devices.length -1)){
			this.setState(prevState => {
				prevState.grabBag.page = nextPage;
				return {'grabBag': prevState.grabBag}})
		}
		else{ cogoToast.error(`There is not a page ${nextPage+1}`);}
	}

	async changeIFIPage(diff){
		let localState = this.state.iFixitBag;
		let page = localState.page + diff;
		if (page < 0){
			cogoToast.error('There is not a page 0');
			return 0;
		} 
		const offset = page * this.state.limit;
		let devices;
		if(this.state.searchString === ''){
			devices = await this.getDeviceList(offset, this.state.limit);
		}
		else{
			devices = await iFixitApi.get(`search/${this.state.searchString}?filter=category&limit=${this.state.limit}&offset=${offset}`).then(response => {
				return Array.from(response.data.results, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
			});
		}	
		
		if(devices.length === 0){
			cogoToast.error(`There are no more results for ${this.state.searchString}`);
			return 0;
		}

		localState.devices = devices;
		localState.page = page;
		this.setState({iFixitBag: localState});	
	
	}

	onChange(sourceId, sourceIndex, targetIndex, targetId) {
		const sourceBag = this.state[sourceId];
		if( !targetId && !sourceId) return 0;
		
		if (targetId){
			const targetBag = this.state[targetId];
			if (targetId === "grabBag" && !this.handleIdCheck(sourceBag.devices[sourceIndex])){
				const result = move(
				    sourceBag.devices,
				    targetBag.devices[targetBag.page],
				    sourceIndex,
				    targetIndex
				  );
				let deepCopy = this.state.[targetId];
				deepCopy.devices[deepCopy.page] = result[1];
				let newDevices = this.redistributeGBDevices(deepCopy.devices);
				deepCopy.devices = newDevices;
				return this.setState({[targetId]: deepCopy});
		    	}
			else if (targetId === "trash" && sourceId === "grabBag"){
				const result = move(
				    sourceBag.devices[sourceBag.page],
				    targetBag.devices,
				    sourceIndex,
				    targetIndex
				  );
				const deepCopy = this.state[sourceId];

				deepCopy.devices[deepCopy.page] = result[0];
					
				let newDevices = this.redistributeGBDevices(deepCopy.devices);
				if (Math.max(newDevices.length-1, 0) < deepCopy.page){
					deepCopy.page -=  1;
				}
				deepCopy.devices = newDevices;
				return this.setState({[sourceId]: deepCopy});

			}
			else if (targetId === "trash"){
				cogoToast.error('Only devices from the Grab Bag grid can be deleted');
			}
		}
		else{
			if (sourceId === "grabBag" ) {
				const sourceDevices = sourceBag.devices[sourceBag.page];
				const result = swap(sourceDevices, sourceIndex, targetIndex);
				let deepCopy = this.state[sourceId];
				deepCopy.devices[deepCopy.page] = result;
				return this.setState({[sourceId]: deepCopy});
			}
			else{
				const sourceDevices = sourceBag.devices;
				const result = swap(sourceDevices, sourceIndex, targetIndex);
				return this.setState(prevState => {
					prevState[sourceId].devices = result;
					return {[sourceId]: prevState[sourceId]}
			  	});
			}
		}
	    }

	render(){
		return (
			<div>
				<div className="header">
					<div className="search">
						<label>
							<a href="https://www.ifixit.com/"><img className="logo-image" src="https://upload.wikimedia.org/wikipedia/commons/8/8e/IFixit_logo.svg" alt="iFixit"/></a>
						</label>
		      				<Search className="pager" handleSubmit={this.handleSearch}/>
						<button className="random-button" onClick={this.getRandomDevices}>All Devices</button> 
					</div>
				</div>
				<Collection 
					iFixitBag={this.state.iFixitBag} 
					grabBag={this.state.grabBag}
					onChange={this.onChange}
					handleSubmit={this.handleSearch}
					changeGBPage={this.changeGBPage}
					changeIFIPage={this.changeIFIPage}
					selectGBDevice={this.selectGBDevice}
				/>
				<div className="selected">
					<div className="pager">Selected Device: {this.state.grabBag.selected.display_title}</div>
					{this.state.grabBag.selected.url &&
					<div className="inner-selected">
						<div className="pager">iFixit Link: </div>
						<a className="pager" href={this.state.grabBag.selected.url} target="_blank" rel="noreferrer"> Here</a>
					</div>
					}
				</div>
			</div>
		)
	}
}
export default GrabBag;
