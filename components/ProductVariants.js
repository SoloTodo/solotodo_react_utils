import React, {Component} from 'react'
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";
import {connect} from "react-redux";
import AxisChoices from "./AxisChoices";
import {areObjectsEqual, areObjectListsEqual} from "../utils";


class ProductVariants extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pricingEntries: undefined
    }
  }

  componentDidMount() {
    this.componentUpdate(this.props.preferredStores, this.props.product, this.props.fields);
  }

  componentWillReceiveProps(nextProps) {
    const oldPreferredStores = this.props.preferredStores;
    const newPreferredStores = nextProps.preferredStores;

    const oldProduct = this.props.product;
    const newProduct = nextProps.product;

    if (!areObjectListsEqual(oldPreferredStores, newPreferredStores) || !areObjectsEqual(oldProduct, newProduct)) {
      this.setState({
        pricingEntries: undefined
      }, () => {
        this.componentUpdate(newPreferredStores, newProduct, nextProps.fields);
      });
    }
  }

  componentUpdate = (stores, product, fields) => {
    let bucketUrl = `products/${product.id}/bucket/?fields=${fields}`;

    this.props.fetchAuth(bucketUrl).then(products => {
      let pricingEntriesUrl = `products/available_entities/?`;

      for (const product of products) {
        pricingEntriesUrl += `ids=${product.id}&`;
      }

      for (const store of stores) {
        pricingEntriesUrl += `stores=${store.id}&`
      }

      this.props.fetchAuth(pricingEntriesUrl).then(response => {
        const filteredEntries = response.results.map(pricingEntry => (
          {
            product: pricingEntry.product,
            entities: pricingEntry.entities.filter(entity => entity.active_registry.cell_monthly_payment === null)
          }
        )).filter(pricingEntry => pricingEntry.entities.length);
        this.setState({
          pricingEntries: filteredEntries
        })
      })
    });
  };


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

    return <div className={this.props.className} id={this.props.id}>
      <div className="content-card">
      {
        filteredAxes.map(axis => (
          <AxisChoices axis={axis}
                       product={this.props.product}
                       pricingEntries={this.state.pricingEntries}
                       otherLabelFields={allLabelFields.filter(labelField => labelField !== axis.labelField)}
                       key={axis.label}
          />
        ))
      }
      </div>
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
