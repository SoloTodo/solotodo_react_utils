import React, {Component} from 'react'
import {connect} from "react-redux";
import {apiResourceStateToPropsUtils} from "../../ApiResource";
import {apiSettings} from "../../settings";

import './ProductTechSpecs.css'

class ProductTechSpecs extends Component {
  initialState = {
    specs: undefined
  };

  constructor(props) {
    super(props);
    this.state = {...this.initialState}
  }

  componentDidMount() {
    this.componentUpdate(this.props.product);
  }

  componentWillReceiveProps(nextProps) {
    const currentProduct = this.props.product;
    const nextProduct = nextProps.product;

    if (currentProduct.id !== nextProduct.id) {
      this.setState(this.initialState, () => this.componentUpdate(nextProduct));
    }
  }

  componentUpdate(product) {
    this.props.fetchAuth(`products/${product.id}/render/?purpose=${apiSettings.technicalSpecificationsPurposeId}&website=${this.props.websiteId}`).then(htmlResult => {
      this.setState({
        specs: htmlResult.result
      })
    }).catch(() => {
    })
  }

  formatSpecs = () => {
    return {__html: this.state.specs}
  };

  render() {
    if (!this.state.specs) {
      return this.props.loading || null;
    }

    return <div className="row" dangerouslySetInnerHTML={this.formatSpecs()}></div>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth
  }
}

export default connect(mapStateToProps)(ProductTechSpecs);
