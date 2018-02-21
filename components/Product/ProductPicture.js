import React, {Component} from 'react'
import ImageGallery from 'react-image-gallery';


export default class ProductPicture extends Component {
  render() {
    const images = [
      {
        original: this.props.product.pictureUrl,
        thumbnail: this.props.product.pictureUrl
      }
    ];
    return <ImageGallery showPlayButton={false} items={images}/>
  }
}
