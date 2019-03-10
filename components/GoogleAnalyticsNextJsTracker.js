import React from 'react';

const withTracker = (WrappedComponent, trackPageHandler, splitUrl=false) => {
  return class HOC extends React.Component {
    static async getInitialProps(ctx) {
      if (WrappedComponent.getInitialProps) {
        return WrappedComponent.getInitialProps(ctx)
      }

      return {}
    }

    componentDidMount() {
      trackPageHandler(this.props);
    }

    componentWillReceiveProps(nextProps) {
      const currentPage = splitUrl ? this.props.router.asPath.split('?')[0] : this.props.router.asPath ;
      const nextPage = splitUrl ? nextProps.router.asPath.split('?')[0] : nextProps.router.asPath;

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
