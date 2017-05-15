import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Platform,
  TouchableOpacity
} from 'react-native';
// import Expo, { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import MovieList from '../components/MovieList';
import PersistentData from '../data/PersistentData';

const Title = () => {
  return (
    <View style={styles.title}>
      <Text style={styles.titleText}>我的收藏</Text>
    </View>
  )
}

const renderActionButton = ({ config: { eventEmitter } }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.65}
        onPress={() => eventEmitter.emit('clear')}
      >
        <Ionicons name='md-trash' size={28} color='#fff' />
      </TouchableOpacity>
    </View>
  )
}

export default class FavoritesScreen extends React.Component {
  static route = {
    navigationBar: {
      title: '我的收藏',
      tintColor: '#fff',
      backgroundColor: Colors.tintColor,
      elevation: 0,
      borderBottomColor: '#2980b9',
      borderBottomWidth: StyleSheet.hairlineWidth,
      renderTitle: () => <Title />,
      renderRight: renderActionButton
    },
  }

  static contextTypes = {
    dataStore: PropTypes.instanceOf(PersistentData)
  }

  constructor(props, context) {
    super(props, context);
  }

  componentWillMount() {
    this._handleClear = this.props.route.getEventEmitter().addListener(
      'clear',
      this._clearFavorites
    );
  }

  componentDidMount() {
    // 订阅持久化数据仓库中当前电影的收藏状态
    this.unsubscribe = this.context.dataStore.subscribe((data) => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this._handleClear.remove();

    // 卸载组件前取消订阅持久化数据仓库
    this.unsubscribe();
  }

  _clearFavorites = () => {
    if (!this.context.dataStore.getFavorites().length) {
      return false;
    }

    Alert.alert(
      '清空确认',
      '您确认要清空整个收藏夹吗？',
      [
        { text: '确认', onPress: this.context.dataStore.clearFavorites },
        { text: '取消', onPress: () => {} },
      ],
      { cancelable: false }
    )
  }

  render() {
    const dataSource = this.context.dataStore.getFavorites();
    return (
      <View style={styles.container}>
        <MovieList dataSource={dataSource} isFavoritesList={true} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // paddingTop: Constants.statusBarHeight,
  },
  title: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  titleText: {
    flex: 1,
    color: 'white',
    ...Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '500',
        textAlign: 'center',
      },
      android: {
        fontSize: 20,
        textAlign: 'left',
      },
    }),
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
