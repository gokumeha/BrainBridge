import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile,
    deleteUser as deleteFirebaseUser,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth } from "./config";
import { createUserData, getUserData } from "./firestore";

export const signUp = async (name: string, email: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Set the user's display name in Firebase Auth
    await updateProfile(user, { displayName: name });
    // Create the user's document in Firestore
    await createUserData(user.uid, name, user.email);
    return user;
}

export const logIn = async (email: string, password: string): Promise<FirebaseUser> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if the user document already exists in Firestore.
    const userDoc = await getUserData(user.uid);
    if (!userDoc) {
        // If it doesn't exist, create it. This handles first-time Google sign-ins.
        await createUserData(user.uid, user.displayName || 'New User', user.email);
    }
    
    return user;
};

export const logOut = async (): Promise<void> => {
    await signOut(auth);
}

export const deleteCurrentUserAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
        // This is a sensitive operation and may require recent sign-in.
        // For simplicity, we call it directly. In a real app, you might need to re-authenticate the user.
        await deleteFirebaseUser(user);
    } else {
        throw new Error("No user is currently signed in.");
    }
}