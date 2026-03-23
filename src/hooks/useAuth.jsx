// src/hooks/useAuth.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { ADMIN_EMAILS } from '../data/members.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);  // Firebase user
  const [profile, setProfile] = useState(null);  // Firestore member doc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      console.log('🔥 Auth state changed:', fbUser?.email ?? 'logged out');
      if (fbUser) {
        setUser(fbUser);
        console.log('🔍 Looking for Firestore doc at members/', fbUser.uid);
        try {
          const snap = await getDoc(doc(db, 'members', fbUser.uid));
          console.log('📄 Doc exists?', snap.exists());
          console.log('📄 Doc data:', snap.data());
          if (snap.exists()) {
            setProfile({ id: snap.id, ...snap.data() });
            console.log('✅ Profile set!');
          } else {
            console.log('❌ No Firestore document found for this UID');
          }
        } catch(e) {
          console.log('❌ Firestore error:', e.message);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const isAdmin = profile
    ? ADMIN_EMAILS.includes(profile.email) || profile.role?.includes('Admin')
    : false;

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
