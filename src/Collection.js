import React from "react";
import { GridContextProvider } from "react-grid-dnd";
import "./App.css";
import Bag from "./Bag.js";

class Collection extends React.Component {
  render() {
    return (
      <div>
        <GridContextProvider onChange={this.props.onChange}>
          <div className="container">
            <div className="inner-container">
              <div className="title">iFixit Devices</div>
              <Bag
                bagName="iFixitBag"
                bagDevices={
                  this.props.iFixitBag.devices[this.props.iFixitBag.page]
                }
                bagPage={this.props.iFixitBag.page}
                changeBagPage={this.props.changeIFIPage}
                selectDevice={this.props.selectDevice}
              />
            </div>
            <div className="inner-container">
              <div className="title">Grab Bag</div>
              <Bag
                bagName="grabBag"
                bagDevices={this.props.grabBag.devices[this.props.grabBag.page]}
                bagPage={this.props.grabBag.page}
                changeBagPage={this.props.changeGBPage}
                selectDevice={this.props.selectDevice}
              />
            </div>
          </div>
        </GridContextProvider>
      </div>
    );
  }
}

export default Collection;
