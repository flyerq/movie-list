import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import Expo, { Video } from 'expo';
import { Ionicons } from '@expo/vector-icons';
const { width, height } = Dimensions.get('window');

export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: false,
      paused: false,
    }
  }

  _playVideo = () => {
    this.setState({isPlaying: true});
  }

  _onEnd = () => {
    this.setState({ isPlaying: false });
  }

  render() {
    const { url } = this.props;

    if ( !url ) {
      return null;
    }

    if ( !this.state.isPlaying ) {
      return (
        <View style={styles.playButton}>
          <TouchableOpacity
            style={styles.playButton}
            activeOpacity={0.8}
            onPress={this._playVideo}
          >
            <Ionicons style={{left: 5}} name="md-play" size={52} color="#fffc"/>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback
          onPress={() => this.setState({ paused: !this.state.paused })}
        >
          <Video
            ref={(ref) => {
              this.player = ref
            }}
            source={{uri: url}}
            paused={this.state.paused}
            rate={1.0}
            volume={1.0}
            muted={false}
            repeat={false}
            resizeMode="contain"
            onEnd={this._onEnd}
            style={styles.player}
          />
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000d',
    ...StyleSheet.absoluteFillObject,
  },

  player: {
    ...StyleSheet.absoluteFillObject,
  },

  playButton: {
    backgroundColor: '#0008',
    width: 82,
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
});
