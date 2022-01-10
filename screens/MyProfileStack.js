import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MyProfileScreen} from './MyProfileScreen';

const Stack = createNativeStackNavigator();

export const MyProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
    </Stack.Navigator>
  );
};
