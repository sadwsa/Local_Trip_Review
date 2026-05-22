import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { dbService } from '../models/Database';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  toggleSaveDestination: (destinationId: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user from Firestore
        let dbUser = await dbService.users.getById(firebaseUser.uid);
        if (!dbUser) {
          // Auto create user document with Customer role, but allow specific email as Admin
          const isAdminEmail = firebaseUser.email === 'phuchhce180985@fpt.edu.vn';
          dbUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Unnamed User',
            role: isAdminEmail ? 'Admin' : 'Customer'
          };
          if (firebaseUser.photoURL) {
            dbUser.avatarUrl = firebaseUser.photoURL;
          }
          await dbService.users.create(dbUser, firebaseUser.uid);
        }
        setUser(dbUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const toggleSaveDestination = async (destinationId: string) => {
    if (!user) return;
    
    const savedDestinations = user.savedDestinations || [];
    const isSaved = savedDestinations.includes(destinationId);
    
    let newSavedDestinations: string[];
    
    if (isSaved) {
      newSavedDestinations = savedDestinations.filter(id => id !== destinationId);
    } else {
      newSavedDestinations = [...savedDestinations, destinationId];
    }
    
    // Optimistic update
    const updatedUser = { ...user, savedDestinations: newSavedDestinations };
    setUser(updatedUser);
    
    try {
      await dbService.users.update(user.id, { savedDestinations: newSavedDestinations });
    } catch (e) {
      // Revert on error
      setUser(user);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    
    try {
      await dbService.users.update(user.id, data);
    } catch (e) {
      setUser(user);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading, toggleSaveDestination, updateUserProfile }}>
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

