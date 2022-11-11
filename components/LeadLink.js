import React from 'react';
import {registerLead} from "../utils";
import {apiSettings} from "../settings";

import { v4 as uuidv4 } from 'uuid';

class LeadLink extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      uuid: null
    }
  }

  componentDidMount() {
    this.resetUuid();
  }

  resetUuid() {
    this.setState({
      uuid: uuidv4()
    })
  }

  handleClick = (evt) => {
    // TODO: This condition is for ignoring registering leads on harcoded stores. Ideally it should be removed soon
    if (Number.isInteger(this.props.entity.id)) {
      registerLead(this.props.authToken, this.props.websiteId, this.props.entity, this.state.uuid);
    }

    if (this.props.callback) {
      this.props.callback(this.state.uuid, evt);
    }

    // setTimeout(() => this.resetUuid(), 300);
  };

  generateUrl = () => {
    const { entity, store, soicosPrefix } = this.props;

    let urlSuffix = '';
    if (this.state.uuid) {
      urlSuffix = `_${this.state.uuid}`
    }

    let url = undefined;
    let target = undefined;

    if (this.props.targetUrl) {
      url = this.props.targetUrl;

      if (this.props.appendUuidToUrl) {
        url += '&uuid=' + this.state.uuid
      }

      target = '_blank';
    } else if (store.id === apiSettings.abcdinStoreId) {
      url = `https://ad.soicos.com/-149x?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else if (store.id === apiSettings.parisStoreId) {
      url = `https://ad.soicos.com/-149A?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else if (store.id === apiSettings.lenovoChileStoreId) {
      url = `https://ad.soicos.com/-15Dd?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else if (store.id === apiSettings.reuseStoreId) {
      url = `https://ad.soicos.com/-1i2E?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else if (store.id === apiSettings.fensaStoreId) {
      url = `https://ad.soicos.com/-1jF3?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else if (store.id === apiSettings.hpOnlineStoreId) {
      url = `https://www.awin1.com/cread.php?awinmid=15305&awinaffid=641001&clickref=&p=%5B%5B${encodeURIComponent(entity.external_url)}%5D%5D`;
      target = '_self'
    } else if (store.id === apiSettings.falabellaStoreId || store.id === apiSettings.sodimacStoreId || store.id === apiSettings.tottusStoreId) {
     url = `https://ad.soicos.com/-1gD6?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
     target = '_self'
    } else if (store.id === apiSettings.entelStoreId || store.id === apiSettings.tiendaEntelStoreId) {
      url = `https://ad.soicos.com/-1eK1?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else if (store.id === apiSettings.tiendaOficialLgId) {
     url = entity.external_url.replace('lg.com', 'lgonline.cl')
     target = '_blank'
    } else {
      url = entity.external_url;
      target = '_blank';
    }

    return {
      href: url,
      target,
    };
  };

  render() {
    return <a
        {...this.generateUrl()}
        className={this.props.className || ''}
        rel="noopener nofollow"
        onClick={this.handleClick}
        onAuxClick={this.handleClick}
    >
      {this.props.children}
    </a>
  }
}

export default LeadLink;
