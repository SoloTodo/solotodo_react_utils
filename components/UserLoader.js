import React, {Component} from 'react'
import {connect} from "react-redux";
import {apiSettings} from "../settings";
import {fetchAuth} from "../utils";

class UserLoader extends Component {
  componentDidMount() {
    this.componentUpdate(this.props.authToken);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.authToken !== nextProps.authToken) {
      this.componentUpdate(nextProps.authToken);
    }
  }

  componentUpdate(authToken) {
    if (!authToken) {
      return;
    }

    fetchAuth(authToken, apiSettings.ownUserUrl).then(
        user => {
          // Check if the token was invalid
          if (user.detail) {
            this.props.dispatch({
              type: 'setAuthToken',
              authToken: null
            });
          } else {
            this.props.dispatch({
              type: 'updateApiResourceObject',
              apiResourceObject: user
            });

            this.props.callback && this.props.callback(user);
          }
        }
    ).catch(err => {
      this.props.dispatch({
        type: 'setAuthToken',
        authToken: null
      });
    })
  }

  render() {
    if (this.props.authToken && !this.props.user) {
      return this.props.loading || null
    }

    return <div>
      {this.props.children}
    </div>
  }
}

function mapStateToProps(state) {
  return {
    authToken: state.authToken,
    user: state.apiResourceObjects[apiSettings.ownUserUrl] || null
  }
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserLoader);
