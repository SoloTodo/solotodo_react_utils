import React, {Component} from 'react'
import {Range} from "rc-slider";

class RcContinuousRange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startValue: props.value[0],
      endValue: props.value[1]
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.props.value[0] !== newProps.value[0] || this.props.value[1] !== newProps.value[1]) {
      this.setState({
        startValue: newProps.value[0],
        endValue: newProps.value[1]
      })
    }
  }

  onChange = values => {
    this.setState({
      startValue: values[0],
      endValue: values[1]
    })
  };

  render() {
    const startValue = this.state.startValue || this.props.min;
    const endValue = this.state.endValue || this.props.max;

    return <Range
        min={this.props.min}
        max={this.props.max}
        value={[startValue, endValue]}
        onChange={this.onChange}
        step={this.props.step}
        onAfterChange={this.props.onAfterChange}
        handle={this.props.handle}
        allowCross={false}
    />
  }
}

export default RcContinuousRange;