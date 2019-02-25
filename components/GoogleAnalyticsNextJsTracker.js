import React from 'react';

const withTracker = (WrappedComponent, trackPageHandler) => {
  return class HOC extends React.Component {
    componentDidMount() {
      trackPageHandler(this.props);
    }

    componentWillReceiveProps(nextProps) {
      const currentPage = this.props.router.asPath;
      const nextPage = nextProps.router.asPath;

      if (currentPage !== nextPage) {
        trackPageHandler(nextProps);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

export default withTracker;