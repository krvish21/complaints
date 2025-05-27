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
      // Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `${username}@grievance.app`, // Using a placeholder email since we're using username auth
        password,
        options: {
          data: {
            username // Store username in user metadata
          }
        }
      });

      if (authError) throw authError;

      // Wait a bit for the auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          user_id: authData.user.id, // This is already a UUID
          username,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString()
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Profile Error:', profileError);
        throw profileError;
      }

      return {
        ...authData.user,
        username,
        profile
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  },

  signIn: async (username, password) => {
    try {
      // Sign in with email (username@grievance.app) and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${username}@grievance.app`,
        password
      });

      if (authError) throw authError;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      // Update last seen
      await supabase
        .from('user_profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('user_id', authData.user.id);

      return {
        ...authData.user,
        username,
        profile
      };
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (!user) return null;

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return {
        ...user,
        username: user.user_metadata.username,
        profile
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  updateProfile: async (userId, updates) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}; 