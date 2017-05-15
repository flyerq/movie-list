import React from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  NativeModules,
  LayoutAnimation,
  TouchableOpacity,
} from 'react-native';
import Rating from './Rating';
import Favorite from './Favorite';

const { UIManager } = NativeModules;
UIManager.setLayoutAnimationEnabledExperimental
  && UIManager.setLayoutAnimationEnabledExperimental(true);

// 自定义布局动画
const CustomLayoutAnimation = {
  duration: 200,
  // create: {
  //   type: LayoutAnimation.Types.spring,
  //   property: LayoutAnimation.Properties.scaleXY,
  //   springDamping: 0.7,
  // },
  // update: {
  //   type: LayoutAnimation.Types.spring,
  //   property: LayoutAnimation.Properties.scaleXY,
  //   springDamping: 0.7,
  // },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.scaleXY,
  },
};

const { width, height } = Dimensions.get('window');
// 网格布局在屏幕中要显示的列数与行数
const cols = 2, rows = 2;

const getLayout = (layout) => {
  return {
    height: (height - 80 - 55 - 10 - 20 - 20) / layout.rows - 10,
    width: (width - 10) / layout.cols - 10,
  };
}

export default class MovieListItem extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    // 当电影条目被卸载(取消收藏)时开启布局动画
    LayoutAnimation.configureNext(CustomLayoutAnimation);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.movie.id !== nextProps.movie.id) {
      return true;
    }
    return false;
  }

  render() {
    const { movie, onOpen, layout = {cols, rows}, index } = this.props;
    const { title, images, genres, rating: {stars, average} } = movie;
    const genre = genres.join(' / ');

    return (
      <TouchableOpacity
        style={styles.movieItemContainer}
        activeOpacity={0.65}
        onPress={() => onOpen(movie)}
      >
        <View style={[styles.movieItemImageContainer, getLayout(layout)]}>
          <Image source={{ uri: images.big }} style={styles.movieItemImage} />
          {index !== null &&
            <View>
              <Text style={styles.ranking}>{'★ No.' + (index + 1)}</Text>
            </View>
          }
        </View>

        <View style={styles.movieItemFooter}>
          <View style={styles.movieInfo}>
            <Text style={styles.movieItemTitle} numberOfLines={1}>{title}</Text>
            <View style={styles.movieItemRating} numberOfLines={1}>
              <Rating stars={stars} text={average} />
            </View>
            <Text style={styles.movieItemGenre} numberOfLines={1}>
              {genre || "类型不详"}
            </Text>
          </View>

          <View style={styles.movieActions}>
            <Favorite movie={movie} size={26} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  movieItemContainer: {
    marginLeft: 10,
    marginBottom: 10,
    height: (height - 80 - 55 - 10 - 20 - 20) / rows - 10,
    width: (width - 10) / cols - 10,
  },
  movieItemImageContainer: {
    flex: 1,
  },

  movieItemImage: {
    borderRadius: 10,
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e6e7e8',
  },

  ranking: {
    position: 'absolute',
    backgroundColor: '#f39c12ee',
    color: '#fff',
    fontSize: 10,
    lineHeight: 12,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  movieItemFooter: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },

  movieInfo: {
    flex: 1,
  },

  movieActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4
  },

  movieItemTitle: {
    color: '#555',
    fontSize: 14,
    lineHeight: 14,
    marginTop: 4
  },

  movieItemRating: {
    marginVertical: 2,
  },

  movieItemGenre: {
    color: '#bbb',
    fontSize: 12,
    lineHeight: 14,
  },
});
