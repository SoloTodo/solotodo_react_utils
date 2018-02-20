import React, {Component} from 'react';
import {
  apiResourceStateToPropsUtils,
  filterApiResourceObjectsByType
} from "../../ApiResource";
import {connect} from "react-redux";
import ApiForm from "../../api_forms/ApiForm";
import ApiFormPaginationField from "../../api_forms/ApiFormPaginationField";
import CategoryBrowseResults from "../Category/CategoryBrowseResults";
import ApiFormTextField from "../../api_forms/ApiFormTextField";
import {formatCurrency} from "../../utils";

class ProductSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiFormFieldChangeHandler: undefined,
      formValues: {},
      productsPage: undefined,
      resultsAggs: {}
    };
  }

  setApiFormFieldChangeHandler = apiFormFieldChangeHandler => {
    this.setState({
      apiFormFieldChangeHandler
    })
  };

  handleFormValueChange = formValues => {
    this.setState({formValues})
  };

  setProductsPage = json => {
    if (json) {
      this.setState({
        productsPage: {
          count: json.payload.count,
          results: json.payload.results
        },
        resultsAggs: json.payload.aggs
      })
    } else {
      // Only reset the actual results to keep the old filter aggregations
      this.setState({
        productsPage: null,
      })
    }
  };

  render() {
    let endpoint = `products/browse/?ordering=relevance&page_size=${this.props.resultsPerPage}`;
    for (const store of this.props.stores) {
      endpoint += '&stores=' + store.id
    }

    const products = this.state.productsPage || null;

    this.props.setTitle(this.state.formValues.search);

    const countryLocale = this.props.ApiResourceObject(this.props.countryLocale);
    const numberFormat = countryLocale.numberFormat;
    const conversionCurrency = countryLocale.currency;

    const priceFormatter = (value, currency) => {
      return formatCurrency(value, currency, conversionCurrency, numberFormat.thousandsSeparator, numberFormat.decimalSeparator)
    };

    const Loading = this.props.loading;

    return <ApiForm
        endpoints={[endpoint]}
        fields={['page', 'search']}
        onResultsChange={this.setProductsPage}
        onFormValueChange={this.handleFormValueChange}
        setFieldChangeHandler={this.setApiFormFieldChangeHandler}>
      <div className="row pt-3">
        <div className="col-12">
          <h1>Resultados de la búsqueda</h1>
          <p><span className="font-weight-bold">Palabras clave:</span> {this.state.formValues.search}</p>

          <ApiFormTextField
              name="search"
              placeholder="Palabras clave"
              onChange={this.state.apiFormFieldChangeHandler}
              value={this.state.formValues.search}
              debounceTimeout={this.props.isExtraSmall ? 2000 : 500}
              hidden={true}
          />

          <div className="content-card">
            {products ? <CategoryBrowseResults
                results={products}
                page={this.state.formValues.page}
                priceFormatter={priceFormatter}
                websiteId={this.props.websiteId}/>
                : <Loading type="light" />
            }

            <div className="d-flex category-browse-pagination justify-content-around mt-2 mb-3">
              <ApiFormPaginationField
                  page={this.state.formValues.page}
                  pageSize={{id: this.props.resultsPerPage}}
                  resultCount={this.state.productsPage && this.state.productsPage.count}
                  onChange={this.state.apiFormFieldChangeHandler}
                  previousLabel="Anterior"
                  nextLabel="Siguiente"
              />
            </div>
          </div>
        </div>
      </div>
    </ApiForm>
  }
}

function mapStateToProps(state) {
  const {ApiResourceObject} = apiResourceStateToPropsUtils(state);

  return {
    ApiResourceObject,
    currencies: filterApiResourceObjectsByType(state.apiResourceObjects, 'currencies'),
    isExtraSmall: state.breakpoint.isExtraSmall
  }
}

export default connect(
    mapStateToProps)(ProductSearch);