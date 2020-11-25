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
			selectedItem: {'display_title': '', 'url': ''},
			iFixitBag:{'devices': [[]], 'page': 0, 'offset': 0 },
			grabBag: {'devices': grabBagSavedDevices, 'page': 0 },
			trash:{'devices': [], 'page': 0 },
		};
		this.onChange = this.onChange.bind(this);
		this.changeGBPage = this.changeGBPage.bind(this);
		this.changeIFIPage = this.changeIFIPage.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.selectDevice = this.selectDevice.bind(this);
 		this.handleGetDevicesList = this.handleGetDevicesList.bind(this); 
	}
	 
	async componentDidMount(){
		await this.handleGetDevicesList(0, 0, this.state.limit);
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

	
	async handleGetDevicesList(offset, page, limit){
		let localState = this.state.iFixitBag;
		let devices = await iFixitApi.get(`wikis/CATEGORY?limit=${limit}&offset=${offset}`).then(response => {
			return Array.from(response.data, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
		});
		devices = this.filterIFiList(devices);
		if(devices.length === 0){
			cogoToast.error(`There were no more devices`);
			return 0;
		}
		localState.devices = [devices];
		localState.page = page;
	 	this.setState({iFixitBag: localState, searchString: ''});	
	}

	async handleSearch(text, offset, page, limit){
		let localState = this.state.iFixitBag;
		let devices = await iFixitApi.get(`search/${text}?filter=category&limit=${limit}&offset=${offset}`).then(response => {
			return Array.from(response.data.results, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
			});
		devices = this.filterIFiList(devices);
		if(devices.length === 0){
			cogoToast.error(`There are no more results for ${this.state.searchString}`);
			return 0;
		}
		localState.devices = [devices];
		localState.page = page;
	 	this.setState({iFixitBag: localState, searchString: text});	
	}
	
	selectDevice(item){
		this.setState({selectedItem : item});
	}

	handleIdCheck(val){
		const allGBDevices = this.state.grabBag.devices;
		const ans = allGBDevices.flat().some(device => val.id === device.id);
		if (ans) cogoToast.error(`The device ${val.display_title} is already in the user Grab Bag`);
		return ans;
	}

	redistributeDevices(stateDevices){
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
			this.handleGetDevicesList(offset, page, this.state.limit);
		}
		else{
			this.handleSearch(this.state.searchString, offset, page, this.state.limit);
		}	
	
	}

	onChange(sourceId, sourceIndex, targetIndex, targetId) {
		const sourceBag = this.state[sourceId];
		if( !targetId && !sourceId) return 0;
		
		if (targetId){
			const targetBag = this.state[targetId];
			if (targetId === "grabBag" && !this.handleIdCheck(sourceBag.devices[0][sourceIndex])){
				const result = move(
				    sourceBag.devices[0],
				    targetBag.devices[targetBag.page],
				    sourceIndex,
				    targetIndex
				  );
				
				let iFixitState = this.state.[sourceId];
				iFixitState.devices[0] = result[0];
				
				let grabBagState = this.state.[targetId];
				grabBagState.devices[grabBagState.page] = result[1];
				let newDevices = this.redistributeDevices(grabBagState.devices);
				grabBagState.devices = newDevices;
				console.log(grabBagState);
				return this.setState({[sourceId]: iFixitState, [targetId]: grabBagState});
		    	}
			else if (targetId === "iFixitBag"){
				const result = move(
				    sourceBag.devices[sourceBag.page],
				    targetBag.devices[0],
				    sourceIndex,
				    targetIndex
				  );
				
				const iFixitState = this.state[targetId];
				iFixitState.devices[0] = result[1];
				
				const grabBagState = this.state[sourceId];
				grabBagState.devices[grabBagState.page] = result[0];
					
				let newDevices = this.redistributeDevices(grabBagState.devices);
				if (Math.max(newDevices.length-1, 0) < grabBagState.page){
					grabBagState.page -=  1;
				}
				grabBagState.devices = newDevices;
				return this.setState({[sourceId]: grabBagState, [targetId]: iFixitState});

			}
			else if (targetId === "trash"){
				cogoToast.error('Only devices from the Grab Bag grid can be deleted');
			}
		}
		else{
			const sourceDevices = sourceBag.devices[sourceBag.page];
			const result = swap(sourceDevices, sourceIndex, targetIndex);
			let deepCopy = this.state[sourceId];
			deepCopy.devices[deepCopy.page] = result;
			return this.setState({[sourceId]: deepCopy});
		}
	    }

	filterIFiList(newDevices){
		let flatWikiIds = this.state.grabBag.devices.flat().map(device => {return device.id});
		return newDevices.filter(i => !flatWikiIds.includes(i.id));
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
						<button className="random-button" onClick={() => this.handleGetDevicesList(0, 0, this.state.limit)}>All Devices</button> 
					</div>
				</div>
				<Collection 
					iFixitBag={this.state.iFixitBag} 
					grabBag={this.state.grabBag}
					onChange={this.onChange}
					handleSubmit={this.handleSearch}
					changeGBPage={this.changeGBPage}
					changeIFIPage={this.changeIFIPage}
					selectDevice={this.selectDevice}
				/>
				<div className="selected">
					<div className="pager">Selected Device: {this.state.selectedItem.display_title}</div>
					{this.state.selectedItem.url &&
					<div className="inner-selected">
						<div className="pager">iFixit Link: </div>
						<a className="pager" href={this.state.selectedItem.url} target="_blank" rel="noreferrer"> Here</a>
					</div>
					}
				</div>
			</div>
		)
	}
}
export default GrabBag;
