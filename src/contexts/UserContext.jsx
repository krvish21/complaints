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
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Validate the saved user data
        if (Object.values(USERS).some(u => u.id === parsed.id)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
    }
    // Default to Sabaa if no valid saved user
    return USERS.SABAA;
  });

  const setUser = (userType) => {
    const newUser = USERS[userType];
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