import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {PostCard} from '../components/PostCard';
import {usePosts} from '../hooks/usePosts';
import SplashScreen from 'react-native-splash-screen';

export const FeedScreen = () => {
  const {posts, noMorePost, onLoadMore, onRefresh} = usePosts();

  const postsReady = posts !== null;
  useEffect(() => {
    if (postsReady) {
      SplashScreen.hide();
    }
  }, [postsReady]);

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.75}
      ListFooterComponent={
        !noMorePost && (
          <ActivityIndicator style={styles.spinner} size={32} color="#6200ee" />
        )
      }
      refreshControl={
        <RefreshControl refreshing={onRefresh} onRefresh={onRefresh} />
      }
    />
  );
};

const renderItem = ({item}) => (
  <PostCard
    createdAt={item.createdAt}
    description={item.description}
    id={item.id}
    user={item.user}
    photoURL={item.photoURL}
  />
);

const styles = StyleSheet.create({
  container: {
    paddingBottom: 48,
  },
  spinner: {
    height: 64,
  },
});
