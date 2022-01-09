import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {CustomButton} from './CustomButton';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

export const SignButtons: React.VFC = ({isSignUp, onSubmit, loading}) => {
  const navigation = useNavigation();

  const primaryTitle = isSignUp ? '회원가입' : '로그인';
  const secondaryTitle = isSignUp ? '로그인' : '회원가입';

  const onSecondaryButtonProps = () => {
    isSignUp
      ? navigation.goBack()
      : navigation.push('SignIn', {isSignUp: true});
  };

  if (loading) {
    return (
      <View style={styles.spinnerWrapper}>
        <ActivityIndicator size={32} color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.buttons}>
      <CustomButton title={primaryTitle} hasMarginBottom onPress={onSubmit} />
      <CustomButton
        title={secondaryTitle}
        theme="secondary"
        onPress={onSecondaryButtonProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttons: {
    marginTop: 64,
  },
  spinnerWrapper: {
    marginTop: 64,
    height: 104,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
