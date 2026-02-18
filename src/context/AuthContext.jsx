import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collectionGroup,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = new GoogleAuthProvider();

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  /* ================= AUTH LISTENER ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        /* ===== 1️⃣ Agar users da mavjud ===== */
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          setLoading(false);
          return;
        }

        /* ===== 2️⃣ Staff by UID ===== */
        const staffByUidQuery = query(
          collectionGroup(db, "staff"),
          where("uid", "==", currentUser.uid)
        );

        const staffByUidSnap = await getDocs(staffByUidQuery);

        if (!staffByUidSnap.empty) {
          const staffDoc = staffByUidSnap.docs[0];
          const clubId = staffDoc.ref.parent.parent.id;

          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || "",
            photo: currentUser.photoURL || "",
            role: "staff",
            clubId,
            createdAt: serverTimestamp(),
          });

          const newUserSnap = await getDoc(userRef);
          setUserData(newUserSnap.data());
          setLoading(false);
          return;
        }

        /* ===== 3️⃣ Staff by Email ===== */
        const staffEmailQuery = query(
          collectionGroup(db, "staff"),
          where("email", "==", currentUser.email)
        );

        const staffEmailSnap = await getDocs(staffEmailQuery);

        if (!staffEmailSnap.empty) {
          const staffDoc = staffEmailSnap.docs[0];
          const clubId = staffDoc.ref.parent.parent.id;

          await updateDoc(staffDoc.ref, {
            uid: currentUser.uid,
          });

          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || "",
            photo: currentUser.photoURL || "",
            role: "staff",
            clubId,
            createdAt: serverTimestamp(),
          });

          const newUserSnap = await getDoc(userRef);
          setUserData(newUserSnap.data());
          setLoading(false);
          return;
        }

        /* ===== 4️⃣ Owner (new user) ===== */
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || "",
          photo: currentUser.photoURL || "",
          role: "owner",
          clubId: null,
          createdAt: serverTimestamp(),
        });

        const newUserSnap = await getDoc(userRef);
        setUserData(newUserSnap.data());
        setLoading(false);
      } catch (error) {
        console.error("Auth init error:", error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        handleGoogleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
