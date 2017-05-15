import React from 'react';
import {
  ToastAndroid
} from 'react-native';

export default class Toast extends React.Component {
  static show (msg, duration = ToastAndroid.SHORT, position = ToastAndroid.CENTER) {
    ToastAndroid.show(msg, duration);
  }

  render () {
    return null;
  }
}