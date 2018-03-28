import React, {Component} from 'react'
import StarRatingComponent from 'react-star-rating-component';
import {Link} from "react-router-dom";


export default class RatingStars extends Component {
  render() {
    if (!this.props.value) {
      return null;
    }

    const renderStarIcon = (startIndex, rating, name) => {
      const starsComponent = startIndex <= rating ? <i className="fas fa-star"></i> : <i className="far fa-star"></i>;

      if (this.props.linkUrl) {
        return <Link to={this.props.linkUrl} className="rating-stars">
          {starsComponent}
        </Link>
      } else {
        return <span className="rating-stars">
        {starsComponent}
      </span>
      }
    };

    const renderStarIconHalf = (nextValue, prevValue, name) => {
      const starsComponent = <span>
        <span style={{position: 'absolute'}}><i className="far fa-star" /></span>
        <span><i className="fas fa-star-half" /></span>
      </span>;

      if (this.props.linkUrl) {
        return <Link to={this.props.linkUrl} className="rating-stars">
          {starsComponent}
        </Link>
      } else {
        return <span className="rating-stars">
        {starsComponent}
      </span>
      }
    };

    return <div className="rating-stars">
      <StarRatingComponent
          name="rating"
          value={this.props.value}
          renderStarIcon={renderStarIcon}
          renderStarIconHalf={renderStarIconHalf}
          editing={false}
      />
    </div>
  }
}