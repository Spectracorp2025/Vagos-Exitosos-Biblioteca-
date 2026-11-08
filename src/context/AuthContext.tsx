import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authApi, getStoredToken } from '../services/api';
import { signInWithGoogle, auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  loginWithWhatsApp: (phone: string, pass: string) => Promise<void>;
  registerWithWhatsApp: (name: string, phone: string, pass: string, confirm: string) => Promise<void>;
  loginWithGoogleProvider: () => Promise<void>;
  logout: () => void;
  updateUserProfile: (displayName?: string, profileImage?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load current user profile from server if token exists
  useEffect(() => {
    async function loadUser() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const { user: profile } = await authApi.getMe();
        setUser(profile);
      } catch (err) {
        console.warn('Session expired or invalid, clearing token');
        authApi.logout();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  // Listen to Firebase Auth state for Google sign-in support
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && (!user || !token)) {
        try {
          const syncRes = await authApi.syncGoogleUser({
            email: fbUser.email,
            displayName: fbUser.displayName || 'Carlos Eduardo Delgado Rodríguez',
            photoURL: fbUser.photoURL,
            phoneNumber: fbUser.phoneNumber,
          });
          setToken(syncRes.token);
          setUser(syncRes.user);
        } catch {
          const isFounder =
            fbUser.email === 'carlosdelgado.neska@gmail.com' ||
            (fbUser.phoneNumber != null && fbUser.phoneNumber.includes('3009555880'));
          try {
            const idToken = await fbUser.getIdToken();
            setToken(idToken);
          } catch {
            // ignore
          }
          setUser({
            uid: fbUser.uid,
            displayName: fbUser.displayName || 'Carlos Eduardo Delgado Rodríguez',
            role: isFounder ? 'admin' : 'user',
            profileImage: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
            phoneNumber: fbUser.phoneNumber || undefined,
            email: fbUser.email || undefined,
            createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          });
        }
      }
    });
    return () => unsubscribe();
  }, [user, token]);

  const loginWithWhatsApp = async (phone: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ phoneNumber: phone, password: pass });
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithWhatsApp = async (name: string, phone: string, pass: string, confirm: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({
        displayName: name,
        phoneNumber: phone,
        password: pass,
        confirmPassword: confirm,
      });
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleProvider = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      const fbUser = res.user;
      const syncRes = await authApi.syncGoogleUser({
        email: fbUser.email,
        displayName: fbUser.displayName || 'Carlos Eduardo Delgado Rodríguez',
        photoURL: fbUser.photoURL,
        phoneNumber: fbUser.phoneNumber,
      });
      setToken(syncRes.token);
      setUser(syncRes.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    firebaseSignOut(auth).catch(() => {});
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (displayName?: string, profileImage?: string) => {
    const res = await authApi.updateProfile({ displayName, profileImage });
    setUser(res.user);
  };

  const isAdmin =
    user?.role === 'admin' ||
    user?.email === 'carlosdelgado.neska@gmail.com' ||
    (user?.phoneNumber != null && user.phoneNumber.includes('3009555880')) ||
    user?.displayName?.toLowerCase().includes('carlos eduardo') ||
    user?.displayName?.toLowerCase().includes('carlos delgado') ||
    false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        loginWithWhatsApp,
        registerWithWhatsApp,
        loginWithGoogleProvider,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
