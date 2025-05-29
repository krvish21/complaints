import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Define users with their correct IDs
export const USERS = {
  SABAA: {
    id: '1',
    name: 'Sabaa'
  },
  VISHU: {
    id: '2',
    name: 'Vishu'
  }
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      if (data && data.length > 0) {
        const usersMap = {
          SABAA: data.find(u => u.username.toLowerCase() === 'sabaa'),
          VISHU: data.find(u => u.username.toLowerCase() === 'vishu')
        };
        setUsers(usersMap);
        // Set default user to Sabaa
        setUser(usersMap.SABAA);
      }
    };

    fetchUsers();
  }, []);

  if (!users || !user) {
    return <div>Loading users...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, users }}>
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