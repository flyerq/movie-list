import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default class Rating extends React.Component {
  _renderRating () {
    const { size = 16, stars = '00' } = this.props;
    const star = parseInt(stars[0]);
    const starHalf = parseInt(stars[1]);
    const props = Array(5).fill({name: 'md-star', color: '#bbb'});
    star && props.fill({name: 'md-star', color: '#f39c12'}, 0, star);
    starHalf && (props[star] = {name: 'md-star-half', color: '#f39c12'});
    return props.map((p, i) => <Ionicons key={i} size={size} {...p} />);
  }

  render () {
    return (
      <View style={[styles.container, {height: this.props.size}]}>
        {this._renderRating()}
        {/* String(this.props.text)写法是为了解决RN 0.43中渲染数字的Bug */}
        <Text style={[styles.ratingText, {fontSize: this.props.size - 4}]}>
          {this.props.text > 0 ? String(this.props.text) : "暂无评分"}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 16,
  },

  ratingText: {
    color: "#f39c12",
    marginLeft: 2,
    fontSize: 12
  }
});
