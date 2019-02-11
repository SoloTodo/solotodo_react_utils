import React, {Component} from 'react';
import { connect } from 'react-redux'
import {
  apiResourceStateToPropsUtils
} from "../ApiResource";
import {apiSettings} from "../settings";
import {Redirect} from "react-router-dom";

class ResourceObjectPermission extends Component {
  constructor(props) {
    super(props);

    this.state = {
      done: Boolean(props.apiResourceObject),
      deleted: false,
    }
  }

  componentDidMount() {
    if (this.props.apiResourceObject) {
      return
    }

    const apiResourceObjectId = this.props.match.params.id;
    const resource = this.props.resource;

    this.componentUpdate(apiResourceObjectId, resource)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.apiResourceObject) {
      if (!this.state.done) {
        this.setState({done: true})
      }

      return;
    }

    if (this.props.apiResourceObject && !nextProps.apiResourceObject) {
      console.log('Object deleted');
      this.setState({
        deleted: true
      })
    }

    const currenctApiResourceObjectId = this.props.match.params.id;
    const nextApiResourceObjectId = nextProps.match.params.id;

    const currentResource = this.props.resource;
    const nextResource = nextProps.resource;

    if (currenctApiResourceObjectId !== nextApiResourceObjectId || currentResource !== nextResource) {
      this.setState({done: false}, () => this.componentUpdate(nextApiResourceObjectId, nextResource));
    }
  }

  componentUpdate(apiResourceObjectId, resource) {
    this.props.fetchApiResourceObject(resource, apiResourceObjectId, this.props.dispatch, this.props.anonymous).catch(err => {}).then(json => {
      this.setState({done: true})
    })
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
    if (this.state.deleted) {
      return <Redirect to={this.props.onDelete}/>
    }
    const apiResourceObject = this.props.apiResourceObject;

    if (!this.state.done) {
      // Object is currently fetching
      return this.props.loading || null
    } else if (!apiResourceObject || !this.hasPermission()) {
      const Http404 = this.props.Http404;
      return <Http404 />
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