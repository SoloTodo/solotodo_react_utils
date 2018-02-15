import React, {Component} from 'react';
import {registerLead} from "../utils";
import {settings} from "../settings";

class LeadLink extends Component {
  render() {
    let url = undefined;
    let target = undefined;

    if (this.props.entity.store.id === settings.linioStoreId) {
      let separator = null;
      if (this.props.entity.externalUrl.indexOf('?') === -1) {
        separator = '?';
      } else {
        separator = '&'
      }

      const intermediateUrl = `${this.props.entity.externalUrl}${separator}utm_source=affiliates&utm_medium=hasoffers&utm_campaign=${settings.linioAffiliateId}&aff_sub=`;

      url = `https://linio.go2cloud.org/aff_c?offer_id=18&aff_id=${settings.linioAffiliateId}&url=${encodeURIComponent(intermediateUrl)}`;
      target = '_self';
    } else {
      url = this.props.entity.externalUrl;
      target = '_blank';
    }

    return <a href={url} target={target} className="price-container" rel="noopener nofollow"
              onClick={() => registerLead(this.props.authToken, this.props.websiteId, this.props.entity)}>
      {props.children}
    </a>
  }
}

export default LeadLink;