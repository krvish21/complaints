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
  const [user, setUser] = useState(USERS.SABAA);

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