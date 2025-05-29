import React, { createContext, useContext, useState, useEffect } from 'react';

export const USERS = {
  SABAA: {
    id: '2',
    name: 'Sabaa',
    email: 'sabaa@example.com'
  },
  VISHU: {
    id: '1',
    name: 'Vishu',
    email: 'vishu@example.com'
  }
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : USERS.VISHU;
  });

  const setUser = (userKey) => {
    const newUser = USERS[userKey];
    setUserState(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    console.log('User switched to:', newUser);
  };

  // Set initial user in localStorage if not present
  useEffect(() => {
    if (!localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }, []);

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