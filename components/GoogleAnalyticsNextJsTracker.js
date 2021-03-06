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

    componentDidUpdate(prevProps) {
      const prevPage = splitUrl ? prevProps.router.asPath.split('?')[0] : prevProps.router.asPath ;
      const currentPage = splitUrl ? this.props.router.asPath.split('?')[0] : this.props.router.asPath;

      if (currentPage !== prevPage) {
        trackPageHandler(this.props);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

export default withTracker;
