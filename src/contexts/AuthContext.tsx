import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout } from '../firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  notificationsEnabled: boolean;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Listen to profile changes
        const userDoc = doc(db, 'users', user.uid);
        const unsubProfile = onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create initial profile
            const initialProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              notificationsEnabled: true,
              createdAt: Timestamp.now(),
            };
            setDoc(userDoc, initialProfile);
          }
        });
        return () => unsubProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userDoc = doc(db, 'users', user.uid);
    await setDoc(userDoc, { ...profile, ...data }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn: signInWithGoogle, signOut: logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
