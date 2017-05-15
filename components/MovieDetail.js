import React from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
  Animated,
  TouchableOpacity
} from 'react-native';
// import Expo, { Video } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Rating from './Rating';
import VideoPlayer from './VideoPlayer';
import Favorite from './Favorite';

const API_URL = 'https://api.douban.com/v2/movie//subject/';
const DEFAULT_AVATAR = 'https://img3.doubanio.com/f/movie/63acc16ca6309ef191f0378faf793d1096a3e606/pics/movie/celebrity-default-large.png';
const { width, height } = Dimensions.get('window');

export default class MovieDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      position: new Animated.Value(this.props.isOpen ? 0 : height),
      opacity: new Animated.Value(0),
      visible: this.props.isOpen,
      isLoading: false,
      cachedMovies: {},
      movie: {}
    }
  }

  async _fetchDetail(id) {
    this.setState({ isLoading: true });

    try {
      let [response, trailerUrl] = await Promise.all([
        fetch(API_URL + id),
        this._fetchTrailer(id)
      ]);
      if ( !response.ok ) {
        this.setState({ isLoading: false });
        alert("Request Data Failure.");
        return;
      }
      let responseJSON = await response.json();

      // Hack：附加大图以及预告片视频地址
      responseJSON.images.big = this.props.movie.images.big;
      // responseJSON.images.raw = responseJSON.images.large.replace(
      //   '/movie_poster_cover/lpst/',
      //   '/photo/raw/'
      // );
      trailerUrl && (responseJSON.trailer = trailerUrl);

      // TODO: 当缓存到达一定数目时应该清理部分缓存，避免内存占用过多

      this.setState(prevState => ({
        isLoading: false,
        cachedMovies: {[responseJSON.id]: responseJSON, ...prevState.cachedMovies},
        movie: responseJSON
      }));
    } catch(error) {
      this.setState({ isLoading: false });
      console.error(error);
    }
  }

  async _fetchTrailer(id) {
    let response = await fetch(`https://movie.douban.com/subject/${id}/mobile`);
    let html = await response.text();
    let videoUrl = html.match(/"(https?:\/\/.+\.mp4)"/i);
    return videoUrl !== null ? videoUrl[1] : null;
  }

  componentWillReceiveProps(nextProps) {
    // 从关闭到打开
    if (!this.props.isOpen && nextProps.isOpen) {
      this.animateOpen();

      // 请求数据或从已缓存的数据中提取
      if (nextProps.movie) {
        if (!this.state.cachedMovies[nextProps.movie.id]) {
          this._fetchDetail(nextProps.movie.id);
          this.setState({
            movie: nextProps.movie
          });
        } else {
          this.setState({
            movie: this.state.cachedMovies[nextProps.movie.id]
          });
        }
      }
    // 从打开到关闭
    } else if (this.props.isOpen && !nextProps.isOpen) {
      this.animateClose();
    }
  }

  // 打开动画
  animateOpen() {
    this.setState({ visible: true }, () => {
      Animated.parallel([
        Animated.timing(this.state.opacity, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(this.state.position, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
      ]).start();
    });
  }

  // 关闭动画
  animateClose() {
    Animated.parallel([
      Animated.timing(this.state.opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(this.state.position, {
        toValue: height,
        duration: 300,
        useNativeDriver: true
      }),
    ]).start(() => this.setState({visible: false}));
  }

  _renderCast = () => {
    this.state.movie.directors.forEach(d => {
      d.isDirector = true;
    });
    const casts = [...this.state.movie.directors, ...this.state.movie.casts];
    const items = casts.map((cast, index) => (
      <View key={index} style={styles.castItems}>
        <View style={styles.castAvatarContainer}>
          <Image
            source={{ uri: cast.avatars ? cast.avatars.large : DEFAULT_AVATAR }}
            style={styles.castAvatar}
          />
        </View>
        <View style={styles.castInfo}>
          <Text style={styles.castName}>{cast.name}</Text>
          <Text style={styles.castRole}>{cast.isDirector ? '导演' : '主演'}</Text>
        </View>
      </View>
    ));

    if (!casts.length) {
      return null;
    }

    return (
      <View style={styles.cast}>
        <Text style={styles.castTitle}>阵容照片</Text>
        {items}
      </View>
    );
  }

  render() {
    if (!this.state.visible) {
      return null;
    }

    const { movie } = this.state;

    return (
      <View style={styles.container}>
        <Modal
          animationType={"none"}
          transparent={true}
          visible={this.state.visible}
          onRequestClose={this.props.onClose}
        >
          {/* 背景遮罩层 */}
          <Animated.View style={[styles.backdrop, { opacity: this.state.opacity }]}/>

          <Animated.View
            style={[styles.modal, {
              transform: [{ translateY: this.state.position }, { translateX: 0 }]
            }]}
          >
            <ScrollView style={{overflow: 'visible'}}>
              <View style={styles.content}>
                  <View style={styles.posterContainer}>
                    <Image source={{ uri: movie.images.big }} style={styles.poster}>
                      <View style={styles.posterOverlay}>
                        {this.state.isLoading ? (
                          <View style={styles.loading}>
                            <ActivityIndicator color={Colors.tintColor} size="large" />
                          </View>
                        ) : (
                          <VideoPlayer url={movie.trailer} />
                        )}
                      </View>
                    </Image>
                  </View>

                  <View style={styles.movieInfo}>
                    <Text style={styles.title}>
                      {movie.title}
                      {movie.year && <Text style={styles.titleYear}>{`（${movie.year}）`}</Text>}
                    </Text>
                    <View style={styles.rating} numberOfLines={1}>
                      <Rating stars={movie.rating.stars} text={movie.rating.average} size={20} />
                      {movie.rating.average > 0 && movie.ratings_count &&
                        <Text style={styles.ratingCount}>{movie.ratings_count + '人评分'}</Text>
                      }
                    </View>
                    <Text style={styles.muted} numberOfLines={1}>
                      <Text style={styles.field}>类型: </Text>
                      {movie.genres.join(' / ') || '不详'}
                    </Text>
                    <Text style={styles.muted}>
                      <Text style={styles.field}>原名: </Text>
                      {movie.original_title}
                    </Text>
                    <Text style={styles.muted}>
                      <Text style={styles.field}>导演: </Text>
                      {movie.directors.map(e => e.name).join(' / ') || '不详'}
                    </Text>
                    <Text style={styles.muted}>
                      <Text style={styles.field}>主演: </Text>
                      {movie.casts.map(e => e.name).join(' / ') || '不详'}
                    </Text>
                    {movie.countries && (
                      <View>
                        <Text style={styles.muted}>
                          <Text style={styles.field}>地区: </Text>
                          {movie.countries.join(' / ') || '不详'}
                        </Text>
                        <Text style={styles.muted}>
                          <Text style={styles.field}>又名: </Text>
                          {movie.aka.join(' / ') || '无'}
                        </Text>
                        <Text style={[styles.field, {marginTop: 5}]}>剧情简介:</Text>
                        <Text style={styles.paragraph}>{movie.summary || '暂无简介'}</Text>
                      </View>
                    )}

                    { this._renderCast() }
                  </View>
              </View>
            </ScrollView>

            {/* 页脚与关闭按钮 */}
            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={this.props.onClose}
                style={styles.button}
              >
                <Ionicons name="md-close" size={36} color="#e6e7e8"/>
              </TouchableOpacity>
              <Favorite movie={movie} size={32} />
            </View>
          </Animated.View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black'
  },
  modal: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  posterContainer: {
    width: '100%',
    height: height * 0.618,
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
    width: null,
    height: null,
    backgroundColor: 'transparent',
  },
  posterOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  movieInfo: {
    paddingHorizontal: 10,
    marginTop: 4,
  },
  title: {
    color: '#555',
    fontSize: 20,
    fontWeight: '100'
  },
  titleYear: {
    color: '#bbb'
  },
  rating: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  ratingCount: {
    color: '#bbb',
    fontSize: 14.6,
    marginLeft: 10,
    fontWeight: '100',
    alignItems: 'center',
    textAlignVertical:'center',
  },
  muted: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '100',
    borderBottomColor: '#f2f3f4',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 5,
  },
  field: {
    color: '#888',
  },
  paragraph: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '100',
    textAlign: 'justify',
  },
  cast: {
    borderTopColor: '#f2f3f4',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 5,
    paddingTop: 20
  },
  castTitle: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 14,
    padding: 5,
    backgroundColor: '#bbb',
  },
  castItems: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    marginVertical: StyleSheet.hairlineWidth,
  },
  castAvatarContainer: {
    width: 64,
    height: 64,
  },
  castAvatar: {
    ...StyleSheet.absoluteFillObject
  },
  castInfo: {
    flex: 1,
    padding: 5,
    borderTopColor: '#f2f3f4',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  castName : {
    fontSize: 14,
    color: '#888',
    lineHeight: 14,
  },
  castRole : {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 22
  },

  footer: {
    padding: 5,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightColor: '#f2f3f4',
    borderRightWidth: StyleSheet.hairlineWidth,
  }
});
