import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const usersCollection = firestore().collection('user');

export const signIn = ({email, password}) =>
  auth().signInWithEmailAndPassword(email, password);

export const signUp = ({email, password}) =>
  auth().createUserWithEmailAndPassword(email, password);

export const subscribeAuth = callback => auth().onAuthStateChanged(callback);

export const signOut = () => auth().signOut();

export const createUser = ({id, displayName, photoURL}) => {
  return usersCollection.doc(id).set({
    id,
    displayName,
    photoURL,
  });
};

export const getUser = async id => {
  const doc = await usersCollection.doc(id).get();
  return doc.data();
};
