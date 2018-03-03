import React, {Component} from 'react'
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../ApiResource";
import {apiSettings} from "../../settings";

import './ProductTechSpecs.css'
import Handlebars from "handlebars/dist/handlebars.min";

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
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  const categoryTemplates = filterApiResourceObjectsByType(state.apiResourceObjects, 'category_templates');
  const templateWebsiteUrl = apiSettings.apiResourceEndpoints.websites + ownProps.websiteId + '/';

  let template = categoryTemplates.filter(categoryTemplate => {
    return categoryTemplate.category === ownProps.product.categoryUrl &&
        categoryTemplate.purpose === apiSettings.detailPurposeUrl &&
        categoryTemplate.website === templateWebsiteUrl
  })[0] || null;

  if (template) {
    template = Handlebars.compile(template.body);
  }

  return {
    fetchAuth,
    template
  }
}

export default connect(mapStateToProps)(ProductTechSpecs);
