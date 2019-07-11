import React from 'react';
import {registerLead} from "../utils";
import {apiSettings} from "../settings";

import uuidv5 from "uuid/v5"
import AppContext from "./Context"

class LeadLink extends React.Component {
  handleClick = uuid => {
    registerLead(this.props.authToken, this.props.websiteId, this.props.entity, uuid);
    if (this.props.callback) {
      this.props.callback(uuid);
    }
  };

  generateUrl = namespace => {
    const { entity, store, soicosPrefix } = this.props;
    let uuid;
    let urlSuffix = '';
    if (namespace) {
      uuid = uuidv5(entity.active_registry.id.toString(), namespace);
      urlSuffix = `_${uuid}`
    }

    let url = undefined;
    let target = undefined;

    if (this.props.targetUrl) {
      url = this.props.targetUrl;
      target = '_blank';
    } else if (store.id === apiSettings.linioStoreId) {
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
      url = `https://ad.soicos.com/-149x?dl=${encodeURIComponent(this.props.entity.externalUrl)}`;
      target = '_self'
    } else if (store.id === apiSettings.parisStoreId) {
      url = `https://ad.soicos.com/-149A?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else if (store.id === apiSettings.ripleyStoreId) {
      url = `https://ad.soicos.com/-149I?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else if (store.id === apiSettings.lenovoChileStoreId) {
      url = `https://ad.soicos.com/-15Dd?dl=${encodeURIComponent(this.props.entity.externalUrl)}`;
      target = '_self'
    } else if (store.id === apiSettings.laPolarStoreId) {
      url = `https://ad.soicos.com/-16OM?dl=${encodeURIComponent(this.props.entity.externalUrl)}`;
      target = '_self'
    } else if (store.id === apiSettings.hitesStoreId) {
      url = `https://ad.soicos.com/-16ON?dl=${encodeURIComponent(this.props.entity.externalUrl)}`;
      target = '_self'
    } else if (store.id === apiSettings.panafotoId) {
      url = entity.external_url + '?utm_source=LG&utm_medium=wheretobuy';
      target = '_blank'
    } else {
      url = entity.external_url;
      target = '_blank';
    }

    return {
      href: url,
      target,
      onMouseDown: () => this.handleClick(uuid)
    };
  };

  render() {

    return <AppContext.Consumer>
      {context =>
        <a {...this.generateUrl(context && context.namespace)} className={this.props.className || ''} rel="noopener nofollow">
          {this.props.children}
        </a>}
    </AppContext.Consumer>
  }
}

export default LeadLink;
