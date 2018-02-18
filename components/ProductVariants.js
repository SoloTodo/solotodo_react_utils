import React, {Component} from 'react'
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";
import {connect} from "react-redux";
import AxisChoices from "./AxisChoices";


class ProductVariants extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pricingEntries: undefined
    }
  }

  componentDidMount() { //TODO add willReceiveProps para las tiendas
    const product = this.props.product;
    let bucketUrl = `products/${product.id}/bucket/?`;

    for (const field of this.props.fields) {
      bucketUrl += `fields=${field}&`
    }

    this.props.fetchAuth(bucketUrl).then(products => {
      let pricingEntriesUrl = `products/available_entities/?`;

      for (const product of products) {
        pricingEntriesUrl += `ids=${product.id}&`;
      }

      for (const store of this.props.preferredStores) {
        pricingEntriesUrl += `stores=${store.id}&`
      }

      this.props.fetchAuth(pricingEntriesUrl).then(response => (
          //TODO filtar cellMonthyPayment == null
          this.setState({
            pricingEntries: response.results
          })
      ))
    });


  }

  render() {
    if (!this.state.pricingEntries) {
      return null
    }

    const filteredAxes = this.props.axes.filter(axis => {
      return (new Set(this.state.pricingEntries.map(pricingEntry => pricingEntry.product.specs[axis.labelField]))).size > 1
    });

    if (!filteredAxes.length) {
      return null
    }

    const allLabelFields = this.props.axes.map(axis => axis.labelField);

    return <div className={this.props.className}>
      {
        filteredAxes.map(axis => (
            <AxisChoices axis={axis}
                         product={this.props.product}
                         pricingEntries={this.state.pricingEntries}
                         otherLabelFields={allLabelFields.filter(labelField => labelField !== axis.field)}
            />
        ))
      }
    </div>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth
  }
}

export default connect(mapStateToProps)(ProductVariants);
