import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../data/supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', 'Sabaa')
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return;
      }

      if (data) {
        setUser(data);
      }
    };

    fetchUsers();
  }, []);

  const switchUser = async (username) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return;
    }

    if (data) {
      setUser(data);
    }
  };

  if (!user) {
    return <div>Loading user...</div>;
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: switchUser,
      isVishu: user.username === 'Vishu',
      isSabaa: user.username === 'Sabaa'
    }}>
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