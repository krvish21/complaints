import React, { createContext, useContext, useState, useEffect } from 'react';

// Define users with their correct IDs
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
  // Initialize with Sabaa as default
  const [user, setUserState] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Validate the saved user data
        if (parsed && (parsed.id === '1' || parsed.id === '2')) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
    }
    // Default to Sabaa
    return USERS.SABAA;
  });

  const setUser = (userType) => {
    if (!USERS[userType]) {
      console.error('Invalid user type:', userType);
      return;
    }

    const newUser = USERS[userType];
    console.log('Setting user to:', newUser);

    try {
      // Update localStorage first
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      // Then update state
      setUserState(newUser);
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  };

  // Ensure user is always set in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('Current user synced to localStorage:', user);
    } catch (error) {
      console.error('Error syncing user to localStorage:', error);
    }
  }, [user]);

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