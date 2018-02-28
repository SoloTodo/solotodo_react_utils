import React, {Component} from 'react'
import uniqBy from 'lodash/uniqBy'
import AxisChoice from './AxisChoice'

class AxisChoices extends Component {
  render() {
    const labelAndOrderingValues = this.props.pricingEntries.map(pricingEntry => (
      {
        labelValue: pricingEntry.product.specs[this.props.axis.labelField],
        orderingValue: pricingEntry.product.specs[this.props.axis.orderingField]
      }
    ));

    const uniqueLabelAndOrderingValues = uniqBy(labelAndOrderingValues, 'labelValue')
      .sort(function (productTuple1, productTuple2) {
        const value1 = productTuple1.orderingValue;
        const value2 = productTuple2.orderingValue;
        if (value1 < value2) {
          return -1;
        } else if (value1 > value2) {
          return 1;
        } else {
          return 0;
        }
      });

    const axesChoices = uniqueLabelAndOrderingValues.map(uniqueLabelAndOrderingValue => {
      // All the products that share the same spec of the uniqueLabelAndOrderingValue example: 'Astro Black' 1 or more
      const matchingAxisPricingEntries = this.props.pricingEntries.filter(pricingEntry => (
        pricingEntry.product.specs[this.props.axis.labelField] === uniqueLabelAndOrderingValue.labelValue
      ));

      // If this product is the selected by the choice
      const originalProductMatches = this.props.product.specs[this.props.axis.labelField] === uniqueLabelAndOrderingValue.labelValue;

      // A product that shares all the otherLabelFields with whe selected product
      const matchingAxisPricingEntry = matchingAxisPricingEntries.filter(pricingEntry => (
          this.props.otherLabelFields.every(labelField => pricingEntry.product.specs[labelField] === this.props.product.specs[labelField])
        ))[0] || null;

       // The path to the matchingAxisPricingEntry product if it exist
      const redirectUrl = matchingAxisPricingEntry && `/products/${matchingAxisPricingEntry.product.id}-${matchingAxisPricingEntry.product.slug}`;

      return {
        ...uniqueLabelAndOrderingValue,
        matchingAxisPricingEntries,
        originalProductMatches,
        redirectUrl
      }
    });
    return <div className="d-flex mb-3">
      <h3 className="mb-0 pb-1">{this.props.axis.label}: </h3>
      <div className="d-flex flex-wrap axis-choices ml-3">
        {
          axesChoices.map(choice => <AxisChoice {...choice} axis={this.props.axis} key={choice.labelValue}/>)
        }
      </div>
    </div>
  }
}

export default AxisChoices
