import {useEffect} from 'react';
import {addListener} from '../lib/events';

export const usePostsEventEffect = ({
  refresh,
  removePost,
  updatePost,
  enabled,
}) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const removeRefresh = addListener('refresh', refresh);
    const removeRemovePost = addListener('removePost', removePost);
    const removeUpdatePost = addListener('updatePost', updatePost);
    return () => {
      removeRefresh();
      removeRemovePost();
      removeUpdatePost();
    };
  }, [refresh, removePost, updatePost, enabled]);
};
