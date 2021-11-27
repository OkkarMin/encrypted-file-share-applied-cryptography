import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { getAuth } from "@firebase/auth";
import firebaseConfig from "./firebaseConfig";

firebase.initializeApp(firebaseConfig);
const auth = getAuth();

export default firebase;
export { auth };
