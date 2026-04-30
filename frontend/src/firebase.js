import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJN4J4ljyIz5GsHL2-HFv5L5zZtRcdbqc",
  authDomain: "food-app-4b5fc.firebaseapp.com",
  projectId: "food-app-4b5fc",
  storageBucket: "food-app-4b5fc.firebasestorage.app",
  messagingSenderId: "849815345794",
  appId: "1:849815345794:web:1660ac7c272efa3c93f29b",
  measurementId: "G-8BKJ36T65W"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
