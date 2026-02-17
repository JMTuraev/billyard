import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { collectionGroup } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    await signInWithRedirect(auth, provider);
  };

  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error("Redirect error:", error);
      }

      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
          setUser(null);
          setUserData(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        // 🔥 1️⃣ Agar users da mavjud bo‘lsa
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          setLoading(false);
          return;
        }

        // 🔥 2️⃣ Staff collectiondan uid bo‘yicha qidiramiz
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

        // 🔥 3️⃣ Email match (birinchi login)
        const staffEmailQuery = query(
          collectionGroup(db, "staff"),
          where("email", "==", currentUser.email)
        );

        const staffEmailSnap = await getDocs(staffEmailQuery);

        if (!staffEmailSnap.empty) {
          const staffDoc = staffEmailSnap.docs[0];
          const clubId = staffDoc.ref.parent.parent.id;

          // UID ni attach qilamiz
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

        // 🔥 4️⃣ Owner (yangi user)
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
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, handleGoogleLogin, setUserData }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
