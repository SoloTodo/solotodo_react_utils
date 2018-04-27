import React, {Component} from 'react';
import {connect} from "react-redux";
import {apiSettings} from "../settings";
import {fetchJson} from "../utils";

class RequiredBundle extends Component {
  componentDidMount() {
    this.componentUpdate(this.props.resources, this.props.loadedBundle)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps.resources, nextProps.loadedBundle);
  }

  componentUpdate(requiredResources, loadedBundle) {
    if (loadedBundle) {
      return
    }

    let url = `${apiSettings.endpoint}resources/?`;

    for (const requiredResource of requiredResources) {
      url += `names=${requiredResource}&`;
    }
    
    fetchJson(url).then(bundle => {
      this.props.addBundleToStore(bundle)
    })
  }

  render() {
    if (!this.props.loadedBundle) {
      return this.props.loading || null
    }

    if (this.props.render) {
      return this.props.render({});
    } else {
      return <div>
        {this.props.children}
      </div>
    }
  }
}

function mapStateToProps(state) {
  return {
    loadedBundle: state.loadedBundle,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    addBundleToStore: bundle => dispatch({
      type: 'addBundle',
      apiResourceObjects: bundle
    })
  }
}


export default connect(
    mapStateToProps,
    mapDispatchToProps)(RequiredBundle);
