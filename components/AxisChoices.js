import React, {Component} from 'react'
import uniqBy from 'lodash/uniqBy'

export default class AxisChoices extends Component {
  render() {
    const labelAndOrderingValues = this.props.pricingEntries.map(pricingEntry => (
      {
        labelValue: pricingEntry.product.specs[this.props.axis.labelField],
        orderingValue: pricingEntry.product.specs[this.props.axis.orderingField]
      }
    ));

    const uniqueLabelAndOrderingValues = uniqBy(labelAndOrderingValues, 'labelValue')
      .sort(function (product1, product2) {
        const value1 = product1.orderingValue;
        const value2 = product2.orderingValue;
        if (value1 < value2) {
          return -1;
        } else if (value1 > value2) {
          return 1;
        } else {
          return 0;
        }
      });

    const axesChoices = uniqueLabelAndOrderingValues.map(uniqueLabelAndOrderingValue => {
      const availablePricingEntries = this.props.pricingEntries.filter(pricingEntry => {
        if (pricingEntry.product.specs[this.props.axis.labelField] === uniqueLabelAndOrderingValue.labelValue) {
          return pricingEntry.entities.length
        }
      });

      const matchingProduct = this.props.product.specs[this.props.axis.labelField] === uniqueLabelAndOrderingValue.labelValue

      return {
        ...uniqueLabelAndOrderingValue,
        availablePricingEntries,
        matchingProduct
      }
    });

    console.log(axesChoices)

    return <h1>{this.props.axis.label}</h1>
  }
}