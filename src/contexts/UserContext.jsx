import React, { createContext, useContext, useState } from 'react';

// Define users with their correct IDs
export const USERS = {
  SABAA: {
    id: '2',
    name: 'Sabaa'
  },
  VISHU: {
    id: '1',
    name: 'Vishu'
  }
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize with Sabaa as default
  const [user, setUserState] = useState(USERS.SABAA);

  const setUser = (userType) => {
    if (typeof userType === 'string' && USERS[userType]) {
      setUserState(USERS[userType]);
    } else if (userType && userType.id) {
      setUserState(userType);
    } else {
      console.error('Invalid user:', userType);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, USERS }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 