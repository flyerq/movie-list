import React from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
// import Expo from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import MovieDetail from './MovieDetail';
import MovieListItem from './MovieListItem';
import Toast from './Toast';

const { width, height } = Dimensions.get('window');
// 网格布局在屏幕中要显示的列数与行数
const cols = 2, rows = 2;

export default class MovieList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isLoaded: false,
      isRefreshing: false,
      isLoadingMore: false,
      detailIsOpen: false,
      error: null,
      start: 0,
      count: 20,
      total: 0,
      layout: props.layout || { cols, rows },
      movies: Array.isArray(props.dataSource) ? props.dataSource : []
    };

    this.apiUrl = typeof props.dataSource === 'string' ? props.dataSource : null;
  }

  componentDidMount() {
    this.apiUrl && this._fetchData();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dataSource !== this.props.dataSource) {
      if (Array.isArray(nextProps.dataSource)) {
        this.setState({ movies: nextProps.dataSource });
      } else if (typeof nextProps.dataSource === 'string') {
        this.apiUrl = nextProps.dataSource;
        this.setState({isLoaded: false, movies: []}, () => this._fetchData());
      }
    }
  }

  componentWillUnmount() {
    this.rafID && cancelAnimationFrame(this.rafID);
  }

  async _fetchData(start = 0, count = 20) {
    if ( !this.state.isRefreshing && !this.state.movies.length ) {
      this.setState({ isLoading: true });
    }

    try {
      let response = await fetch(this.apiUrl + start + '&count=' + count);
      if ( !response.ok ) {
        this.setState({
          isLoading: false,
          isLoaded: true,
          isRefreshing: false,
          isLoadingMore: false,
          error: '服务器响应异常，请稍后再试...',
        });

        Toast.show('服务器响应异常，请稍后再试...');
        return;
      }

      let responseJSON = await response.json();

      // Hack：替换电影的宣传海报为更大尺寸的webp格式图片
      // 官方API并未提供此接口，此方案为非正规方式，今后可能会失效
      responseJSON.subjects && responseJSON.subjects.forEach(movie => {
        movie.images.big = movie.images.large.replace(
          '/movie_poster_cover/lpst/',
          '/photo/photo/'
        );
        // .replace(/\.jpg$/i, '.webp');
      });

      this.setState(prevState => {
        let movies = this.state.isRefreshing
          ? [...responseJSON.subjects]
          : [...prevState.movies, ...responseJSON.subjects];

        return {
          isLoading: false,
          isLoaded: true,
          isLoadingMore: false,
          isRefreshing: false,
          error: responseJSON.error || null,
          start: responseJSON.start,
          count: responseJSON.count,
          total: responseJSON.total,
          movies: movies || []
        }
      });
    } catch(error) {
      this.setState({
        isLoading: false,
        isLoaded: true,
        isRefreshing: false,
        isLoadingMore: false,
        error
      });
      Toast.show('网络请求出错了，请稍后再试...');
    }
  }

  _refreshing = () => {
    if (
      this.state.isLoading
      || this.state.isRefreshing
      || this.state.isLoadingMore
    ) {
      return;
    }

    this.setState({
      isRefreshing: true,
    }, () => this._fetchData());
  }

  _loadMore = () => {
    if (
      this.state.error
      || this.state.isLoadingMore
      || this.state.isLoading
      || this.state.isRefreshing
    ) {
      return false;
    }

    if (this.state.total > this.state.start + this.state.count) {
      this.setState({ isLoadingMore: true }, () => {
        this._fetchData(this.state.start + this.state.count);
      });
    }
  }

  _renderHeader = () => {
    // 初始请求出错时显示错误提示
    if (this.state.error && !this.state.movies.length) {
      return (
        <View style={styles.emptyList}>
          <Ionicons
            name='ios-sad-outline'
            size={100}
            color='#f7c8c9'
          />
          <Text style={[styles.emptyListMessage, styles.error]}>
            网络请求异常，请稍后再试...
          </Text>
        </View>
      )
    }

    // 如果不是收藏列表，且没有出错，但数据为空时，显示空列表提示
    if (this.state.isLoaded && !this.state.movies.length) {
      return (
        <View style={styles.emptyList}>
          <Ionicons
            name='ios-filing-outline'
            size={128}
            color='#e6e7e8'
            style={{lineHeight: 100}}
          />
          <Text style={styles.emptyListMessage}>
            没有相关的电影数据
          </Text>
        </View>
      )
    }

    return null;
  }

  _renderRow = ({item: movie, index}) => {
    return (
      <MovieListItem
        movie={movie}
        onOpen={this._openDetail}
        layout={this.state.layout}
        index={this.props.showRanking ? index : null}
      />
    );
  }

  _renderFooter = () => {
    if (this.state.isLoadingMore) {
      return (
        <View style={styles.loadingMore}>
          <ActivityIndicator color={Colors.tintColor} size="large" />
        </View>
      )

    // 网络请求出错时，列表组件无法自动再次发起请求
    // 所以在这种情况下显示给用户一个手动加载更多的按钮
    } else if (
      this.state.error
      && this.state.movies.length > 0
      && this.state.total > this.state.start + this.state.count
    ) {
      return (
        <View style={styles.loadingMore}>
          <TouchableOpacity
            style={styles.loadingMoreButton}
            activeOpacity={0.65}
            onPress={() => {
              this.setState({error: null}, this._loadMore);
            }}
          >
            <Text style={styles.loadingMoreText}>加载更多</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return null;
  }

  _shouldItemUpdate = (prev, next) => {
    return prev.item.id !== next.item.id;
  }

  _getItemLayout = (data, index) => {
    const { rows } = this.state.layout;
    return {
      length: (height - 185) / rows,
      offset: (height - 185) / rows * index,
      index
    }
  }

  // 打开电影详情弹层
  _openDetail = (movie) => {
    this._rafID = requestAnimationFrame(() => {
      this.setState({
        detailIsOpen: true,
        movie: {...movie}
      });
    });
  }

  // 关闭电影详情弹层
  _closeDetail = () => {
    this._rafID = requestAnimationFrame(() => {
      this.setState({
        detailIsOpen: false
      });
    });
  }

  render() {
    const { cols, rows } = this.state.layout;
    const { isFavoritesList } = this.props;

    // 如果当前列表为收藏列表，且列表为空，显示空列表提示
    if (isFavoritesList && !this.state.movies.length) {
      return (
        <View style={styles.emptyList}>
          <Ionicons
            name='ios-filing-outline'
            size={128}
            color='#e6e7e8'
            style={{lineHeight: 100}}
          />
          <Text style={styles.emptyListMessage}>
            您没有收藏任何电影
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        {this.state.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.tintColor} size="large" />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.list}
            numColumns={cols}
            data={this.state.movies}
            extraData={this.state}
            renderItem={this._renderRow}
            keyExtractor={movie => movie.id}
            onEndReached={isFavoritesList ? undefined : this._loadMore}
            onEndReachedThreshold={1}
            ListHeaderComponent={isFavoritesList ? undefined : this._renderHeader}
            ListFooterComponent={isFavoritesList ? undefined : this._renderFooter}
            initialNumToRender={cols * (rows + 1)}
            maxToRenderPerBatch={1}
            // removeClippedSubviews={false}
            directionalLockEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode='on-drag'
            keyboardShouldPersistTaps='always'
            automaticallyAdjustContentInsets={false}
            shouldItemUpdate={this._shouldItemUpdate}
            getItemLayout={this._getItemLayout}
            refreshControl={
              isFavoritesList
              ? undefined
              : <RefreshControl
                  refreshing={this.state.isRefreshing}
                  onRefresh={this._refreshing}
                  tintColor={Colors.tintColor}
                  title='加载中...'
                  titleColor={Colors.tintColor}
                  colors={[Colors.tintColor]}
                  progressBackgroundColor='#fff'
                />
            }
          />
        )}

        {/* 电影详情弹出层 */}
        <MovieDetail
          movie={this.state.movie}
          isOpen={this.state.detailIsOpen}
          onClose={this._closeDetail}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingMore: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10
  },
  loadingMoreButton: {
    width: '100%',
    justifyContent: 'center',
  },
  loadingMoreText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    lineHeight: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: Colors.tintColor,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2980b9',
  },

  list: {
    paddingTop: 10,
  },
  emptyList: {
    flex: 1,
    height: height - 229,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListMessage: {
    fontSize: 18,
    color: '#e6e7e8',
  },
  error: {
    color: '#f7c8c9',
  }
});
