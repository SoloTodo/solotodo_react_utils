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

  handleClick = () => {
    // TODO: This condition is for ignoring registering leads on harcoded stores. Ideally it should be removed soon
    if (Number.isInteger(this.props.entity.id)) {
      registerLead(this.props.authToken, this.props.websiteId, this.props.entity, this.state.uuid);
    }

    if (this.props.callback) {
      this.props.callback(this.state.uuid);
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
    } else if (store.id === apiSettings.linioStoreId) {
      let separator = null;
      if (entity.external_url.indexOf('?') === -1) {
        separator = '?';
      } else {
        separator = '&'
      }

      const deeplinkPath = 'cl/' + entity.external_url.split('.cl/')[1]
      const linioUrlWithUtm = `${entity.external_url}${separator}utm_source=affiliates&utm_medium=hasoffers&utm_campaign=${apiSettings.linioAffiliateId}&aff_sub=`;
      const go2CloudUrl = `https://linio.go2cloud.org/aff_c?offer_id=18&aff_id=${apiSettings.linioAffiliateId}&url=${encodeURIComponent(linioUrlWithUtm)}`;
      url = `https://ej28.adj.st/${deeplinkPath}?adjust_t=cz1j0l_5px5hy&adjust_campaign=2900&adjust_deeplink=linio%3A%2F%2F${encodeURIComponent(deeplinkPath)}&adjust_fallback=${encodeURIComponent(go2CloudUrl)}&adjust_redirect=${encodeURIComponent(go2CloudUrl)}`
      target = '_top';
    } else if (store.id === apiSettings.abcdinStoreId) {
      url = `https://ad.soicos.com/-149x?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else if (store.id === apiSettings.parisStoreId) {
      url = `https://ad.soicos.com/-149A?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
      // } else if (store.id === apiSettings.ripleyStoreId || store.id === apiSettings.mercadoRipleyStoreId) {
      //   url = `https://ad.soicos.com/-149I?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      //   target = '_top'
    } else if (store.id === apiSettings.lenovoChileStoreId) {
      url = `https://ad.soicos.com/-15Dd?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
      // } else if (store.id === apiSettings.laPolarStoreId) {
      //   url = `https://ohmyad.com/redirect/?cid=d41e71430c&url=${encodeURIComponent(entity.external_url)}`
      //   target = '_top'
    // } else if (store.id === apiSettings.womStoreId) {
    //   url = `https://ohmyad.com/redirect/?cid=0ff71c16e6&url=${encodeURIComponent(entity.external_url)}`
    //   target = '_top'
    // } else if (store.id === apiSettings.tiendaClaroStoreId) {
    //   url = `https://ohmyad.com/redirect/?cid=678b9f9f48&url=${encodeURIComponent(entity.external_url)}`
    //   target = '_top'
    } else if (store.id === apiSettings.reuseStoreId) {
      url = `https://ad.soicos.com/-1i2E?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    // } else if (store.id === apiSettings.hitesStoreId) {
    //   url = `https://ad.soicos.com/-16ON?dl=${encodeURIComponent('https://www.hites.com/')}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
    //   target = '_top'
    } else if (store.id === apiSettings.hpOnlineStoreId) {
      url = `https://www.awin1.com/cread.php?awinmid=15305&awinaffid=641001&clickref=&p=%5B%5B${encodeURIComponent(entity.external_url)}%5D%5D`;
      target = '_self'
    } else if (store.id === apiSettings.falabellaStoreId) {
     url = `https://ad.soicos.com/-1gD6?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
     target = '_self'
    // } else if (store.id === apiSettings.huaweiShopStoreId) {
    //   url = `https://ad.soicos.com/-1cEy?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
    //   target = '_top'
    // } else if (store.id === apiSettings.tottusStoreId) {
    //   url = `https://ad.soicos.com/-1dVX?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
    //   target = '_top'
    } else if (store.id === apiSettings.entelStoreId || store.id === apiSettings.tiendaEntelStoreId) {
      url = `https://ad.soicos.com/-1eK1?dl=${encodeURIComponent(entity.external_url)}&trackerID=${soicosPrefix || ''}${entity.active_registry.id}${urlSuffix}`;
      target = '_top'
    } else {
      url = entity.external_url;
      target = '_blank';
    }

    return {
      href: url,
      target,
      onClick: this.handleClick,
      onAuxClick: this.handleClick
    };
  };

  render() {
    return <a {...this.generateUrl()} className={this.props.className || ''} rel="noopener nofollow">
      {this.props.children}
    </a>
  }
}

export default LeadLink;
