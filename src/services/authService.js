import { supabase } from '../lib/supabase';

export const authService = {
  signUp: async (email, password, username) => {
    try {
      console.log('Starting signup process for:', email);
      
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username // Store username in auth metadata as backup
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      console.log('Signup response:', { authData, signUpError });

      if (signUpError) throw signUpError;
      if (!authData?.user?.id) throw new Error('No user ID returned from signup');

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
        // If profile creation fails, we should handle cleanup
        // You might want to delete the auth user or implement a retry mechanism
        throw profileError;
      }

      // Check if email confirmation is required
      if (authData.user?.identities?.length === 0 || 
          authData.user?.confirmed_at === null) {
        console.log('Email confirmation required for:', email);
        return {
          message: 'Please check your email to confirm your account before signing in.',
          requiresEmailConfirmation: true
        };
      }

      return { user: authData.user };
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