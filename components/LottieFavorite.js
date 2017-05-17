import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import { DangerZone } from 'expo';
const { Lottie: Animation } = DangerZone;
const heart = require('../assets/animations/TwitterHeart.json');

export default class LottieFavorite extends React.Component {
  constructor (props) {
    super(props);

    const { size = 32 } = this.props;

    this.state = {
      isFavorited: false
    };

    this.styles = {
      container: {
        width: size*7.5,
        height: size*7.5,
        overflow: 'visible',
        position: 'absolute',
        right: 10-size*7.5*0.438,
        bottom:10-size*7.5*0.43
      },
      button: {
        width: size*7.5,
        height: size*7.5,
      }
    }
  }

  _toggle = () => {
    if (this.state.isFavorited) {
      this.anim.reset();
    } else {
      this.anim.play();
    }
    this.setState(prevState => ({ isFavorited: !prevState.isFavorited }));
  }

  render () {
    return (
      <View style={this.styles.container}>
        <TouchableWithoutFeedback onPress={this._toggle}>
          <Animation
            ref={ref => {this.anim = ref;}}
            style={this.styles.button}
            source={heart}
          />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

// size必须小于等于64
const size = 32;
const styles = StyleSheet.create({
  container: {
    width: size*7.5,
    height: size*7.5,
    overflow: 'visible',
    transform: [{translateX: -size*7.5*0.438}, {translateY: -size*7.5*0.446}]
  },
  button: {
    width: size*7.5,
    height: size*7.5,
  }
});
