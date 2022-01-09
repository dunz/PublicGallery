import React from 'react';
import {useUserContext} from '../context/UserContext';
import {Image, StyleSheet, Text, View} from 'react-native';

export const MainTab = () => {
  const {user} = useUserContext();
  console.log(user);
  return (
    <View style={styles.block}>
      {user.photoURL && (
        <Image
          source={{uri: user.photoURL}}
          style={{width: 128, height: 128, marginBottom: 16}}
          resizeMode="cover"
        />
      )}
      <Text style={styles.text}>Hello, {user.displayName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
  },
});
