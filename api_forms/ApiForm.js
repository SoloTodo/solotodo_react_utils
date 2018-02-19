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

    this.state = this.defaultState();
  }

  componentWillMount() {
    this.props.setFieldChangeHandler(this.handleFieldChange);
    this.unlisten = this.props.history.listen(this.handleHistoryChange);
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentWillReceiveProps(nextProps) {
    if (!areListsEqual(this.props.endpoints, nextProps.endpoints)) {
      this.handleFieldChange(this.defaultState());
    }
  }

  handleHistoryChange = (location, action) => {
    this.handleFieldChange(this.defaultState());
  };


  defaultState = () => {
    let params = {};

    for (const field of this.props.fields) {
      params[field] = null
    }

    return params;
  };

  isFormValid = (state=null) => {
    state = state ? state : this.state;

    return Object.values(state).every(
        param => {
          return Boolean(param)
        });
  };

  handleFieldChange = (updatedFieldsData={}) => {
    let wasValid = undefined;
    let isValid = undefined;

    this.setState(state => {
      wasValid = this.isFormValid(state);

      const newState = {...state, ...updatedFieldsData};

      isValid = this.isFormValid(newState);

      return newState
    }, () => {
      const formValues = {};

      for (const field of this.props.fields) {
        formValues[field] = this.state[field] ? this.state[field].fieldValues : undefined
      }

      this.props.onFormValueChange(formValues);

      if (!isValid) {
        return;
      }

      const allowSubmit = !this.props.requiresSubmit || formValues.submit;

      if (wasValid) {
        this.pushUrl()
      } else if (allowSubmit) {
        this.updateSearchResults();
      }
    });
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

    for (const fieldName of Object.keys(this.state)) {
      if (fieldName === 'submit' && ignoreSubmit) {
        continue
      }

      for (const urlParamKey of Object.keys(this.state[fieldName].urlParams)) {
        for (const urlParamValue of this.state[fieldName].urlParams[urlParamKey]) {
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

    let apiSearch = '';

    for (const fieldName of Object.keys(this.state)) {
      for (const apiParamKey of Object.keys(this.state[fieldName].apiParams)) {
        for (const apiParamValue of this.state[fieldName].apiParams[apiParamKey]) {
          apiSearch += `${apiParamKey}=${apiParamValue}&`
        }
      }
    }

    let i = 0;
    for (const endpoint of props.endpoints) {
      const separator = endpoint.indexOf('?') === -1 ? '?' : '&';
      const loopIndex = i;

      const finalEndpoint = endpoint + separator + apiSearch + pageAndOrderingParams;

      props.fetchAuth(finalEndpoint).then(json => {
        const fieldValues = {};
        for (const fieldName of Object.keys(this.state)) {
          fieldValues[fieldName] = this.state[fieldName].fieldValues
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