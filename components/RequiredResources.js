import React, {Component} from 'react';
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils,
} from "../ApiResource";

class RequiredResources extends Component {
  constructor(props) {
    super(props);
    this.resourcesLoading = [];
  }

  componentDidMount() {
    this.componentUpdate(this.props.resources, this.props.loadedResources, this.props.authToken)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps.resources, nextProps.loadedResources, nextProps.authToken);
  }

  componentUpdate(requiredResources, loadedResources, authToken) {
    for (const requiredResource of requiredResources) {
      if (!loadedResources.includes(requiredResource) && !this.resourcesLoading.includes(requiredResource)) {
        this.resourcesLoading.push(requiredResource);
        this.props.fetchApiResource(requiredResource, this.props.dispatch, authToken).then(() => {
          this.resourcesLoading = this.resourcesLoading.filter(resource => resource !== requiredResource)
        })
      }
    }
  }

  render() {
    const additionalChildProps = {};

    const requiredResources = this.props.resources || [];

    for (let requiredResource of requiredResources) {
      if (!this.props.loadedResources.includes(requiredResource)) {
        return this.props.loading || null
      }

      additionalChildProps[requiredResource] = this.props.filterApiResourceObjectsByType(requiredResource);
    }

    if (this.props.render) {
      return this.props.render(additionalChildProps);
    } else {
      return <div>
        {this.props.children}
      </div>
    }

    // return React.cloneElement(React.Children.only(this.props.children), {...additionalChildProps});
  }
}

function mapStateToProps(state) {
  const {authToken, fetchApiResource, filterApiResourceObjectsByType} = apiResourceStateToPropsUtils(state);

  return {
    authToken,
    fetchApiResource,
    filterApiResourceObjectsByType,
    loadedResources: state.loadedResources,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}


export default connect(
    mapStateToProps,
    mapDispatchToProps)(RequiredResources);
