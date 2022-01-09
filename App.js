import React from 'react';
import type {Node} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {RootStack} from './screens/RootStack';
import {UserContextProvider} from './context/UserContext';

const App: () => Node = () => {
  return (
    <UserContextProvider>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </UserContextProvider>
  );
};

export default App;
