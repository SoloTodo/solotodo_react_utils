import React, {Component} from 'react';
import {connect} from "react-redux";
import {apiResourceStateToPropsUtils} from "../../ApiResource";
import {apiSettings} from "../../settings";
import {formatCurrency} from '../../utils';
import {Link} from 'react-router-dom';

import './ShortDescriptionProduct.css';

class ShortDescriptionProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shortDescriptionHtml: undefined
    }
  }

  componentDidMount() {
    this.componentUpdate(this.props.productEntry.product)
  }

  componentWillReceiveProps(nextProps) {
    const currentProductEntry = this.props.productEntry;
    const nextProductEntry = nextProps.productEntry;

    if (currentProductEntry.product.id !== nextProductEntry.product.id) {
      this.setState({shortDescriptionHtml: undefined}, () => {
        this.componentUpdate(nextProductEntry.product)
      });
    }
  }

  componentUpdate(product) {
    this.props.fetchAuth(`products/${product.id}/render/?purpose=${apiSettings.shortDescriptionPurposeId}&website=${this.props.websiteId}`).then(htmlResult => {
      this.setState({
        shortDescriptionHtml: htmlResult.result
      })
    }).catch(() => {
    })
  }

  formatShortDescription = () => {
    return {__html: this.state.shortDescriptionHtml}
  };

  render() {
    const countryLocale = this.props.ApiResourceObject(this.props.preferredCountry);
    const numberFormat = countryLocale.numberFormat;

    const firstPrice = this.props.ApiResourceObject(this.props.productEntry.prices[0]);

    const formattedPrice = formatCurrency(
      firstPrice.minOfferPrice, firstPrice.currency,
      countryLocale.currency, numberFormat.thousandsSeparator,
      numberFormat.decimalSeparator);

    const product = this.props.productEntry.product;
    const productUrl = '/products/' + product.id + '-' + product.slug;

    return <Link to={productUrl} className="short-description-product d-flex flex-column ">
      <div className="image-container">
        <img src={`https://api.solotodo.com/products/${product.id}/picture/?width=300&height=200`} alt={product.name}/>
      </div>
      <div className="name-container">
        {product.name}
      </div>
      {this.state.shortDescriptionHtml &&
      <div className="description-container" dangerouslySetInnerHTML={this.formatShortDescription()}></div>}

      <div className="price-container mt-auto">
        {formattedPrice}
      </div>
    </Link>
  }
}


function mapStateToProps(state) {
  const {ApiResourceObject, fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    ApiResourceObject,
    fetchAuth,
  }
}

export default connect(mapStateToProps)(ShortDescriptionProduct)