import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {FeedScreen} from './FeedScreen';

const Stack = createNativeStackNavigator();

export const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Feed" component={FeedScreen} />
    </Stack.Navigator>
  );
};
