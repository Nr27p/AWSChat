// firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCFJGV1YiJPv0qKN5a8wTvSlNCx38ZSDMs",
  authDomain: "grievancesys-98c2f.firebaseapp.com",
  projectId: "grievancesys-98c2f",
  storageBucket: "grievancesys-98c2f.appspot.com",
  messagingSenderId: "612572703114",
  appId: "1:612572703114:web:e8225dbb3b6e8e90a54073",
  measurementId: "G-T73K595WX1"
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

export { storage };