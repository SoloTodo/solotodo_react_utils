import React, { Component } from 'react';
import GoogleAnalytics from 'react-ga';

const withTracker = (WrappedComponent, options = {}, mapPropsToGAField) => {
  const trackPage = (page, props) => {
    let setParameters = {
      page,
      ...options,
    };

    if (mapPropsToGAField) {
      setParameters = {
        ...setParameters,
        ...mapPropsToGAField(props)
      }
    }

    GoogleAnalytics.set(setParameters);
    GoogleAnalytics.pageview(page);
  };

  return class HOC extends Component {
    componentDidMount() {
      const page = this.props.location.pathname;
      trackPage(page, this.props);
    }

    componentWillReceiveProps(nextProps) {
      const currentPage = this.props.location.pathname;
      const nextPage = nextProps.location.pathname;

      if (currentPage !== nextPage) {
        trackPage(nextPage, nextProps);
        setTimeout(function(){
          window.scrollTo(0, 0);
        }, 100);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

export default withTracker;
