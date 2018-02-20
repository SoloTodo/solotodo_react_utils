import React, {Component} from 'react'

import './CategoryBrowseResult.css'
import {apiSettings} from "../../settings";
import {connect} from "react-redux";
import {
  addApiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../ApiResource";
import {Link} from "react-router-dom";
import Select from 'react-select';
import Img from 'react-image'
import Spinner from 'react-spinkit';


class CategoryBrowseResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedProductEntry: props.bucket.product_entries[0],
      techSpecsHtml: undefined
    }
  }

  componentDidMount() {
    this.updateSelectedProductEntryTechSpecs();
  }

  updateSelectedProductEntryTechSpecs = () => {
    const product = this.state.selectedProductEntry.product;

    this.props.fetchAuth(`${product.url}render/?purpose=${apiSettings.categoryBrowseResultPurposeId}&website=${this.props.websiteId}`).then(htmlResult => {
      this.setState({
        techSpecsHtml: htmlResult.result
      })
    }).catch(() => {})
  };

  formatTechSpecs = () => {
    if (this.state.techSpecsHtml) {
      return {__html: this.state.techSpecsHtml}
    } else {
      return {__html: ''}
    }
  };

  handleVariantChange = evt => {
    const newSelectedProductEntry = this.props.bucket.product_entries.filter(entry => entry.product.url === evt.value)[0];
    this.setState({
      selectedProductEntry: newSelectedProductEntry,
    });
  };

  render() {
    const productEntries = this.props.bucket.product_entries;

    const selectedProductEntry = this.state.selectedProductEntry;
    const product = selectedProductEntry.product;
    const pricingData = selectedProductEntry.prices[0];

    const currency = this.props.ApiResourceObject(this.props.currencies.filter(currency => currency.url === pricingData.currency)[0]);
    const offerPrice = parseFloat(pricingData.min_offer_price);

    const formattedPrice = this.props.priceFormatter(offerPrice, currency);

    const productUrl = `/products/${product.id}-${product.slug}`;

    const params = this.props.categoryBrowseParams || {};
    const bucketProductLabelField = params.bucketProductLabelField || 'unicode';


    return <div className="d-flex flex-column category-browse-result">
      <h3><Link to={productUrl}>{product.name}</Link></h3>
      <div className="image-container d-flex flex-column justify-content-center">
        <Link to={productUrl}>
          <Img src={`${product.url}picture/?width=300&height=300`}
               alt={product.name}
               loader={<Spinner name="line-scale" />}
          />
        </Link>
      </div>

      <div className="description-container" dangerouslySetInnerHTML={this.formatTechSpecs()}></div>

      <div className="d-flex flex-row justify-content-between align-items-center mt-auto pt-2">
        <div className="price flex-grow">
          <Link to={productUrl}>{formattedPrice}</Link>
        </div>

        {productEntries.length > 1 && <div className="variant-selector flex-grow">
          <Select
            value={product.url}
            onChange={this.handleVariantChange}
            options={productEntries.map(entry => ({value: entry.product.url, label: entry.product.specs[bucketProductLabelField] }))}
            searchable={false}
            clearable={false}
          />
        </div>
        }
      </div>
    </div>
  }
}

function mapStateToProps(state, ownProps) {
  return {
    category: state.apiResourceObjects[ownProps.bucket.product_entries[0].product.category],
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
  }
}

export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps))(CategoryBrowseResult);