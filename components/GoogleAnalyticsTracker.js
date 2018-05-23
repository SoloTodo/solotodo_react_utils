import React, { Component } from 'react';

const withTracker = (WrappedComponent, trackPageHandler) => {
  return class HOC extends Component {
    componentDidMount() {
      trackPageHandler(this.props);
    }

    componentWillReceiveProps(nextProps) {
      const currentPage = this.props.location;
      const nextPage = nextProps.location;

      if (currentPage.key !== nextPage.key) {
        trackPageHandler(nextProps);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

export default withTracker;
