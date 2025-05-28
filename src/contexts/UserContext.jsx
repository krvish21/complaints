import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext({});

export const useUser = () => {
  return useContext(UserContext);
};

const USERS = {
  SABAA: {
    id: '1',
    name: 'Sabaa',
    email: 'sabaa@example.com'
  },
  VISHU: {
    id: '2',
    name: 'Vishu',
    email: 'vishu@example.com'
  }
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(USERS.SABAA);

  const value = {
    user: currentUser,
    setUser: (userType) => setCurrentUser(USERS[userType]),
    USERS
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 