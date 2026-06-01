import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from '../firebase';

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
  isOnline: boolean;
  signIn: () => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    // Safety timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn('Auth loading timed out after 8s');
          return false;
        }
        return prev;
      });
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Clean up previous profile listener
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = undefined;
      }

      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        unsubProfile = onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create initial profile
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              notificationsEnabled: true,
              createdAt: Timestamp.now(),
            };
            setDoc(userDoc, initialProfile).catch(err => {
              console.error('Error creating initial profile:', err);
            });
          }
          setLoading(false);
          clearTimeout(timeoutId);
        }, (error) => {
          const isOffline = error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable'));
          
          if (isOffline) {
            console.warn("Firestore is offline or unavailable. Profile features may be limited.");
          } else {
            try {
              handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
            } catch (e) {
               console.warn("Profile fetch failed - check rules or connection.");
            }
          }
          setLoading(false);
          clearTimeout(timeoutId);
        });
      } else {
        setProfile(null);
        setLoading(false);
        clearTimeout(timeoutId);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
      clearTimeout(timeoutId);
    };
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userDoc = doc(db, 'users', user.uid);
    await setDoc(userDoc, { ...profile, ...data }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isOnline, signIn: signInWithGoogle, signOut: logout, updateProfile }}>
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
