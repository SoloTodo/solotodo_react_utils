import React, {Component} from 'react';
import { connect } from 'react-redux'
import { toast } from 'react-toastify';
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";
import {apiSettings} from "../settings";
import {Redirect} from "react-router-dom";

class ResourceObjectPermission extends Component {
  componentDidMount() {
    this.componentUpdate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps);
  }

  componentUpdate(props) {
    if (!props.apiResourceObject) {
      const id = props.match.params.id;
      props.fetchApiResourceObject(props.resource, id, props.dispatch).catch(err => {
        toast.error("Este objeto no existe o no tienes permisos para acceder a el", {
          autoClose: false
        });
      })
    }
  }

  hasPermission = () => {
    const permission = this.props.permission;

    if (!permission) {
      return true
    }

    const apiResourceObject = this.props.ApiResourceObject(this.props.apiResourceObject);

    if (typeof permission === 'function') {
      return permission(apiResourceObject)
    } else {
      return apiResourceObject.permissions.includes(permission)
    }
  };

  render = () => {
    const apiResourceObject = this.props.apiResourceObject;

    if (!apiResourceObject) {
      // Object is currently fetching or resource endpoints have not been loaded
      return this.props.loading || null
    } else if (!this.hasPermission()) {
      toast.error("Este objeto no existe o no tienes permisos para acceder a el", {
        autoClose: false
      });
      return <Redirect to="/" />
    } else {
      const Component = this.props.component;

      return <Component {...this.props} />
    }
  }
}

function mapStateToProps(state, ownProps) {
  const {ApiResourceObject, fetchApiResourceObject} = apiResourceStateToPropsUtils(state);

  const id = ownProps.match.params.id;
  const resource = ownProps.resource;
  const apiResourceObjectUrl = `${apiSettings.apiResourceEndpoints[resource]}${id}/`;

  return {
    apiResourceObject: state.apiResourceObjects[apiResourceObjectUrl],
    fetchApiResourceObject,
    ApiResourceObject,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps)(ResourceObjectPermission);