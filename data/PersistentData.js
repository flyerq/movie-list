import { AsyncStorage } from 'react-native';
// import Expo from 'expo';

export default class PersistentData {
  constructor () {
    this.data = {
      favorites: []
    };

    // 订阅列表
    this.listeners = [];

    // 已收藏电影映射表
    this.favoritedMap = {};

    this.initData();
  }

  // 生成已收藏电影映射表
  generateFavoritedMap = () => {
    this.favoritedMap = this.data.favorites.reduce((acc, movie) => {
      acc[movie.id] = true;
      return acc;
    }, {});
  }

  // 初始化数据集
  initData = async () => {
    await this.loadData();
    this.generateFavoritedMap();
  }

  // 存储数据到客户端本地
  saveData = async (data = this.data) => {
    try {
      await AsyncStorage.setItem('data', JSON.stringify(data));
    } catch (err) {
      // 忽略写入错误
    }
  }

  // 载入客户端本地数据
  loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('data');
      if (data !== null) {
        this.data = JSON.parse(data);
      }
    } catch (err) {
      // 忽略载入错误
    }
  }

  // 数据变更订阅
  subscribe = (channel, listener) => {

    // 只有一个函数丝实参作为时为全局订阅
    // 与channel = null的效果一致
    if (typeof channel === 'function') {
      listener = channel;
      channel = null;
    }

    // TODO: 考虑重构为更通用的逻辑
    if (channel === null) {
      // 将全局订阅放入队列尾部
      this.listeners.push({channel, listener});
    } else {
      // 将带有指定频道的订阅放入队列头部
      this.listeners.unshift({channel, listener});
    }

    // 返回一个取消订阅的函数
    return () => {
      this.listeners = this.listeners.filter(l => l.listener !== listener);
    }
  }

  publish = (map) => {
    // 发布数据变动之前先将变动后的数据存储到客户端
    this.saveData();

    // TODO: 考虑重构为更通用的逻辑
    this.listeners.forEach(l => {
      let channel = l.channel;

      // 指定ID电影的收藏状态订阅
      if (typeof channel === 'string' && map && !!map[channel.substr(10)]) {
        l.listener(this.data);
      } else if (channel === null) {
        l.listener(this.data);
      }
    });
  }

  // 获取数据集
  getData = () => {
    return this.data;
  }

  // 设置数据集
  setData = (data) => {
    this.data = data;
    this.generateFavoritedMap();
    this.publish();
  }

  // 获取收藏列表数据
  getFavorites = () => {
    // 返回数据的拷贝引用，防止组件不更新
    return [...this.data.favorites];
  }

  // 设置收藏列表数据
  setFavorites = (favorites) => {
    let prevFavoritedMap = this.favoritedMap;
    this.data.favorites = favorites;
    this.generateFavoritedMap();
    this.publish({...prevFavoritedMap, ...this.favoritedMap});
  }

  // 清除收藏列表数据
  clearFavorites = () => {
    let prevFavoritedMap = this.favoritedMap;
    this.data.favorites = [];
    this.favoritedMap = {};
    this.publish(prevFavoritedMap);
  }

  // 检查指定电影记录是否已收藏
  isFavorited = (movie) => {
    return !!this.favoritedMap[movie.id];
  }

  // 添加指定电影到收藏夹中
  addFavorite = (movie) => {
    this.data.favorites.push(movie);
    this.favoritedMap[movie.id] = true;
    this.publish({[movie.id]: true});
  }

  // 从收藏夹中删除指定电影
  removeFavorite = (movie) => {
    this.data.favorites = this.data.favorites.filter(m => movie.id !== m.id);
    delete this.favoritedMap[movie.id];
    this.publish({[movie.id]: true});
  }
}
