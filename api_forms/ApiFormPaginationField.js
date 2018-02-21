import React, {Component} from 'react'
import ReactPaginate from 'react-paginate';
import queryString from 'query-string';
import {connect} from "react-redux";

class ApiFormPaginationField extends Component {
  componentWillMount() {
    this.componentUpdate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.componentUpdate(nextProps)
  }

  componentUpdate = props => {
    const newValue = this.parseValueFromUrl(props);

    if (!props.page || props.page.id !== newValue) {
      this.notifyNewParams(newValue, props);
    }
  };

  parseValueFromUrl = () => {
    const parameters = queryString.parse(window.location.search);
    let value = parseInt(parameters['page'], 10);

    if (Number.isNaN(value)) {
      return 1
    }

    return value
  };

  notifyNewParams(value, props) {
    props = props ? props : this.props;

    if (!props.onChange) {
      return;
    }

    const params = {};

    if (value) {
      params['page'] = [value]
    }

    const result = {
      page: {
        apiParams: params,
        urlParams: params,
        fieldValues: {id: value, name: ''}
      }
    };

    props.onChange(result)
  }


  onPageChange = (selection) => {
    this.notifyNewParams(selection.selected + 1, this.props)
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

    let page = 1;
    if (this.props.page) {
      page = this.props.page.id
    }

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

export default connect(mapStateToProps)(ApiFormPaginationField)
