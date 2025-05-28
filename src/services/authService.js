import { supabase } from '../lib/supabase';

export const authService = {
  signUp: async (email, password, username) => {
    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username // Store username in auth metadata as backup
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData?.user?.id) throw new Error('No user ID returned from signup');

      // Wait for the session to be established
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session Error:', sessionError);
        throw sessionError;
      }

      if (!session) {
        // If no session, wait a bit and try again (email confirmation might be required)
        console.log('No session available, user might need to confirm email');
        return { 
          user: authData.user,
          message: 'Please check your email for confirmation link'
        };
      }

      // Now that we have a session, create the profile
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
        return {
          user: authData.user,
          error: profileError,
          message: 'Account created but profile setup failed. Please contact support.'
        };
      }

      return { 
        user: authData.user,
        message: 'Account created successfully'
      };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error };
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