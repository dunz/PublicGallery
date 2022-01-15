import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {PostCard} from '../components/PostCard';
import {addListener} from '../lib/events';
// import events from '../lib/events';

export const PostScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {post} = route.params;

  useEffect(() => {
    const handler = ({description}) => {
      navigation.setParams({post: {...post, description}});
    };
    return addListener('updatePost', handler);
  }, [post, navigation]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <PostCard
        user={post.user}
        photoURL={post.photoURL}
        description={post.description}
        createdAt={post.createdAt}
        id={post.id}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  block: {flex: 1},
  contentContainer: {
    paddingBottom: 40,
  },
});

export default PostScreen;
