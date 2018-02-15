import React, { Component } from 'react';
import {toast} from "react-toastify";
import {apiSettings} from "../settings";
import {connect} from "react-redux";
import {
  addApiResourceStateToPropsUtils
} from "../ApiResource";
import {Redirect} from "react-router-dom";

const resourceObjectPermission = (WrappedComponent, resource, permission=null) => {
  const HOC = class ResourceObjectPermission extends Component {
    componentDidMount() {
      this.componentUpdate(this.props)
    }

    componentWillReceiveProps(nextProps) {
      this.componentUpdate(nextProps);
    }

    componentUpdate(props) {
      if (!props.apiResourceObject) {
        const id = props.match.params.id;
        props.fetchApiResourceObject(resource, id, props.dispatch).catch(err => {
          toast.error("Este objeto no existe o no tienes permisos para acceder a el", {
            autoClose: false
          });
        })
      }
    }

    hasPermission = () => {
      if (!permission) {
        return true
      }

      if (typeof permission === 'function') {
        const convertedApiResourceObject = this.props.ApiResourceObject(this.props.apiResourceObject);
        return permission(convertedApiResourceObject)
      } else {
        return this.props.apiResourceObject.permissions.includes(permission)
      }
    };

    render = () => {
      if (!this.props.apiResourceObject) {
        // Object is currently fetching or resource endpoints have not been loaded
        return null
      } else if (!this.hasPermission()) {
        toast.error("Este objeto no existe o no tienes permisos para acceder a el", {
          autoClose: false
        });
        return <Redirect to="/" />
      } else {
        return <WrappedComponent {...this.props} />
      }
    }
  };

  function mapStateToProps(state, ownProps) {
    const utilProps = addApiResourceStateToPropsUtils()(state);

    const id = ownProps.match.params.id;
    const apiResourceObjectUrl = `${apiSettings.apiResourceEndpoints[resource]}${id}/`;

    return {
      apiResourceObject: state.apiResourceObjects[apiResourceObjectUrl],
      fetchApiResourceObject : utilProps.fetchApiResourceObject,
      ApiResourceObject : utilProps.ApiResourceObject,
    }
  }

  function mapDispatchToProps(dispatch) {
    return {
      dispatch
    }
  }

  return connect(
    mapStateToProps,
    mapDispatchToProps)(HOC);
};

export default resourceObjectPermission;
