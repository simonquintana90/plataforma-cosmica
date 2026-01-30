import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDY7dnLaXQJEEySEbg1C57VLAWS83rpwDU",
    authDomain: "plataforma-cosmica.firebaseapp.com",
    projectId: "plataforma-cosmica",
    storageBucket: "plataforma-cosmica.appspot.com",
    messagingSenderId: "655686784081",
    appId: "1:655686784081:web:b3c2411cdc2f27f5a71470",
    measurementId: "G-HKXZ2EY3Y9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

export { auth, db, functions, storage };
export default app;
