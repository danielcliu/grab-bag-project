import React from 'react';
import App from './App';
import {
	  swap,
	  move
} from "react-grid-dnd";

class GrabBag extends React.Component{
	constructor(props) {
    		super(props);
    		this.state = {
			count: 0,
			iFixitDevices: [
				    { id: 1, name: "ben" },
				    { id: 2, name: "joe" },
				    { id: 3, name: "jason" },
				    { id: 4, name: "chris" },
				    { id: 5, name: "heather" },
				    { id: 6, name: "Richard" }
				  ],
			grabBag: [
				    { id: 7, name: "george" },
				    { id: 8, name: "rupert" },
				    { id: 9, name: "alice" },
				    { id: 10, name: "katherine" },
				    { id: 11, name: "pam" },
				    { id: 12, name: "katie" }
				  ]

		};
		this.onChange = this.onChange.bind(this);
 	 }

	 onChange(sourceId, sourceIndex, targetIndex, targetId) {
		console.log(sourceId, ' ', sourceIndex , ' ', targetIndex, ' ', targetId);
		console.log(this.state);
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
			return this.setState({
			    [sourceId]: result
			  });
		}
	    }

	render(){
		console.log(this.state);
		return (
			<div>
				<App 
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
