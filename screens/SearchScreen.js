import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
} from 'react-native';
// import Expo, { Constants } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import MovieList from '../components/MovieList';
import OfflineMessage from '../components/OfflineMessage';

const renderSearchBar = ({ config: { eventEmitter } }) => {
  return (
    <View style={styles.searchBar}>
      <Ionicons name='ios-search' size={20} color='#fff' style={{top: 1}} />
      <TextInput
        style={styles.searchInput}
        underlineColorAndroid="transparent"
        onSubmitEditing={(e) => eventEmitter.emit('search', e.nativeEvent.text)}
        blurOnSubmit={true}
        placeholder='搜索电影'
        placeholderTextColor='#ddd'
        autoFocus={true}
        maxLength={100}
        returnKeyType="search"
        enablesReturnKeyAutomatically={true}
      />
    </View>
  )
}

export default class SearchScreen extends React.Component {
  static route = {
    navigationBar: {
      tintColor: '#fff',
      backgroundColor: Colors.tintColor,
      elevation: 0,
      borderBottomColor: '#2980b9',
      borderBottomWidth: StyleSheet.hairlineWidth,
      renderTitle: renderSearchBar,
    },
  }

  constructor(props) {
    super(props);

    this.state = {
      searchUrl: null
    }
  }

  componentWillMount() {
    this._subscription = this.props.route.getEventEmitter().addListener(
      'search',
      this._searchMovie
    );
  }

  componentWillUnmount() {
    this._subscription.remove();
  }

  _searchMovie = (text) => {
    this.setState({
      searchUrl: `https://api.douban.com/v2/movie/search?q=${text}&start=`
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <OfflineMessage />
        <MovieList dataSource={this.state.searchUrl} />
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
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    paddingLeft: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#0001',
  },
  searchInput: {
    flex: 1,
    padding: 0,
    paddingVertical: 5,
    paddingHorizontal: 10,
    color: 'white',
    fontSize: 16,
    textAlignVertical: 'center',
    backgroundColor: 'transparent',
  }
});
