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

    const availablePricingEntries = this.props.pricingEntries.filter(pricingEntry => pricingEntry.entities.length);

    const axesChoices = uniqueLabelAndOrderingValues.map(uniqueLabelAndOrderingValue => {
      const availableAxisPricingEntries = availablePricingEntries.filter(pricingEntry => (
        pricingEntry.product.specs[this.props.axis.labelField] === uniqueLabelAndOrderingValue.labelValue
      ));

      const originalProductMatches = this.props.product.specs[this.props.axis.labelField] === uniqueLabelAndOrderingValue.labelValue;

      const matchingAxisPricingEntry = availableAxisPricingEntries.filter(pricingEntry => (
          this.props.otherLabelFields.every(labelField => pricingEntry.product.specs[labelField] === this.props.product.specs[labelField])
        ))[0] || null;

      const redirectUrl = matchingAxisPricingEntry && `/products/${matchingAxisPricingEntry.product.id}`;

      return {
        ...uniqueLabelAndOrderingValue,
        availableAxisPricingEntries,
        originalProductMatches,
        redirectUrl
      }
    });
    return <div className="mb-3">
      <h3 className="mb-0 pb-1">{this.props.axis.label}</h3>
      <div className="d-flex flex-wrap axis-choices">
        {
          axesChoices.map(choice => <AxisChoice {...choice} axis={this.props.axis} key={choice.labelValue}/>)
        }
      </div>
    </div>
  }
}

export default AxisChoices
