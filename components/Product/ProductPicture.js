import React, {Component} from 'react'
import ImageGallery from 'react-image-gallery';
import {connect} from "react-redux";


class ProductPicture extends Component {
  render() {
    const images = [
      {
        original: this.props.product.pictureUrl,
        thumbnail: this.props.product.pictureUrl
      }
    ];

    const position = this.props.isMediumOrSmaller ? 'bottom' : 'left';

    return <ImageGallery
        showPlayButton={false}
        items={images}
        thumbnailPosition={position}
    />
  }
}

function mapStateToProps(state) {
  return {
    isMediumOrSmaller: state.browser.lessThan.medium
  }
}

export default connect(mapStateToProps)(ProductPicture)
