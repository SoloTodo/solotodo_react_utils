import React, {Component} from 'react';
import {connect} from "react-redux";
import Loading from "./Loading";
import {
  addApiResourceDispatchToPropsUtils,
  addApiResourceStateToPropsUtils
} from "../ApiResource";

class RequiredResources extends Component {
  constructor(props) {
    super(props);
    this.resourcesLoading = [];
  }

  componentDidMount() {
    this.componentUpdate(this.props.resources, this.props.loadedResources)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps.resources, nextProps.loadedResources);
  }

  componentUpdate(requiredResources, loadedResources) {
    for (const requiredResource of requiredResources) {
      if (!loadedResources.includes(requiredResource) && !this.resourcesLoading.includes(requiredResource)) {
        this.resourcesLoading.push(requiredResource);
        this.props.fetchApiResource(requiredResource, this.props.dispatch).then(() => {
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
        return <Loading />
      }

      additionalChildProps[requiredResource] = this.props.filterApiResourceObjectsByType(requiredResource);
    }

    // May or may not be, in the worst case it wil be "undefined"
    additionalChildProps.apiResourceObject = this.props.apiResourceObject;

    return React.cloneElement(React.Children.only(this.props.children), {...additionalChildProps});
  }
}

let mapStateToProps = (state) => {
  return {
    loadedResources: state.loadedResources,
  }
};


export default connect(
    addApiResourceStateToPropsUtils(mapStateToProps),
    addApiResourceDispatchToPropsUtils())(RequiredResources);
