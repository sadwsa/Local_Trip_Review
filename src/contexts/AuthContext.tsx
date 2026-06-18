import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, doc } from 'firebase/firestore';
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
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous user document listener if any
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        // Fetch user from Firestore initially and create if not exists
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
        
        // Normalize role to case-sensitive type
        if (dbUser.role) {
          dbUser.role = dbUser.role.toLowerCase() === 'admin' ? 'Admin' : 'Customer';
        }
        setUser(dbUser);
        setIsLoading(false);

        // Listen for user document changes in real time
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeDoc = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const updatedUser: User = {
              id: snapshot.id,
              email: data.email || '',
              name: data.name || 'Unnamed User',
              role: data.role?.toLowerCase() === 'admin' ? 'Admin' : 'Customer',
              avatarUrl: data.avatarUrl,
              bio: data.bio,
              savedDestinations: data.savedDestinations
            };
            setUser(updatedUser);
          }
        }, (error) => {
          console.error("Error listening to user document updates:", error);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
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

