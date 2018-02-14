import React, {Component} from 'react'
import './ApiForm.css'
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {areListsEqual, listToObject} from "../utils";
import {addApiResourceStateToPropsUtils} from "../ApiResource";

class ApiForm extends Component {
  constructor(props) {
    super(props);

    this.state = this.defaultState();
    this.handleFieldChange = this.handleFieldChange.bind(this);
  }

  componentWillMount() {
    this.props.setFieldChangeHandler(this.handleFieldChange);
    this.unlisten = this.props.history.listen(this.handleHistoryChange);
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentWillReceiveProps(nextProps) {
    const currentObservedObjects = this.props.observedObjects || [];

    const currentObservedObjectsDict = listToObject(currentObservedObjects, 'id');
    const nextObservedObjectsDict = listToObject(nextProps.observedObjects || [], 'id');

    const commonObservedObjectIds = currentObservedObjects
        .filter(object => currentObservedObjectsDict[object.id] && nextObservedObjectsDict[object.id])
        .map(object => object.id);

    const changedObjects = [];

    for (const commonObservedObjectId of commonObservedObjectIds) {
      const currentObject = currentObservedObjectsDict[commonObservedObjectId];
      const nextObject = nextObservedObjectsDict[commonObservedObjectId];

      if (currentObject[this.props.observedObjectsField] !== nextObject[this.props.observedObjectsField]) {
        changedObjects.push({
          currentObject: currentObject,
          nextObject: nextObject
        });
      }
    }

    if (!areListsEqual(this.props.endpoints, nextProps.endpoints)) {
      this.updateSearchResults(nextProps);
    }

    if (changedObjects.length) {
      this.props.onObservedObjectChange(changedObjects);
      this.updateSearchResults();
    }
  }

  handleHistoryChange = (location, action) => {
    this.props.onResultsChange(null);
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

  handleFieldChange = (updatedFieldsData={}, updateOnFinish=false) => {
    let wasValid = undefined;
    let isValid = undefined;

    this.setState(state => {
      wasValid = this.isFormValid(state);

      const newState = {
        ...state,
        ...updatedFieldsData
      };

      if (updateOnFinish && !Object.keys(updatedFieldsData).includes('page') && this.props.fields.includes('page')) {
        newState.page = {
          apiParams: {page: [1]},
          urlParams: {page: [1]},
          fieldValues: {id: 1, name: ''}
        }
      }

      isValid = this.isFormValid(newState);

      return newState
    }, () => {
      const formValues = {};

      for (const field of this.props.fields) {
        formValues[field] = this.state[field] ? this.state[field].fieldValues : undefined
      }

      this.props.onFormValueChange(formValues);

      const updateOnLoad = typeof(this.props.updateOnLoad) !== 'undefined' ? this.props.updateOnLoad : true;

      if (!wasValid && isValid && updateOnLoad) {
        this.updateSearchResults();
      } else if (isValid && updateOnFinish) {
        this.pushUrl()
      }
    });
  };

  pushUrl = props => {
    props = props ? props : this.props;

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
      for (const urlParamKey of Object.keys(this.state[fieldName].urlParams)) {
        for (const urlParamValue of this.state[fieldName].urlParams[urlParamKey]) {
          urlSearch += `${urlParamKey}=${urlParamValue}&`
        }
      }
    }

    const newRoute = props.history.location.pathname + urlSearch + pageAndOrderingParams;
    props.history.push(newRoute)
  };

  updateSearchResults = (props=null) => {
    props = props ? props : this.props;
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
  };

  render() {
    return <form>
      {this.props.children}
    </form>
  }
}

export default withRouter(connect(addApiResourceStateToPropsUtils())(ApiForm));