import { useState, useEffect } from 'react'
import firebase from './firebase';


const formatAuthUser = (user) => ({
  uid: user.uid,
  email: user.email
});

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authStateChanged = async (authState) => {
    if (!authState) {
      setLoading(false)
      return;
    }

    setLoading(true)

    var formattedUser = formatAuthUser(authState);

    setAuthUser(formattedUser);

    setLoading(false);

  };

  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

  const signInWithEmailAndPassword = (email, password) => 
    firebase.auth().signInWithEmailAndPassword(email, password);

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return await firebase.auth().signInWithPopup(provider);
  }

  const getRedirectResult = async () => 
    await firebase.auth().getRedirectResult();
    
  
  const signInWithCustomToken = async () => {
    const customToken = localStorage.getItem("customToken");
    await firebase.auth().signInWithCustomToken(customToken);
  }

  const createUserWithEmailAndPassword = (email, password) =>
    firebase.auth().createUserWithEmailAndPassword(email, password);

  const signOut = () => {
    localStorage.removeItem("customToken");
    firebase.auth().signOut().then(clear);
  };

  const requestJwtToken = async () => {
    const token = await firebase.auth().currentUser.getIdToken(true);
    return token;
  }

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    requestJwtToken,
    signInWithCustomToken,
    signInWithGoogle,
    getRedirectResult
  };
}
