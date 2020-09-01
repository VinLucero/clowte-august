import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQPZ4zKZ7aJUdiT4r71frQRRHNdrwgca4",
  authDomain: "clowte-prototype.firebaseapp.com",
  databaseURL: "https://clowte-prototype.firebaseio.com",
  projectId: "clowte-prototype",
  storageBucket: "clowte-prototype.appspot.com",
  messagingSenderId: "405655459534",
  appId: "1:405655459534:web:a62a2edf4f6f4296af229f",
  measurementId: "G-SFGGY1ZH9Q"
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();