import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAYcQ37eKFkzibrhiiZX7_srjEXXU9LF8w',
  authDomain: 'minigames-sala.firebaseapp.com',
  projectId: 'minigames-sala',
  storageBucket: 'minigames-sala.firebasestorage.app',
  messagingSenderId: '196903706058',
  appId: '1:196903706058:web:c90f7a6bda7487b9cd4333',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
