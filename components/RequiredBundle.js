import React, {Component} from 'react';
import {connect} from "react-redux";
import {
  apiResourceStateToPropsUtils,
} from "../ApiResource";
import {apiSettings} from "../settings";
import {fetchAuth} from '../utils';


class RequiredBundle extends Component {
  componentDidMount() {
    this.componentUpdate(this.props.resources, this.props.loadedBundle, this.props.authToken)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps.resources, nextProps.loadedBundle, nextProps.authToken);
  }

  componentUpdate(requiredResources, loadedBundle, authToken) {
    if (loadedBundle) {
      return
    }

    let url = `${apiSettings.endpoint}resources/?`;

    for (const requiredResource of requiredResources) {
      url += `names=${requiredResource}&`;
    }
    
    fetchAuth(authToken, url).then(bundle => {
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
  const {authToken} = apiResourceStateToPropsUtils(state);

  return {
    authToken,
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
