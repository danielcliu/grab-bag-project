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
		this.selectDevice = this.selectDevice.bind(this);
 		this.handleGetDeviceList = this.handleGetDeviceList.bind(this); 
		this.resetSearch = this.resetSearch.bind(this);
	}
	 
	async componentDidMount(){
		let newIFixitState = await this.handleGetDeviceList('', 0, this.state.iFixitBag.page, []);
		this.setState({iFixitBag: newIFixitState});
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

	// makes the api call to get the iFixit Devices	
	async handleGetDeviceList(text, offset, page, pageDevices){
		let localState = this.state.iFixitBag;
		let newOffset = offset;
		let newDevices = pageDevices;
		while(newDevices.length < this.state.limit){
			let diff = this.state.limit - newDevices.length;
			let searchUrl = (text === '') ? `wikis/CATEGORY?limit=${diff}&offset=${newOffset}` : `search/${text}?filter=category&limit=${diff}&offset=${newOffset}`;
			let devices = await iFixitApi.get(searchUrl).then(response => {
				let results = ( text === '') ? response.data : response.data.results;
				return Array.from(results, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard, 'url': device.url}}); 
			});
			// if there was no response from the API
			if(devices.length === 0){
				// if we were trying to load an additional page
				if (page > this.state.iFixitBag.page){
					cogoToast.error(`There were no more devices`);
				}
				// or if its the first page and the page is blank already and its a search call
				else if (page === 0 && newDevices.length === 0 && text !== ''){
					cogoToast.error(`There were no results for ${text}`);
				}
				
				// if its a blank additional page and not a reset
				if (newDevices.length === 0 && page !== 0){
					return localState;
				}
				else{
					break;
				}
			}
			devices = this.filterIFiList(devices);
			newDevices.push(...devices);
			newOffset = newOffset + diff;
		}
		if (page === 0){
			localState.devices = [newDevices];
		}
		else if(localState.devices.length <= page){
			localState.devices.push(newDevices);
		}
		else{
			localState.devices[page] = newDevices;
		}
		localState.page = page;
		localState.offset = newOffset;
		
		return localState	
	}
	
	selectDevice(item){
		this.setState({selectedItem : item});
	}

	// filter out all devices from the iFixit Bag that are already in grab Bag
	filterIFiList(newDevices){
		let flatWikiIds = this.state.grabBag.devices.flat().map(device => {return device.id});
		
		return newDevices.filter(i => !flatWikiIds.includes(i.id));
	}

	// makes sure no page has more than state.limit items
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
		// if we are loading a page that hasn't been loaded yet
		if(page+1 > localState.devices.length){
			localState = await this.handleGetDeviceList(this.state.searchString, localState.offset, page, []);
		}
		// if this is the last loaded page in the list
		else if (page+1 === localState.devices.length && localState.devices[page].length !== this.state.limit){
			localState = await this.handleGetDeviceList(this.state.searchString, localState.offset, page, localState.devices[page]);
		}
		else{
			let newDevices = this.redistributeDevices(localState.devices);
			localState.devices = newDevices;
			localState.page = page;
		}
		this.setState({iFixitBag: localState});
	}
	
	async onChange(sourceId, sourceIndex, targetIndex, targetId) {
		const sourceBag = this.state[sourceId];
		if( !targetId && !sourceId) return 0;
		
		if (targetId){
			const targetBag = this.state[targetId];
			if (targetId === "grabBag"){
				const result = move(
				    sourceBag.devices[sourceBag.page],
				    targetBag.devices[targetBag.page],
				    sourceIndex,
				    targetIndex
				  );
				// setting new iFixit Bag
				let iFixitState = this.state.[sourceId];
				iFixitState.devices[sourceBag.page] = result[0];
				let newIFIDevices = this.redistributeDevices(iFixitState.devices);
				// if the object was the last one in the page we need to jump down a page
				if (Math.max(newIFIDevices.length-1, 0) < iFixitState.page){
					iFixitState.page -=  1;
				}
				iFixitState.devices = newIFIDevices;
				// load in devices to fill the page if its the last page
				if(iFixitState.page+1 === iFixitState.devices.length){
					iFixitState = await this.handleGetDeviceList(this.state.searchString, iFixitState.offset, iFixitState.page, iFixitState.devices[iFixitState.page]);
				}
				
				// setting new grab Bag
				let grabBagState = this.state.[targetId];
				grabBagState.devices[grabBagState.page] = result[1];
				let newGBDevices = this.redistributeDevices(grabBagState.devices);
				grabBagState.devices = newGBDevices;
				
				return this.setState({[sourceId]: iFixitState, [targetId]: grabBagState});
			}
			else if (targetId === "iFixitBag"){
				const result = move(
				    sourceBag.devices[sourceBag.page],
				    targetBag.devices[targetBag.page],
				    sourceIndex,
				    targetIndex
				  );
				// setting new iFixit Bag
				const iFixitState = this.state[targetId];
				iFixitState.devices[targetBag.page] = result[1];
				let newIFIDevices = this.redistributeDevices(iFixitState.devices);
				iFixitState.devices = newIFIDevices;
				
				// setting new grab Bag
				const grabBagState = this.state[sourceId];
				grabBagState.devices[grabBagState.page] = result[0];
				let newDevices = this.redistributeDevices(grabBagState.devices);
				// if the object was the last one in the page we need to jump down a page
				if (Math.max(newDevices.length-1, 0) < grabBagState.page){
					grabBagState.page -=  1;
				}
				grabBagState.devices = newDevices;
				
				return this.setState({[sourceId]: grabBagState, [targetId]: iFixitState});
			}
		}
		else{
			const sourceDevices = sourceBag.devices[sourceBag.page];
			const result = swap(sourceDevices, sourceIndex, targetIndex);
			let sourceState = this.state[sourceId];
			sourceState.devices[sourceState.page] = result;
			
			return this.setState({[sourceId]: sourceState});
		}
	    }

	async resetSearch(searchString){
		let iFixitState = this.state.iFixitBag;
		let newState = await this.handleGetDeviceList(searchString, 0, 0, [])
		iFixitState = newState
		this.setState({iFixitBag: iFixitState, searchString: searchString});
	}

	render(){
		return (
			<div>
				<div className="header">
					<div className="search">
						<label>
							<a href="https://www.ifixit.com/"><img className="logo-image" src="https://upload.wikimedia.org/wikipedia/commons/8/8e/IFixit_logo.svg" alt="iFixit"/></a>
						</label>
		      				<Search className="pager" handleSubmit={this.resetSearch}/>
						<button className="random-button" onClick={() => this.resetSearch('')}>All Devices</button> 
					</div>
				</div>
				<Collection 
					iFixitBag={this.state.iFixitBag} 
					grabBag={this.state.grabBag}
					onChange={this.onChange}
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
