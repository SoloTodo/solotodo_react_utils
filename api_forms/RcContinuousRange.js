import React from 'react'
import Big from 'big.js';

import {Range} from "rc-slider";

class RcContinuousRange extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      startValue: props.value[0],
      endValue: props.value[1]
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.value[0].eq(prevProps.value[0]) || !this.props.value[1].eq(prevProps.value[1])) {
      this.setState({
        startValue: this.props.value[0],
        endValue: this.props.value[1]
      })
    }
  }

  onChange = values => {
    this.setState({
      startValue: new Big(values[0]),
      endValue: new Big(values[1])
    })
  };

  render() {
    const startValue = this.state.startValue || this.props.min;
    const endValue = this.state.endValue || this.props.max;

    return <Range
        min={Number(this.props.min)}
        max={Number(this.props.max)}
        value={[Number(startValue), Number(endValue)]}
        onChange={this.onChange}
        step={Number(this.props.step)}
        onAfterChange={this.props.onAfterChange}
        handle={this.props.handle}
        allowCross={false}
    />
  }
}

export default RcContinuousRange;