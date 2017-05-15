import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
// import Expo from 'expo';
import { Ionicons } from '@expo/vector-icons';
import PersistentData from '../data/PersistentData';
import Toast from './Toast';

export default class Favorite extends React.Component {
  static contextTypes = {
    dataStore: PropTypes.instanceOf(PersistentData)
  }

  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    // 订阅持久化数据仓库中当前电影的收藏状态
    this.unsubscribe = this.context.dataStore.subscribe(
      `favorites-${this.props.movie.id}`,
      (data) => { this.forceUpdate() }
    );
  }

  componentWillUnmount() {
    // 卸载组件前取消订阅持久化数据仓库
    this.unsubscribe();
  }

  _toggle = (isFavorited) => {
    if (isFavorited) {
      this.context.dataStore.removeFavorite(this.props.movie);
      Toast.show("已取消收藏");
    } else {
      this.context.dataStore.addFavorite(this.props.movie);
      Toast.show("收藏成功");
    }
  }

  render () {
    const { size = 32 } = this.props;
    const isFavorited = this.context.dataStore.isFavorited(this.props.movie);
    return (
      <TouchableWithoutFeedback onPress={()=>this._toggle(isFavorited)}>
        <View style={styles.container}>
          <Ionicons
            name={isFavorited ? 'md-heart':'md-heart-outline'}
            size={size}
            color={isFavorited ? '#e74c3c':'#e6e7e8'}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
