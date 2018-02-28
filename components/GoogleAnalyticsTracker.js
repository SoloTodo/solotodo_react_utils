import React, { Component } from 'react';
import GoogleAnalytics from 'react-ga';

const withTracker = (WrappedComponent, options = {}, mapPropsToGAField) => {
  const trackPage = (page, props) => {
    const fullPath = page.pathname + page.search;
    
    let setParameters = {
      page: fullPath,
      ...options,
    };

    if (mapPropsToGAField) {
      setParameters = {
        ...setParameters,
        ...mapPropsToGAField(props)
      }
    }

    GoogleAnalytics.set(setParameters);
    GoogleAnalytics.pageview(fullPath);
  };

  return class HOC extends Component {
    componentDidMount() {
      const page = this.props.location;
      trackPage(page, this.props);
    }

    componentWillReceiveProps(nextProps) {
      const currentPage = this.props.location;
      const nextPage = nextProps.location;

      if (currentPage.key !== nextPage.key) {
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
