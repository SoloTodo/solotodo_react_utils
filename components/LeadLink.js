import React from 'react';
import {registerLead} from "../utils";
import {apiSettings} from "../settings";

class LeadLink extends React.Component {
  handleClick = () => {
    registerLead(this.props.authToken, this.props.websiteId, this.props.entity);
    if (this.props.callback) {
      this.props.callback();
    }
  };

  render() {
    const { entity, store, soicosPrefix } = this.props;
    let url = undefined;
    let target = undefined;

    if (store.id === apiSettings.linioStoreId) {
      let separator = null;
      if (entity.external_url.indexOf('?') === -1) {
        separator = '?';
      } else {
        separator = '&'
      }

      const intermediateUrl = `${entity.external_url}${separator}utm_source=affiliates&utm_medium=hasoffers&utm_campaign=${apiSettings.linioAffiliateId}&aff_sub=`;

      url = `https://linio.go2cloud.org/aff_c?offer_id=18&aff_id=${apiSettings.linioAffiliateId}&url=${encodeURIComponent(intermediateUrl)}`;
      target = '_top';
    } else if (store.id === apiSettings.abcdinStoreId) {
      url = `https://ad.soicos.com/-149x?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}`;
      target = '_top'
    } else if (store.id === apiSettings.parisStoreId) {
      url = `https://ad.soicos.com/-149A?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}`;
      target = '_top'
    } else if (store.id === apiSettings.ripleyStoreId) {
      url = `https://ad.soicos.com/-149I?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}`;
      target = '_top'
    } else if (store.id === apiSettings.falabellaStoreId) {
      url = `https://ad.soicos.com/-14Zg?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}`;
      target = '_top'
    } else {
      url = entity.external_url;
      target = '_blank';
    }

    return <a href={url} target={target} className={this.props.className || ''} rel="noopener nofollow"
              onMouseDown={this.handleClick}>
      {this.props.children}
    </a>
  }
}

export default LeadLink;
