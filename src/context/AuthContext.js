import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(undefined);
    const [firebaseServices, setFirebaseServices] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const firebaseConfig = {
            apiKey: "AIzaSyDY7dnLaXQJEEySEbg1C57VLAWS83rpwDU",
            authDomain: "plataforma-cosmica.firebaseapp.com",
            projectId: "plataforma-cosmica",
            storageBucket: "plataforma-cosmica.appspot.com",
            messagingSenderId: "655686784081",
            appId: "1:655686784081:web:b3c2411cdc2f27f5a71470",
            measurementId: "G-HKXZ2EY3Y9"
        };

        const loadFirebase = async () => {
            try {
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js');
                const { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, updatePassword } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js');
                const { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, getDoc, where, setDoc } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js');
                const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-functions.js');
                const { getStorage } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js');

                const app = initializeApp(firebaseConfig);
                const auth = getAuth(app);
                const db = getFirestore(app);
                const storage = getStorage(app);

                setFirebaseServices({
                    auth: { ...auth, createUserWithEmailAndPassword: (e, p) => createUserWithEmailAndPassword(auth, e, p), signInWithEmailAndPassword: (e, p) => signInWithEmailAndPassword(auth, e, p), signOut: () => signOut(auth), },
                    db,
                    storage,
                    updateProfile,
                    updatePassword,
                    addDoc,
                    collection,
                    serverTimestamp,
                    getFunctions: () => getFunctions(app),
                    httpsCallable,
                    query,
                    orderBy,
                    onSnapshot,
                    doc,
                    updateDoc,
                    getDoc,
                    where,
                    setDoc
                });

                const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
                    if (currentUser) {
                        setUser(currentUser);
                        const userDocRef = doc(db, "users", currentUser.uid);

                        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                            if (docSnap.exists()) {
                                setUserProfile(docSnap.data());
                            } else {
                                setUserProfile(null);
                            }
                            setLoading(false);
                        }, (error) => {
                            console.error("Error de Firestore al leer el perfil:", error);
                            setUserProfile(null);
                            setLoading(false);
                        });

                        return unsubscribeSnapshot;
                    } else {
                        setUser(null);
                        setUserProfile(null);
                        setLoading(false);
                    }
                });

                return unsubscribeAuth;

            } catch (error) {
                console.error("Error al cargar Firebase:", error);
                setLoading(false);
            }
        };

        const unsubscribePromise = loadFirebase();

        return () => {
            unsubscribePromise.then(unsub => unsub && unsub());
        };
    }, []);

    const value = {
        user,
        userProfile,
        loading,
        ...firebaseServices
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
