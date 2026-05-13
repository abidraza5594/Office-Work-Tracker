import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/store/useAppStore";

const provider = new GoogleAuthProvider();

export function useAuth() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const addToast = useAppStore((state) => state.addToast);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsAuthLoading(false);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, [setUser]);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase is not configured");
    await signInWithPopup(auth, provider);
    addToast({ type: "success", message: "✅ Signed in successfully" });
  };

  const signInAsGuest = async () => {
    if (!auth) throw new Error("Firebase is not configured");
    await signInAnonymously(auth);
    addToast({ type: "success", message: "✅ Guest mode started" });
  };

  const linkGoogleAccount = async () => {
    if (!auth?.currentUser) return;
    await linkWithPopup(auth.currentUser, provider);
    setUser(auth.currentUser);
    addToast({ type: "success", message: "✅ Google account linked" });
  };

  const updateDisplayName = async (displayName: string) => {
    if (!auth?.currentUser) return;
    await updateProfile(auth.currentUser, { displayName });
    setUser(auth.currentUser);
    addToast({ type: "success", message: "✅ Profile updated" });
  };

  const signOutUser = async () => {
    if (!auth) return;
    await signOut(auth);
    addToast({ type: "success", message: "✅ Signed out" });
  };

  return {
    user,
    isAuthLoading,
    signInWithGoogle,
    signInAsGuest,
    linkGoogleAccount,
    updateDisplayName,
    signOutUser
  };
}
