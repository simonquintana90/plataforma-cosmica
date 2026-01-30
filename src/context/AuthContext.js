import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile as firebaseUpdateProfile,
    updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import {
    doc,
    onSnapshot,
    setDoc,
    updateDoc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    addDoc,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions, storage } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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

                return () => unsubscribeSnapshot();
            } else {
                setUser(null);
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        userProfile,
        loading,
        auth: {
            ...auth,
            createUserWithEmailAndPassword: (email, password) => createUserWithEmailAndPassword(auth, email, password),
            signInWithEmailAndPassword: (email, password) => signInWithEmailAndPassword(auth, email, password),
            signOut: () => signOut(auth),
        },
        db,
        storage,
        updateProfile: firebaseUpdateProfile,
        updatePassword: firebaseUpdatePassword,
        addDoc,
        collection,
        serverTimestamp,
        getFunctions: () => functions,
        httpsCallable: (fns, name, options) => httpsCallable(fns, name, options),
        query,
        orderBy,
        onSnapshot,
        doc,
        updateDoc,
        getDoc,
        where,
        setDoc,
        deleteDoc
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
