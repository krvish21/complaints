import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  useEffect(() => {
    // Check active session
    const initSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
      }
      if (session?.user) {
        setUser(session.user);
        setEmailConfirmationRequired(false);
      }
      setLoading(false);
    };

    initSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN') {
        setUser(session.user);
        setEmailConfirmationRequired(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setEmailConfirmationRequired(false);
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, username) => {
    try {
      const { user: signUpUser, error, message } = await authService.signUp(email, password, username);
      
      if (error) {
        return { error };
      }

      if (message?.includes('confirm email')) {
        setEmailConfirmationRequired(true);
        return { 
          message: 'Please check your email to confirm your account before signing in.',
          requiresEmailConfirmation: true 
        };
      }

      return { user: signUpUser };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) {
        if (error.message?.includes('email not confirmed')) {
          setEmailConfirmationRequired(true);
          return { error: { message: 'Please confirm your email before signing in.' } };
        }
        return { error };
      }
      setEmailConfirmationRequired(false);
      return { user: data.user };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setEmailConfirmationRequired(false);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
    loading,
    emailConfirmationRequired
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 