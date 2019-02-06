import React, {Component} from 'react';
import {connect} from "react-redux";
import { frontloadConnect } from "react-frontload";
import {bindActionCreators} from "redux";
import {getBundle} from '../redux-action-creators'


const frontload = async props => {
  if (!props.loadedBundle) {
    await props.getBundle(props.resources);
  }
};

class RequiredBundleFrontload extends Component {
  render() {
    if (!this.props.loadedBundle) {
      return this.props.loading || null
    }

    return <React.Fragment>
      {this.props.children}
    </React.Fragment>

  }
}

function mapStateToProps(state) {
  return {
    loadedBundle: state.loadedBundle,
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ getBundle }, dispatch);
};


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(
    frontloadConnect(frontload)(RequiredBundleFrontload)
);
