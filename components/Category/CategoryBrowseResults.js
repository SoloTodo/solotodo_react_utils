import React, {Component} from 'react';
import CategoryBrowseResult from "./CategoryBrowseResult";
import './CategoryBrowseResults.css'

export default class CategoryBrowseResults extends Component {
  render() {
    if (!this.props.results.results.length) {
      return <div className="category-browse-no-results">No se han encontrado resultados</div>
    }

    return <div>
      <div className="card-block d-flex justify-content-between flex-wrap category-browse-results">
        {this.props.results.results.map(product => (
            <CategoryBrowseResult
                key={product.bucket}
                bucket={product}
                priceFormatter={this.props.priceFormatter}
                websiteId={this.props.websiteId}
                categoryBrowseParams={this.props.categoryBrowseParams}
            />
        ))}

        <div className="category-browse-dummy">&nbsp;</div>
        <div className="category-browse-dummy">&nbsp;</div>
        <div className="category-browse-dummy">&nbsp;</div>
        <div className="category-browse-dummy">&nbsp;</div>
        <div className="category-browse-dummy">&nbsp;</div>
      </div>
    </div>
  }
}