import React, {Component} from 'react';
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../ApiResource";
import {apiSettings} from "../../settings";
import {formatCurrency} from '../../utils';
import {Link} from 'react-router-dom';

import './ShortDescriptionProduct.css';
import Handlebars from "handlebars/dist/handlebars.min";

class ShortDescriptionProduct extends Component {
  formatShortDescription = () => {
    let html = '';
    if (this.props.template) {
      html = this.props.template(this.props.productEntry.product.specs)
    }

    return {__html: html}
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
      <div className="description-container" dangerouslySetInnerHTML={this.formatShortDescription()}></div>
      <div className="price-container mt-auto">
        {formattedPrice}
      </div>
    </Link>
  }
}


function mapStateToProps(state, ownProps) {
  const {ApiResourceObject, fetchAuth} = apiResourceStateToPropsUtils(state);

  const category_templates = filterApiResourceObjectsByType(state.apiResourceObjects, 'category_templates');
  const templateWebsiteUrl = apiSettings.apiResourceEndpoints.websites + ownProps.websiteId + '/';

  let template = category_templates.filter(categoryTemplate => {
    return categoryTemplate.category === ownProps.productEntry.product.category &&
        categoryTemplate.purpose === apiSettings.shortDescriptionPurposeUrl &&
        categoryTemplate.website === templateWebsiteUrl
  })[0] || null;

  if (template) {
    template = Handlebars.compile(template.body);
  }

  return {
    ApiResourceObject,
    fetchAuth,
    template
  }
}

export default connect(mapStateToProps)(ShortDescriptionProduct)