import React, {Component} from 'react';
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils
} from "../../ApiResource";
import ProductNormalPricesTable from "./ProductNormalPricesTable"
import ProductCellPricesTable from "./ProductCellPricesTable"
import {areObjectListsEqual, formatCurrency} from "../../utils";
import {apiSettings} from "../../settings";


class ProductPricesTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entities: undefined
    }
  }

  componentDidMount() {
    this.componentUpdate(this.props.stores, this.props.product);
  }

  componentWillReceiveProps(nextProps) {
    const oldPreferredStores = this.props.stores;
    const newPreferredStores = nextProps.stores;

    const oldProduct = this.props.product;
    const newProduct = nextProps.product;

    if (!areObjectListsEqual(oldPreferredStores, newPreferredStores) || oldProduct.id !== newProduct.id) {
      this.setState({
        entities: undefined
      }, () => {
        this.componentUpdate(newPreferredStores, newProduct);
      });
    }
  }

  componentUpdate = (stores, product) => {
    let storesUrl = '';
    for (let store of stores) {
      storesUrl += '&stores=' + store.id;
    }

    this.props.fetchAuth(`products/available_entities/?ids=${product.id}${storesUrl}`).then(availableEntities => {
      let entities = availableEntities.results[0].entities.filter(entity => entity.active_registry.cell_monthly_payment === null);

      this.props.addEntities(entities);

      entities = entities.map(entity => this.props.ApiResourceObject(entity));

      if (this.props.setCheapestEntity) {
        this.props.setCheapestEntity(entities[0] || null);
      }

      this.setState({
        entities
      });
    })
  };

  render() {
    if (!this.state.entities) {
      return this.props.loading || null
    }

    const PricesTableComponent = this.props.product.category.id === apiSettings.cellPhoneCategoryId ?
        ProductCellPricesTable :
        ProductNormalPricesTable;

    const countryLocale = this.props.ApiResourceObject(this.props.countryLocale);
    const numberFormat = countryLocale.numberFormat;
    const conversionCurrency = countryLocale.currency;

    const priceFormatter = (value, currency) => {
      return formatCurrency(value, currency, conversionCurrency, numberFormat.thousandsSeparator, numberFormat.decimalSeparator)
    };

    return <PricesTableComponent entities={this.state.entities} countryLocale={this.props.countryLocale} leadLinkComponent={this.props.leadLinkComponent} priceFormatter={priceFormatter}/>
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject, fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    ApiResourceObject,
    fetchAuth
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addEntities: apiResourceObjects => {
      return dispatch({
        type: 'addApiResourceObjects',
        apiResourceObjects: apiResourceObjects
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductPricesTable);
