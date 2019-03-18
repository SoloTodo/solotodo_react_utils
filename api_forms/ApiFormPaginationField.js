import React, {Component} from 'react'
import ReactPaginate from 'react-paginate';
import queryString from 'query-string';
import {connect} from "react-redux";
import createHistory from 'history/createBrowserHistory'
import {addContextToField} from "./utils";

class ApiFormPaginationField extends Component {
  constructor(props) {
    super(props);

    const initialValue = this.parseValueFromUrl(props);

    this.state = {
      value: initialValue
    };

    this.notifyNewParams(initialValue, props, false);
  }

  setValue(newValue, props, pushUrl=false) {
    props = props || this.props;

    if (this.state.value !== newValue) {
      this.setState({
        value: newValue
      }, () => this.notifyNewParams(newValue, props, pushUrl))
    }
  }

  componentDidMount() {
    const history = createHistory();
    this.unlisten = history.listen(() => this.componentUpdate());
  }

  componentWillUnmount() {
    this.unlisten();
  }

  componentUpdate = props => {
    props = props || this.props;

    const newValue = this.parseValueFromUrl(props);
    this.setValue(newValue, props);
  };

  parseValueFromUrl = props => {
    const search = props.router ? props.router.asPath.split('?')[1] : window.location.search;
    const parameters = queryString.parse(search);
    let value = parseInt(parameters['page'], 10);

    if (Number.isNaN(value)) {
      return 1
    }

    return value
  };

  notifyNewParams(value, props, pushUrl) {
    props = props ? props : this.props;

    const params = {};

    if (value && value !== 1) {
      params['page'] = [value]
    }

    const result = {
      page: {
        apiParams: params,
        urlParams: params,
        fieldValues: {id: value, name: ''}
      }
    };

    props.onChange(result, pushUrl)
  }

  onPageChange = (selection) => {
    this.setValue(selection.selected + 1, this.props, true)
  };

  render() {
    if (!this.props.resultCount) {
      return null
    }

    const pageRangeDisplayed = this.props.isExtraSmall ? 2 : 3;
    const marginPagesDisplayed = this.props.isExtraSmall ? 1 : 2;

    let pageCount = 1;
    if (this.props.pageSize) {
      pageCount = Math.ceil(this.props.resultCount / this.props.pageSize.id);
    }

    const page = this.state.value || 1;

    const previousLabel = this.props.previousLabel || <span>&lsaquo;</span>;
    const nextLabel = this.props.nextLabel || <span>&rsaquo;</span>;

    return <ReactPaginate
        forcePage={page - 1}
        pageCount={pageCount}
        pageRangeDisplayed={pageRangeDisplayed}
        marginPagesDisplayed={marginPagesDisplayed}
        containerClassName="pagination"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        activeClassName="active"
        previousClassName="page-item"
        nextClassName="page-item"
        previousLinkClassName="page-link"
        nextLinkClassName="page-link"
        disabledClassName="disabled"
        hrefBuilder={page => `?page=${page}`}
        onPageChange={this.onPageChange}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
    />
  }
}

function mapStateToProps(state) {
  return {
    isExtraSmall: state.browser.is.extraSmall,
  }
}

const ApiFormPaginationFieldWithContext = addContextToField(ApiFormPaginationField);
export default connect(mapStateToProps)(ApiFormPaginationFieldWithContext)
