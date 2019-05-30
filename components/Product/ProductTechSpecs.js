import React, {Component} from 'react'
import {connect} from "react-redux";
import Handlebars from "handlebars/dist/handlebars.min";

import {filterApiResourceObjectsByType} from "../../ApiResource";
import {apiSettings} from "../../settings";

import './ProductTechSpecs.css'
import {convertIdToUrl} from "../../utils";

class ProductTechSpecs extends Component {
  formatSpecs = () => {
    let html = '';
    if (this.props.template) {
      html = this.props.template(this.props.product.specs)
    }

    return {__html: html}
  };

  render() {
    return <div className="row" dangerouslySetInnerHTML={this.formatSpecs()}></div>
  }
}

function mapStateToProps(state, ownProps) {
  const categoryTemplates = filterApiResourceObjectsByType(state.apiResourceObjects, 'category_templates');
  const templateWebsiteUrl = convertIdToUrl(ownProps.websiteId, 'websites');
  const categoryUrl = ownProps.product.categoryUrl || ownProps.product.category;

  let template = categoryTemplates.filter(categoryTemplate => {
    return categoryTemplate.category === categoryUrl &&
        categoryTemplate.purpose === apiSettings.detailPurposeUrl &&
        categoryTemplate.website === templateWebsiteUrl
  })[0] || null;

  if (template) {
    template = Handlebars.compile(template.body);
  }

  return {
    template
  }
}

export default connect(mapStateToProps)(ProductTechSpecs);
