import React from "react";
import {
	  GridContextProvider,
	  GridDropZone,
	  GridItem,
	  swap,
	  move
} from "react-grid-dnd";
import "./App.css";

function App(props) {
	  const [items, setItems] = React.useState({
		      iFixitDevices: props.iFixitDevices,
		      grabBag: props.grabBag 
		    });

	  return (
		      <GridContextProvider onChange={props.onChange}>
		        <div className="container">
		          <GridDropZone
		            className="dropzone iFixitDevices"
		            id="iFixitDevices"
		            boxesPerRow={4}
		            rowHeight={70}
		          >
		            {items.iFixitDevices.map(item => (
				                <GridItem key={item.name}>
				                  <div className="grid-item">
				                    <div className="grid-item-content">
				                      {item.name[0].toUpperCase()}
				                    </div>
				                  </div>
				                </GridItem>
				              ))}
		          </GridDropZone>
		          <GridDropZone
		            className="dropzone grabBag"
		            id="grabBag"
		            boxesPerRow={4}
		            rowHeight={70}
		          >
		            {items.grabBag.map(item => (
				                <GridItem key={item.name}>
				                  <div className="grid-item">
				                    <div className="grid-item-content">
				                      {item.name[0].toUpperCase()}
				                    </div>
				                  </div>
				                </GridItem>
				              ))}
		          </GridDropZone>
		        </div>
		      </GridContextProvider>
		    );
}
export default App;
