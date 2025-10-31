'use client';

import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { createClient } from '@/libs/supabase/client';

// 1. Define the Context Value Type
interface UserContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<{ error: Error | null }>;
  loading: boolean;
}

// 2. Create the Context
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Custom hook to access the authenticated user, session, loading state, and sign-out function.
 */
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a SupabaseUserProvider.');
  }
  return context;
}

interface SupabaseUserProviderProps {
  initialSession: Session | null;
  children: ReactNode;
}

export const SupabaseUserProvider: FC<SupabaseUserProviderProps> = ({
  initialSession,
  children,
}) => {
  const supabase = createClient();

  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user || null);
  const [saving, setSaving] = useState<boolean>(false); // Renamed 'loading' to 'saving' for sign-out button

  // Set initial auth loading based on whether a session was passed in
  const [authLoading, setAuthLoading] = useState<boolean>(!initialSession);

  useEffect(() => {
    let _isMounted = true; // Flag to prevent state update on unmounted component

    // Only run getSession if we don't have an initial session
    if (!initialSession) {
      supabase.auth.getSession().then(({ data: { session: newSession } }) => {
        if (_isMounted) {
          setSession(newSession);
          setUser(newSession?.user || null);
          setAuthLoading(false);
        }
      });
    }

    // This sets up the real-time listener for Auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (_isMounted) {
        setSession(newSession);
        setUser(newSession?.user || null);

        // Ensure authLoading is false after the first state change listener fires
        if (authLoading) {
          setAuthLoading(false);
        }
      }
    });

    return () => {
      _isMounted = false; // Cleanup flag
      subscription?.unsubscribe();
    };
  }, [supabase, initialSession, authLoading]); // Added initialSession to dependencies

  const signOut = async () => {
    setSaving(true);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    setSaving(false);
    return { error };
  };

  const value: UserContextType = {
    user,
    session,
    signOut,
    loading: authLoading || saving, // FIX: Combined authLoading with new 'saving' state
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
