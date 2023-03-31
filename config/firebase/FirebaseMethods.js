import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getDatabase, push, ref, set, onValue } from "firebase/database";
import app from "./FirebaseConfig";

const database = getDatabase(app); //initializing DB
const auth = getAuth(app); //initializing auth

//===============DataBase Functions===============//

const writeDataToDatabase = (data, nodeName, id) => {
  //id is optional if we don't pass id then it'll automatically generate id with the help of push method from firebase //
  const reference = ref(database, `${nodeName}/${id || ""}`);
  if (!id) {
    const key = push(reference).key;
    data.id = key;
    const newRef = ref(database, `${nodeName}/${data.id}`);
    return set(newRef, data);
  }

  return set(reference, data);
};

const getDataFromDatabase = (nodeName, id) => {
  //by default it'll get all the data in the form of object if want single data then pass nodename and id //

  return new Promise((resolve, reject) => {
    const reference = ref(database, `${nodeName || ""}/${id || ""}`);

    onValue(reference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        resolve(data);
      } else {
        reject("DATA NOT FOUND");
      }
    });
  });
};

//============Authentication Functions==========//
const createUser = (userObj) => {
  //SIGNUP USER FUNCTION
  return new Promise((resolve, reject) => {
    createUserWithEmailAndPassword(auth, userObj.email, userObj.password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        const { uid } = user;
        userObj.uid = uid;
        delete userObj.password;
        writeDataToDatabase(userObj, "users", uid);
        resolve("Successfully Created User");
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const loginUser = (userObj) => {
  //LOGIN USER FUNCTION

  return new Promise((resolve, reject) => {
    signInWithEmailAndPassword(auth, userObj.email, userObj.password)
      .then((userCredential) => {
        // Signed in
        resolve(userCredential);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const signOutUser = () => {
  //SIGNOUT CURRENT USER FUNCTION
  return signOut(auth);
};

const getCurrentUser = () => {
  //GET CURRENT LOGGED IN USER FUNCTION
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        reject("no logged in user found");
      }
    });
  });
};

export {
  createUser,
  writeDataToDatabase,
  getDataFromDatabase,
  loginUser,
  getCurrentUser,
  signOutUser,
};
