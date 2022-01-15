import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useEffect} from 'react';
import {Profile} from '../components/Profile';

export const ProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {userId, displayName} = route.params ?? {};

  useEffect(() => {
    navigation.setOptions({
      title: displayName,
    });
  }, [navigation, displayName]);

  return <Profile userId={userId} />;
};
