import React from 'react'
import {connect} from "react-redux";
import {areListsEqual, fetchJson} from "../utils";
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";
import createHistory from 'history/createBrowserHistory'
import createMemoryHistory from 'history/createMemoryHistory'

export const ApiFormContext = React.createContext(() => {});

class ApiForm extends React.Component {
  constructor(props) {
    super(props);

    let fieldsData = undefined;

    if (props.initialFormData) {
      fieldsData = props.initialFormData
    } else {
      fieldsData = {};

      for (const field of this.props.fields) {
        fieldsData[field] = undefined
      }
    }

    this.fieldsData = fieldsData;
    this.history = process.browser ? createHistory() : createMemoryHistory();
  }

  componentDidUpdate(prevProps) {
    if (this.props.initialFormData && this.props.initialFormData !== prevProps.initialFormData) {
      this.fieldsData = this.props.initialFormData
    }
    // If the endpoint changed, update the form results, except if the form is
    // being managed by NextJS, in which case the updated search results should
    // be handled by our container
    if (!areListsEqual(this.props.endpoints, prevProps.endpoints) && !this.props.initialFormData) {
      this.updateSearchResults(this.props, false)
    }
  }

  isFormValid = () => {
    return Object.values(this.fieldsData).every(
      param => {
        return Boolean(param)
      });
  };

  handleFieldChange = (updatedFieldsData={}, pushUrl) => {
    // If the page was reset by a previous call from another field, do nothing
    if (updatedFieldsData.page && !pushUrl) {
      if (this.fieldsData.page && this.fieldsData.page.fieldValues.id === updatedFieldsData.page.fieldValues.id) {
        return
      }
    }

    this.fieldsData = {
      ...this.fieldsData,
      ...updatedFieldsData
    };


    if (!updatedFieldsData.page && pushUrl) {
      this.fieldsData.page = {
        apiParams: {},
        urlParams: {},
        fieldValues: {
          id: 1,
          name: ""}
      }
    }

    const formValues = {};

    for (const field of this.props.fields) {
      formValues[field] = this.fieldsData[field] ? this.fieldsData[field].fieldValues : undefined
    }

    this.props.onFormValueChange && this.props.onFormValueChange(formValues);
    this.props.onFormFieldsChange && this.props.onFormFieldsChange(this.fieldsData);

    if (!this.isFormValid()) {
      return;
    }

    if (this.props.requiresSubmit !== formValues.submit) {
      return
    }

    if (pushUrl || formValues.submit) {
      this.pushUrl(false)
    }

    if (!this.props.initialFormData) {
      this.updateSearchResults(this.props, formValues.submit);
    }
  };

  pushUrl = (ignoreSubmit=false) => {
    const props = this.props;

    let pageAndOrderingParams = '';

    if (props.page) {
      pageAndOrderingParams += `page=${props.page}&`
    }

    if (props.pageSize) {
      pageAndOrderingParams += `page_size=${props.pageSize}&`;
    }

    if (props.ordering) {
      pageAndOrderingParams += `ordering=${props.ordering}&`;
    }

    let urlSearch = '';

    for (const fieldName of Object.keys(this.fieldsData)) {
      if (fieldName === 'submit' && ignoreSubmit) {
        continue
      }

      for (const urlParamKey of Object.keys(this.fieldsData[fieldName].urlParams)) {
        for (const urlParamValue of this.fieldsData[fieldName].urlParams[urlParamKey]) {
          urlSearch += `${urlParamKey}=${urlParamValue}&`
        }
      }
    }

    const asRoute = window.location.pathname + '?' + urlSearch + pageAndOrderingParams;

    if (this.props.router) {
      let hrefRoute = this.props.router.route + '?';
      for (const key in this.props.router.query) {
        hrefRoute += `${key}=${this.props.router.query[key]}&`
      }
      hrefRoute += urlSearch + pageAndOrderingParams;
      this.props.router.push(hrefRoute, asRoute).then(() => {
        this.props.onPushUrl && this.props.onPushUrl();
      });
    } else {
      this.history.push(asRoute)
    }
  };

  static async getSearchResults(fieldsData, endpoints, fetchFunction) {
    let apiSearch = '';

    for (const fieldName of Object.keys(fieldsData)) {
      for (const apiParamKey of Object.keys(fieldsData[fieldName].apiParams)) {
        for (const apiParamValue of fieldsData[fieldName].apiParams[apiParamKey]) {
          apiSearch += `${apiParamKey}=${apiParamValue}&`
        }
      }
    }

    const promises = [];

    for (const endpoint of endpoints) {
      const separator = endpoint.indexOf('?') === -1 ? '?' : '&';
      const finalEndpoint = endpoint + separator + apiSearch;
      promises.push(fetchFunction(finalEndpoint));
    }

    return await Promise.all(promises)
  }

  updateSearchResults = async (props, pushUrlOnFinish) => {
    props.onResultsChange(null);
    const fetchFunction = props.anonymous ? fetchJson : props.fetchAuth;
    const searchResults = await ApiForm.getSearchResults(this.fieldsData, props.endpoints, fetchFunction);

    for (let i = 0; i < searchResults.length; i++) {
      const json = searchResults[i];

      const fieldValues = {};
      for (const fieldName of Object.keys(this.fieldsData)) {
        fieldValues[fieldName] = this.fieldsData[fieldName].fieldValues
      }

      props.onResultsChange({
        index: i,
        payload: json,
        fieldValues
      });
    }

    if (pushUrlOnFinish) {
      this.pushUrl(true)
    }
  };

  render() {
    return <ApiFormContext.Provider value={{handleFieldChange: this.handleFieldChange, history: this.history}}>
      <form>
        {this.props.children}
      </form>
    </ApiFormContext.Provider>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth
  }
}

export default connect(mapStateToProps)(ApiForm);