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
			count: 0,
			iFixitDevices: [],
			grabBag: []

		};
		this.onChange = this.onChange.bind(this);
 	 }
	 

	async componentDidMount(){
		const devices = await this.getDeviceList('5', '5');
		this.setState({iFixitDevices: devices})
	}

	async getDeviceList(page, limit){
		return iFixitApi.get(`wikis/CATEGORY?limit=${limit}&offset=${page}`).then(response => {
			return Array.from(response.data, device => {return { 'display_title': device.display_title, 'id': device.wikiid, 'image': device.image.standard}}); 
		});
	
	}

	 onChange(sourceId, sourceIndex, targetIndex, targetId) {
		console.log(sourceId, ' ', sourceIndex , ' ', targetIndex, ' ', targetId);
		if (targetId) {
			if (targetId !== "iFixitDevices" && this.state[targetId].indexOf(this.state[sourceId][sourceIndex]) === -1){
				const result = move(
					    this.state[sourceId],
					    this.state[targetId],
					    sourceIndex,
					    targetIndex
					  );

				return this.setState({
				    [targetId]: result[1]
				  });
			    }
			    else{
				console.log("Move not allowed");
			    }
			  
		}
		else{
			const result = swap(this.state[sourceId], sourceIndex, targetIndex);
			console.log(result)
			return this.setState({
			    [sourceId]: result
			  });
		}
	    }

	render(){
		console.log(this.state);
		return (
			<div>
				<Collection 
					iFixitDevices={this.state.iFixitDevices} 
					grabBag={this.state.grabBag}
					onChange={this.onChange}
				/>
				<button onClick={() => console.log(this.state)}>
				  Click me
				</button>
			</div>
		)
	}




}
export default GrabBag;
