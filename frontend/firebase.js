// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDJN4J4ljyIz5GsHL2-HFv5L5zZtRcdbqc",
    authDomain: "food-app-4b5fc.firebaseapp.com",
    projectId: "food-app-4b5fc",
    storageBucket: "food-app-4b5fc.firebasestorage.app",
    messagingSenderId: "849815345794",
    appId: "1:849815345794:web:1660ac7c272efa3c93f29b",
    measurementId: "G-8BKJ36T65W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);