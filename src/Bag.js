import React from "react";
import { GridDropZone, GridItem } from "react-grid-dnd";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

class Bag extends React.Component {
  constructor(props) {
    super(props);

    this.imageClick = this.imageClick.bind(this);
    this.switchBagPageDown = this.switchBagPageDown.bind(this);
    this.switchBagPageUp = this.switchBagPageUp.bind(this);
  }

  imageClick(item) {
    this.props.selectDevice(item);
  }

  switchBagPageDown() {
    this.props.changeBagPage(-1);
  }

  switchBagPageUp() {
    this.props.changeBagPage(+1);
  }

  render() {
    return (
      <div className="device-bag">
        <GridDropZone
          className={`dropzone ${this.props.bagName}`}
          id={this.props.bagName}
          boxesPerRow={4}
          rowHeight={70}
        >
          {this.props.bagDevices.map((item) => (
            <GridItem key={item.id}>
              <div className="grid-item">
                <img
                  className="grid-item-content grid-item-image"
                  src={item.image}
                  alt={item.display_name}
                  onClick={() => this.imageClick(item)}
                />
              </div>
            </GridItem>
          ))}
        </GridDropZone>
        <div className="pager">
          <button onClick={this.switchBagPageDown}>
            <FiChevronLeft />
          </button>
          <span>Page {this.props.bagPage + 1}</span>
          <button onClick={this.switchBagPageUp}>
            <FiChevronRight />
          </button>
        </div>
      </div>
    );
  }
}

export default Bag;
