import React, {createContext, useContext, useState} from 'react';

const UserContext = createContext(null);

export const UserContextProvider = ({children}) => {
  const [user, setUser] = useState(null);

  return <UserContext.Provider children={children} value={{user, setUser}} />;
};

export const useUserContext = () => {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext.Provider is not foud');
  }
  return userContext;
};
