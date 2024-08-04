// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZtkAqXoES2DvgAsijkl2mIwDsnZvkWW0",
  authDomain: "pantry-tracker-2ac6d.firebaseapp.com",
  projectId: "pantry-tracker-2ac6d",
  storageBucket: "pantry-tracker-2ac6d.appspot.com",
  messagingSenderId: "55716291493",
  appId: "1:55716291493:web:e0127b2694895cfe54be4c",
  measurementId: "G-ZH85E6S4ES"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore}