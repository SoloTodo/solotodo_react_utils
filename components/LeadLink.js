import React, {Component} from 'react';
import {registerLead} from "../utils";
import {apiSettings} from "../settings";

class LeadLink extends Component {
  handleClick = () => {
    registerLead(this.props.authToken, this.props.websiteId, this.props.entity);
    if (this.props.callback) {
      this.props.callback();
    }
  };

  render() {
    let url = undefined;
    let target = undefined;

    if (this.props.entity.store.id === apiSettings.linioStoreId) {
      let separator = null;
      if (this.props.entity.externalUrl.indexOf('?') === -1) {
        separator = '?';
      } else {
        separator = '&'
      }

      const intermediateUrl = `${this.props.entity.externalUrl}${separator}utm_source=affiliates&utm_medium=hasoffers&utm_campaign=${apiSettings.linioAffiliateId}&aff_sub=`;

      url = `https://linio.go2cloud.org/aff_c?offer_id=18&aff_id=${apiSettings.linioAffiliateId}&url=${encodeURIComponent(intermediateUrl)}`;
      target = '_self';
    } else {
      url = this.props.entity.externalUrl;
      target = '_blank';
    }

    if(this.props.className) {
      return <a href={url} target={target} className={this.props.className} rel="noopener nofollow"
              onMouseDown={this.handleClick}>
      {this.props.children}
    </a>
    }
    return <a href={url} target={target} rel="noopener nofollow"
              onMouseDown={this.handleClick}>
      {this.props.children}
    </a>
  }
}

export default LeadLink;

/*
needed props {
  entity: ApiResource Entity
  websiteId: the id of the website using the component
  authToken: (optional) authToken for the api
  className: (optional) a className for the <a> tag
  callback: (optional) a callback to execute on click
}
 */