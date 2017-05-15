import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
// import Expo, { Constants } from 'expo';
import Colors from '../constants/Colors';
import MovieList from '../components/MovieList';
import OfflineMessage from '../components/OfflineMessage';
const API_URL = 'https://api.douban.com/v2/movie/top250?start=';

const Title = () => {
  return (
    <View style={styles.title}>
      <Text style={styles.titleText}>高分电影榜单</Text>
    </View>
  )
}

export default class Top250Screen extends React.Component {
  static route = {
    navigationBar: {
      title: '高分电影榜单',
      tintColor: '#fff',
      backgroundColor: Colors.tintColor,
      elevation: 0,
      borderBottomColor: '#2980b9',
      borderBottomWidth: StyleSheet.hairlineWidth,
      renderTitle: () => <Title />,
    },
  }

  render() {
    return (
      <View style={styles.container}>
        <OfflineMessage />
        <MovieList dataSource={API_URL} showRanking />
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
});
