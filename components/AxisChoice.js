import React, {Component} from 'react'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody
} from "reactstrap";
import {Link} from "react-router-dom";

import './AxisChoice.css'

class AxisChoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otherVariantsModalIsActive: false
    }
  }

  otherVariantsModalToggle = () => {
    this.setState({
      otherVariantsModalIsActive: !this.state.otherVariantsModalIsActive
    })
  };

  render() {
    if (this.props.originalProductMatches) {
      return <span className="btn btn-primary active">
        {this.props.labelValue}
        </span>

    } else if (this.props.redirectUrl) {
      return <Link to={this.props.redirectUrl} className="btn btn-outline-primary">
        {this.props.labelValue}
      </Link>

    } else if (this.props.availableAxisPricingEntries.length) {
      if (this.props.axis.directLink) {
        return <Link to={`/products/${this.props.availableAxisPricingEntries[0].product.id}`}
                     className="btn btn-outline-primary">
          {this.props.labelValue}
        </Link>
      } else {
        return <div>
          <Button onClick={this.otherVariantsModalToggle} className="btn btn-outline-primary">
            {this.props.labelValue}
          </Button>
          <Modal isOpen={this.state.otherVariantsModalIsActive} toggle={this.otherVariantsModalToggle}
                 id="variants-modal">
            <ModalHeader>
              Producto exacto no disponible
            </ModalHeader>
            <ModalBody>
              <div className="row">
                <div className="col-12">
                  <p>Te mostramos variantes en {this.props.axis.label} {this.props.labelValue} que sí están disponibles
                    para compra:</p>
                  {
                    this.props.availableAxisPricingEntries.map(pricingEntry => (
                      <p key={pricingEntry.product.id}>
                        <Link to={`/products/${pricingEntry.product.id}`}>
                          {pricingEntry.product.name}
                        </Link>
                      </p>))
                  }
                </div>
              </div>
            </ModalBody>
          </Modal>
        </div>
      }
    }
    return <Button outline disabled>{this.props.labelValue}</Button>
  }
}

export default AxisChoice
