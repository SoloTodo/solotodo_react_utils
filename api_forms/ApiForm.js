import React, {Component} from 'react'
import './ApiForm.css'
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {areListsEqual} from "../utils";
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";

class ApiForm extends Component {
  constructor(props) {
    super(props);

    let fieldsData = {};

    for (const field of this.props.fields) {
      fieldsData[field] = undefined
    }

    this.fieldsData = fieldsData;
  }

  componentWillMount() {
    this.props.setFieldChangeHandler(this.handleFieldChange);
  }

  componentWillReceiveProps(nextProps) {
    if (!areListsEqual(this.props.endpoints, nextProps.endpoints)) {
      this.updateSearchResults()
    }
  }

  isFormValid = () => {
    return Object.values(this.fieldsData).every(
        param => {
          return Boolean(param)
        });
  };

  handleFieldChange = (updatedFieldsData={}, pushUrl) => {
    this.fieldsData = {
      ...this.fieldsData,
      ...updatedFieldsData
    };

    const formValues = {};

    for (const field of this.props.fields) {
      formValues[field] = this.fieldsData[field] ? this.fieldsData[field].fieldValues : undefined
    }

    this.props.onFormValueChange(formValues);

    if (!this.isFormValid()) {
      return;
    }

    this.updateSearchResults();

    if (pushUrl) {
      this.pushUrl()
    }

    // const allowSubmit = !this.props.requiresSubmit || formValues.submit;

    // if (wasValid) {
    //   this.pushUrl()
    // } else if (allowSubmit) {
    //   this.updateSearchResults();
    // }
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

    let urlSearch = '?';

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

    const newRoute = props.history.location.pathname + urlSearch + pageAndOrderingParams;
    props.history.push(newRoute)
  };

  updateSearchResults = () => {
    const props = this.props;
    props.onResultsChange(null);

    let apiSearch = '';

    for (const fieldName of Object.keys(this.fieldsData)) {
      for (const apiParamKey of Object.keys(this.fieldsData[fieldName].apiParams)) {
        for (const apiParamValue of this.fieldsData[fieldName].apiParams[apiParamKey]) {
          apiSearch += `${apiParamKey}=${apiParamValue}&`
        }
      }
    }

    let i = 0;
    for (const endpoint of props.endpoints) {
      const separator = endpoint.indexOf('?') === -1 ? '?' : '&';
      const loopIndex = i;

      const finalEndpoint = endpoint + separator + apiSearch;

      props.fetchAuth(finalEndpoint).then(json => {
        const fieldValues = {};
        for (const fieldName of Object.keys(this.fieldsData)) {
          fieldValues[fieldName] = this.fieldsData[fieldName].fieldValues
        }

        props.onResultsChange({
          index: loopIndex,
          payload: json,
          fieldValues
        });
      });

      i++;
    }

    if (props.requiresSubmit) {
      this.pushUrl(true)
    }
  };

  render() {
    return <form>
      {this.props.children}
    </form>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth
  }
}

export default withRouter(connect(mapStateToProps)(ApiForm));