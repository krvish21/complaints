import { supabase } from '../lib/supabase';

export const authService = {
  signUp: async (email, password, username) => {
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // Wait for the session to be established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: authData.user.id,
            username,
            created_at: new Date().toISOString(),
            last_seen: new Date().toISOString()
          }
        ])
        .single();

      if (profileError) {
        console.error('Profile Error:', profileError);
        throw profileError;
      }

      return authData;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
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