import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Notifications } from 'expo';
import {
  StackNavigation,
  TabNavigation,
  TabNavigationItem,
} from '@expo/ex-navigation';
import { Ionicons } from '@expo/vector-icons';
import Alerts from '../constants/Alerts';
import Colors from '../constants/Colors';

const getTabColor = isSelected => (
    isSelected ? Colors.tabIconSelected : Colors.tabIconDefault
);

export default class RootNavigation extends React.Component {
  render() {
    return (
      <TabNavigation tabBarHeight={56} initialTab="theaters" tabBarStyle={styles.tabContainer}>
        <TabNavigationItem
          id="theaters"
          title="正在热映"
          renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderIcon('md-flame', isSelected)}>
          <StackNavigation initialRoute="theaters" />
        </TabNavigationItem>

        <TabNavigationItem
          id="top250"
          title="榜单"
          renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderIcon('md-trophy', isSelected)}>
          <StackNavigation initialRoute="top250" />
        </TabNavigationItem>

        <TabNavigationItem
          id="search"
          title="搜索"
          renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderIcon('md-search', isSelected)}>
          <StackNavigation initialRoute="search" />
        </TabNavigationItem>

        <TabNavigationItem
          id="favorites"
          title="我的收藏"
          renderTitle={this._renderTitle}
          renderIcon={isSelected => this._renderIcon('md-heart', isSelected)}>
          <StackNavigation initialRoute="favorites" />
        </TabNavigationItem>
      </TabNavigation>
    );
  }

  _renderIcon(name, isSelected) {
    return (
      <Ionicons
        name={name}
        size={32}
        color={getTabColor(isSelected)}
      />
    );
  }

  _renderTitle(isSelected, title) {
    return (
      <Text style={{ fontSize: 10, fontWeight: '100', color: getTabColor(isSelected) }}>
        {title}
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  tabContainer: {
    borderTopColor: Colors.tabBorderColor,
  },
  selectedTab: {
    color: Colors.tabIconSelected,
  },
});
