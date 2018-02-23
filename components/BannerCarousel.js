import React, {Component} from "react";
import {apiResourceStateToPropsUtils} from "../ApiResource";
import {connect} from "react-redux";
import Slider from 'react-slick'

import './BannerCarousel.css'

class BannerCarousel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slides: undefined
    }
  }

  componentDidMount() {
    this.props.fetchAuth(`carousel_slides/?website=${this.props.websiteId}`).then(slides => (
      this.setState({
        slides
      })
    ))
  }

  getImage = slide => {
    const imageDict = {
      extraSmall: 'img_400',
      small: 'img_576',
      medium: 'img_768',
      large: 'img_992',
      infinity: 'img_1200'
    };

    return slide[imageDict[this.props.mediaType]]
  };

  render() {
    if (!this.state.slides) {
      return this.props.loading || null
    }

    const sliderSettings = {
      dots: this.props.dots || false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
    };

    if (this.props.nextArrow) {
      sliderSettings['nextArrow'] = this.props.nextArrow;
    }

    if (this.props.prevArrow) {
      sliderSettings['prevArrow'] = this.props.prevArrow;
    }

    return <div id="banner-slider" className="ml-auto mr-auto">
      <Slider {...sliderSettings}>
        {
          this.state.slides.map(slide => (
            <div key={slide.name}>
              <a href={slide.target_url}>
                <img src={this.getImage(slide)} alt={slide.name} />
              </a>
            </div>
          ))
        }
      </Slider>
    </div>
  }
}

function mapStateToProps(state) {
  const {fetchAuth} = apiResourceStateToPropsUtils(state);

  return {
    fetchAuth,
    mediaType: state.browser.mediaType
  }
}

export default connect(mapStateToProps)(BannerCarousel);
