import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile, UserRole } from '../types';
import { supabase, getUserProfile, signUpUser, signInUser } from '../lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setIsEmailVerified(!!authUser?.email_confirmed_at);

      const profile = await getUserProfile(userId);
      if (profile) {
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && mounted) {
          await fetchProfile(session.user.id);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        if (mounted) setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsEmailVerified(false);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await signInUser(email, password);
      
      if (error) {
        if (error.status === 429) {
          throw new Error('Too many login attempts. Please wait a moment before trying again.');
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Incorrect email or password. Please try again.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email not confirmed. Please verify your email first.');
        }
        throw error;
      }

      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const { data, error } = await signUpUser(email, password, name, role);
      
      if (error) {
        if (error.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a few minutes before trying to sign up again.');
        }
        if (error.message.includes('already registered')) {
          throw new Error('An account with this email already exists. Try signing in instead.');
        }
        throw error;
      }

      // If sign up is successful, check if session is created (auto-login)
      // If email confirmation is enabled, session will be null
      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
      }
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsEmailVerified(false);
      toast.info("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn,
      signUp,
      logout, 
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'staff',
      isEmailVerified
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};