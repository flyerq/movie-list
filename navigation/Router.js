import { createRouter } from '@expo/ex-navigation';

import TheatersScreen from '../screens/TheatersScreen';
import Top250Screen from '../screens/Top250Screen';
import SearchScreen from '../screens/SearchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import RootNavigation from './RootNavigation';

export default createRouter(() => ({
  theaters: () => TheatersScreen,
  top250: () => Top250Screen,
  search: () => SearchScreen,
  favorites: () => FavoritesScreen,
  rootNavigation: () => RootNavigation,
}));
