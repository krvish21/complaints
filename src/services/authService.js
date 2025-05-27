import { supabase } from '../lib/supabase';

// Local storage keys
const USERS_KEY = 'app_users';
const CURRENT_USER_KEY = 'current_user';

// Initialize users array in localStorage if it doesn't exist
if (!localStorage.getItem(USERS_KEY)) {
  localStorage.setItem(USERS_KEY, JSON.stringify([]));
}

const getUsers = () => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authService = {
  signUp: async (username, password) => {
    try {
      const users = getUsers();
      
      // Check if username already exists
      if (users.some(user => user.username === username)) {
        throw new Error('Username already exists');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username,
        password,
        createdAt: new Date().toISOString()
      };

      // Save user locally
      users.push(newUser);
      saveUsers(users);

      // Create user profile in Supabase
      const profileData = {
        user_id: newUser.id,
        username: newUser.username,
        display_name: username,
        created_at: newUser.createdAt,
        last_seen: new Date().toISOString()
      };

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        // Rollback local storage if Supabase insert fails
        const updatedUsers = getUsers().filter(u => u.id !== newUser.id);
        saveUsers(updatedUsers);
        throw profileError;
      }

      // Auto login after signup
      const { password: _, ...userWithoutPassword } = newUser;
      const userWithProfile = {
        ...userWithoutPassword,
        profile
      };
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithProfile));
      return userWithProfile;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  },

  signIn: async (username, password) => {
    try {
      const users = getUsers();
      const user = users.find(u => u.username === username && u.password === password);

      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Get user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Update last seen
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating last_seen:', updateError);
      }

      // Store user in localStorage (without password)
      const { password: _, ...userWithoutPassword } = user;
      const userWithProfile = {
        ...userWithoutPassword,
        profile
      };
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithProfile));
      return userWithProfile;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        // Update last seen before signing out
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ last_seen: new Date().toISOString() })
          .eq('user_id', currentUser.id);

        if (updateError) {
          console.error('Error updating last_seen:', updateError);
        }
      }
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  updateProfile: async (userId, updates) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local storage
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          profile
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }

      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}; 