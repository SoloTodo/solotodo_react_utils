import React from 'react';
import ApiForm from "./ApiForm";

class ApiFormNext extends React.Component {
  static async getInitialProps(props, formLayout) {

  }

  render() {
    return <ApiForm {...this.props} />
  }
}

export default ApiFormNext;