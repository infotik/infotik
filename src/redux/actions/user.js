import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import uuid from "uuid-random";

// import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../firebaseConfig";
import { saveMediaToStorage } from "../../utils/savepost";
import {
  allpostsreq,
  allusername,
  LoadUserFai,
  LoadUserReq,
  LoadUserSuc,
  LoginUserFai,
  LoginUserReq,
  LoginUserSuc,
  LogoutUserFai,
  LogoutUserReq,
  LogoutUserSuc,
  RegisterUserFai,
  RegisterUserReq,
  RegisterUserSuc,
} from "../ActionType";

export const configureGoogleSignIn = () => {
  // GoogleSignin.configure({
  //   webClientId:
  //     "634179897850-5toavm1kcjormgh5ecn5e147hl3tgd2i.apps.googleusercontent.com",
  //   scopes: [],
  //   offlineAccess: true,
  // });
};

// export const GoogleSignUp = () => async (dispatch) => {
//   try {
//     dispatch({
//       type: RegisterUserReq,
//     });
//     await GoogleSignin.hasPlayServices();
//     const userInfo = await GoogleSignin.signIn();
//     // console.log("User info:", userInfo);
//     const { idToken, accessToken } = userInfo;
//     const googleCredential = GoogleAuthProvider.credential(
//       idToken,
//       accessToken
//     );
//     const userCredential = await signInWithCredential(
//       FIREBASE_AUTH,
//       googleCredential
//     );
//     // User is signed in
//     const user = userCredential.user;
//     // console.log("Firebase user:", user);
//     const ref = doc(collection(FIREBASE_DB, "user"), user.uid);
//     const userDoc = await getDoc(ref);
//     if (!userDoc.exists()) {
//       await setDoc(ref, {
//         ...JSON.parse(JSON.stringify(user)),
//         followingCount: 0,
//         followersCount: 0,
//         likesCount: 0,
//         displayName: user.displayName,
//         keywords: [],
//         username: user.email.split("@")[0], // Extract username from email
//       });
//       const usernameref = doc(collection(FIREBASE_DB, "username"), user.uid);
//       await setDoc(usernameref, {
//         username: user.email.split("@")[0], // Extract username from email
//       });
//     } else {
//       const data = {
//         user: userCredential._tokenResponse,
//         message: "User already exists",
//       };
//       dispatch({
//         type: RegisterUserSuc,
//         ...data,
//       });
//       return data;
//     }

//     const data = {
//       user: userCredential._tokenResponse,
//       message: "Register Successfully",
//     };
//     dispatch({
//       type: RegisterUserSuc,
//       ...data,
//     });
//     return true;
//   } catch (error) {
//     dispatch({
//       type: RegisterUserFai,
//       message: "Google Registration Failed",
//     });
//     console.log(error.message);
//     return false;
//   }
// };

export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({
      type: LoginUserReq,
    });

    const isAuthenticate = await signInWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );
    const user = FIREBASE_AUTH.currentUser;
    const docRef = doc(collection(FIREBASE_DB, "user"), user.uid);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      const data = {
        user: docSnap.data(),
        message: "Login Succssfully",
      };
      dispatch({
        type: LoginUserSuc,
        ...data,
      });
    });

    return true;
  } catch (error) {
    dispatch({
      type: LoginUserFai,
      message: "Invalid Email Or Password",
    });
    console.log(error.message);
    return false;
  }
};

export const register =
  (email, password, name, username) => async (dispatch) => {
    try {
      dispatch({
        type: RegisterUserReq,
      });

      const isAuthenticate = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const user = FIREBASE_AUTH.currentUser;

      const ref = doc(collection(FIREBASE_DB, "user"), user.uid);
      await setDoc(ref, {
        ...JSON.parse(JSON.stringify(user)),
        followingCount: 0,
        followersCount: 0,
        likesCount: 0,
        displayName: name,
        keywords: [],
        username,
      });

      const usernmaeref = doc(collection(FIREBASE_DB, "username"), user.uid);
      await setDoc(usernmaeref, {
        username,
      });

      const data = {
        user: isAuthenticate._tokenResponse,
        message: "Register Succssfully",
      };
      dispatch({
        type: RegisterUserSuc,
        ...data,
      });
      return true;
    } catch (error) {
      dispatch({
        type: RegisterUserFai,
        message: "Invalid Email Or Password",
      });
      console.log(error.message);
      return false;
    }
  };

export const logout = () => async (dispatch) => {
  try {
    dispatch({
      type: LogoutUserReq,
    });
    await signOut(FIREBASE_AUTH);
    console.log("User logged out successfully");
    // Optionally, you can perform additional actions after logout
    dispatch({
      type: LogoutUserSuc,
    });
  } catch (error) {
    console.error("Error logging out:", error.message);
    // Handle logout error
    dispatch({
      type: LogoutUserFai,
    });
  }
};

export const saveKeyword = async (keywords) => {
  try {
    const user = FIREBASE_AUTH.currentUser;
    console.log(user.uid);
    const ref = doc(collection(FIREBASE_DB, "user"), user.uid);
    await updateDoc(ref, {
      keywords,
    });
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

export const loadme = () => async (dispatch) => {
  try {
    dispatch({
      type: LoadUserReq,
    });

    FIREBASE_AUTH.onAuthStateChanged((exists) => {
      if (exists) {
        const user = FIREBASE_AUTH.currentUser;

        const docRef = doc(collection(FIREBASE_DB, "user"), user.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          const data = {
            user: docSnap.data(),
          };
          dispatch({
            type: LoadUserSuc,
            ...data,
          });
        });
      } else {
        dispatch({
          type: LoadUserFai,
        });
      }
    });
  } catch (error) {}
};

export const createPost = async (
  description,
  video,
  thumbnail,
  newstitle,
  newsdescription,
  newslink,
  hashtags
) => {
  try {
    console.log("saveing....");

    let storagePostId = uuid();
    let media = await Promise.all([
      saveMediaToStorage(
        video,
        `post/${FIREBASE_AUTH.currentUser.uid}/${storagePostId}/video`
      ),
      saveMediaToStorage(
        thumbnail,
        `post/${FIREBASE_AUTH.currentUser.uid}/${storagePostId}/thumbnail`
      ),
    ]);

    const ref = doc(collection(FIREBASE_DB, "post"), storagePostId);
    await setDoc(ref, {
      creator: FIREBASE_AUTH.currentUser.uid,
      media,
      description,
      likesCount: 0,
      commentsCount: 0,
      comments: [],
      creation: serverTimestamp(),
      uid: storagePostId,
      newstitle,
      newsdescription,
      newslink,
      hashtags,
      approved: false,
    });

    return true;
  } catch (error) {
    console.log(error.message, "error");
    return false;
  }
};

export const saveUserProfileImage = (avatar) => async (dispatch) => {
  try {
    const url = await saveMediaToStorage(
      avatar,
      `user/${FIREBASE_AUTH.currentUser.uid}/avatar`
    );
    const docRefUser = doc(
      collection(FIREBASE_DB, "user"),
      FIREBASE_AUTH.currentUser.uid
    );
    await updateDoc(docRefUser, {
      photoURL: url,
    });

    const userSnapShot = await getDoc(docRefUser);
    if (userSnapShot.exists()) {
      const user = userSnapShot.data();
      dispatch({
        type: LoadUserSuc,
        user,
      });
    }
  } catch (error) {
    console.log(error.message, "error");
  }
};

export const saveUserField = (name, value) => async (dispatch) => {
  try {
    const obj = {};
    obj[name] = value;
    const docRefUser = doc(
      collection(FIREBASE_DB, "user"),
      FIREBASE_AUTH.currentUser.uid
    );
    await updateDoc(docRefUser, obj);

    if (name == "username") {
      const docRefUsername = doc(
        collection(FIREBASE_DB, "username"),
        FIREBASE_AUTH.currentUser.uid
      );
      await setDoc(docRefUsername, { username: value });
    }

    const userSnapShot = await getDoc(docRefUser);
    if (userSnapShot.exists()) {
      const user = userSnapShot.data();
      dispatch({
        type: LoadUserSuc,
        user,
      });
    }
  } catch (error) {
    console.log(error.message, "error");
  }
};

export const getPost = () => async (dispatch) => {
  try {
    const q = query(
      collection(FIREBASE_DB, "post")
      // where("approved", "==", true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = [];
      snapshot.forEach((doc) => {
        postData.push({ id: doc.id, ...doc.data() });
      });

      dispatch({
        type: allpostsreq,
        posts: JSON.parse(JSON.stringify(postData)),
      });
    });
  } catch (error) {
    console.log(error.message, "error");
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    const docSnapshot = await getDoc(doc(collection(FIREBASE_DB, "user"), id));
    if (docSnapshot.exists()) {
      return docSnapshot.data();
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getPostsByUserId = (id) => async (dispatch) => {
  try {
    console.log(id);
    const q = query(
      collection(FIREBASE_DB, "post"),
      where("creator", "==", id)
    );
    console.log("hello world");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = [];
      snapshot.forEach((doc) => {
        postData.push({ id: doc.id, ...doc.data() });
      });

      dispatch({
        type: "userposts",
        posts: JSON.parse(JSON.stringify(postData)),
        id,
      });
    });
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getUsername = () => async (dispatch) => {
  try {
    const unsubscribe = onSnapshot(
      collection(FIREBASE_DB, "username"),
      (snapshot) => {
        const username = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          username.push(data.username);
        });

        dispatch({
          type: allusername,
          usernames: JSON.parse(JSON.stringify(username)),
        });
      }
    );
  } catch (error) {
    console.log(error.message, "error");
    return [];
  }
};

export const LikePost = async (id) => {
  try {
    const docRefPost = doc(collection(FIREBASE_DB, "post"), id);
    const docRefLike = doc(collection(FIREBASE_DB, "like"), id);
    const docSnapshotPost = await getDoc(docRefPost);
    const docSnapshotLike = await getDoc(docRefLike);
    if (docSnapshotPost.exists()) {
      if (docSnapshotLike.exists()) {
        const dataLike = docSnapshotLike.data();
        const data = docSnapshotPost.data();
        if (dataLike.users.includes(FIREBASE_AUTH.currentUser.uid)) {
          await updateDoc(docRefPost, {
            likesCount: dataLike.users.length - 1,
          });
          await updateDoc(docRefLike, {
            users: [
              ...dataLike.users.filter(
                (uid) => uid != FIREBASE_AUTH.currentUser.uid
              ),
            ],
          });
        } else {
          await updateDoc(docRefPost, {
            likesCount: dataLike.users.length + 1,
          });
          await updateDoc(docRefLike, {
            users: [...dataLike.users, FIREBASE_AUTH.currentUser.uid],
          });
        }
      } else {
        await updateDoc(docRefPost, {
          likesCount: 1,
        });

        await setDoc(docRefLike, {
          users: [FIREBASE_AUTH.currentUser.uid],
        });
      }
    }
  } catch (error) {
    console.log(error.message, "error");
    return [];
  }
};

export const followUser = async (userId, isFollow) => {
  try {
    const docRefFollow = doc(collection(FIREBASE_DB, "follow"), userId);
    const docRefUserFollowing = doc(
      collection(FIREBASE_DB, "user"),
      FIREBASE_AUTH.currentUser.uid
    );
    const docRefFollowing = doc(
      collection(FIREBASE_DB, "following"),
      FIREBASE_AUTH.currentUser.uid
    );
    const docRefUser = doc(collection(FIREBASE_DB, "user"), userId);

    const docSnapshotFollow = await getDoc(docRefFollow);
    const docSnapshotFollowing = await getDoc(docRefFollowing);
    const docRefUserFollowingSnapshot = await getDoc(docRefUserFollowing);

    if (docSnapshotFollow.exists()) {
      console.log("Exist");
      const followData = docSnapshotFollow.data();
      if (isFollow) {
        console.log("Exist and follow");
        await updateDoc(docRefUser, {
          followersCount: followData.users.length - 1,
        });
        await updateDoc(docRefFollow, {
          users: followData.users.filter(
            (uid) => uid !== FIREBASE_AUTH.currentUser.uid
          ),
        });

        await updateDoc(docRefUserFollowing, {
          followingCount: docRefUserFollowingSnapshot.data().followingCount - 1,
        });

        if (!docSnapshotFollowing.exists()) {
          await setDoc(docRefFollowing, {
            users: [],
          });
        } else {
          await updateDoc(docRefFollowing, {
            users: docSnapshotFollowing
              .data()
              .users.filter((uid) => uid !== userId),
          });
        }
      } else {
        console.log("Exist but not follow");
        await updateDoc(docRefUser, {
          followersCount: followData.users.length + 1,
        });
        await updateDoc(docRefFollow, {
          users: [...followData.users, FIREBASE_AUTH.currentUser.uid],
        });

        await updateDoc(docRefUserFollowing, {
          followingCount: docRefUserFollowingSnapshot.data().followingCount + 1,
        });

        if (!docSnapshotFollowing.exists()) {
          await setDoc(docRefFollowing, {
            users: [userId],
          });
        } else {
          await updateDoc(docRefFollowing, {
            users: [...docSnapshotFollowing.data().users, userId],
          });
        }
      }
    } else {
      console.log("Not exist");
      await updateDoc(docRefUser, {
        followersCount: 1,
      });

      await setDoc(docRefFollow, {
        users: [FIREBASE_AUTH.currentUser.uid],
      });

      await updateDoc(docRefUserFollowing, {
        followingCount: docRefUserFollowingSnapshot.data().followingCount + 1,
      });

      if (!docSnapshotFollowing.exists()) {
        await setDoc(docRefFollowing, {
          users: [userId],
        });
      } else {
        await updateDoc(docRefFollowing, {
          users: [...docSnapshotFollowing.data().users, userId],
        });
      }
    }
  } catch (error) {
    console.error("Error in followUser function: ", error);
  }
};

export const checkFollow = async (id) => {
  try {
    const docRef = doc(collection(FIREBASE_DB, "follow"), id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return data.users.includes(FIREBASE_AUTH.currentUser.uid);
    }

    return docSnapshot.exists();
  } catch (error) {
    console.log(error.message, "error");
    return false;
  }
};

export const checkLike = async (id) => {
  try {
    const docRef = doc(collection(FIREBASE_DB, "like"), id);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();

      return data.users.includes(FIREBASE_AUTH.currentUser.uid);
    }

    return docSnapshot.exists();
  } catch (error) {
    console.log(error.message, "error");
    return false;
  }
};

export const getUserByQuery = async (queryText) => {
  try {
    const q = query(
      collection(FIREBASE_DB, "user"),
      where("username", ">=", queryText),
      where("username", "<=", queryText + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return users;
  } catch (error) {
    console.log(error.message, "error");
    return [];
  }
};

export const getPostByKeywords = async (keywords) => {
  try {
    const q = query(
      collection(FIREBASE_DB, "post"),
      where("hashtags", "array-contains-any", [keywords]) // Use "array-contains-any" to filter posts by multiple keywords
    );

    const querySnapshot = await getDocs(q);

    const postData = [];
    querySnapshot.forEach((doc) => {
      postData.push({ id: doc.id, ...doc.data() });
    });

    return postData;
  } catch (error) {
    console.log(error.message, "error");
    return [];
  }
};
