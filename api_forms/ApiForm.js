import React from 'react'
import './ApiForm.css'
import {connect} from "react-redux";
import {areListsEqual, fetchJson} from "../utils";
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";
import createHistory from 'history/createBrowserHistory'

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
  }

  componentWillReceiveProps(nextProps) {
    if (!areListsEqual(this.props.endpoints, nextProps.endpoints)) {
      this.updateSearchResults(nextProps, false)
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

    this.props.onFormValueChange(formValues);

    if (!this.isFormValid()) {
      return;
    }

    if (this.props.requiresSubmit !== formValues.submit) {
      return
    }

    if (pushUrl || formValues.submit) {
      this.pushUrl(false)
    }

    this.updateSearchResults(this.props, formValues.submit);
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

    if (this.props.onPushUrl) {
      this.props.onPushUrl(urlSearch + pageAndOrderingParams)
    } else {
      const newRoute = window.location.pathname + '?' + urlSearch + pageAndOrderingParams;
      const history = createHistory();
      history.push(newRoute)
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
    return <ApiFormContext.Provider value={this.handleFieldChange}>
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