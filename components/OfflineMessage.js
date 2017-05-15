import React from 'react';
import {
  View,
  Text,
  NetInfo,
  StyleSheet
} from 'react-native';
// import Expo from 'expo';
import { Ionicons } from '@expo/vector-icons';

export default class OfflineMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isConnected: true,
    }
  }

  componentDidMount() {
    this._watchConnection();
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener(
      'change',
      this._handleConnectionChange
    );
  }

  _handleConnectionChange = (isConnected) => {
    this.setState({ isConnected });
  }

  // 观察网络连接状态
  _watchConnection = async () => {
    NetInfo.isConnected.addEventListener(
      'change',
      this._handleConnectionChange
    );
    let isConnected = await NetInfo.isConnected.fetch();
    this.setState({ isConnected });
  }

  render () {
    if (this.state.isConnected) {
      return null;
    }

    return (
      <View style={styles.container}>
        <Ionicons name='ios-alert' size={32} color='#e74c3c' />
        <Text style={styles.message}>网络连接不可用，请检查您的网络设置！</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f7c8c9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    color: '#555',
    fontSize: 14,
    lineHeight: 16,
    marginLeft: 10,
    textAlign: 'left',
    textAlignVertical: 'center'
  }
});
