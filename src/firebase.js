import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile, 
    signOut 
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "firebase/firestore";

// **PEGA TUS CREDENCIALES AQUÍ**
const firebaseConfig = {
    apiKey: "AIzaSyDY7dnLaXQJEEySEbg1C57VLAWS83rpwDU",
    authDomain: "plataforma-cosmica.firebaseapp.com",
    projectId: "plataforma-cosmica",
    storageBucket: "plataforma-cosmica.appspot.com",
    messagingSenderId: "655686784081",
    appId: "1:655686784081:web:b3c2411cdc2f27f5a71470",
    measurementId: "G-HKXZ2EY3Y9"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta todo lo que necesitarás en la aplicación
export { 
    auth, 
    db, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    collection,
    addDoc,
    serverTimestamp
};
