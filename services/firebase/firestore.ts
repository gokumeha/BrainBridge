import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./config";
import { User, UserProgress, Source } from "../../types";

const usersCollection = collection(db, "users");

export const createUserData = async (
  userId: string,
  name: string,
  email: string | null
): Promise<User> => {
  const newUserProgress: UserProgress = {
    points: 0,
    pomodoroSessions: 0,
    quizzesTaken: 0,
    quizScores: [],
  };

  const newUser: Omit<User, 'passwordHash'> = {
    id: userId,
    name,
    email: email || '',
    progress: newUserProgress,
    sources: [],
  };
  
  await setDoc(doc(usersCollection, userId), newUser);
  return newUser as User;
};

export const getUserData = async (userId: string): Promise<User | null> => {
  const userDocRef = doc(usersCollection, userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const userData = userDoc.data() as User;
    // Convert Firestore Timestamps to JS Dates for quizScores
    if (userData.progress && userData.progress.quizScores) {
        userData.progress.quizScores = userData.progress.quizScores.map(score => ({
            ...score,
            // Firestore timestamps need to be converted to JS Date objects
            date: (score.date as any).toDate() 
        }));
    }
    return userData;
  }
  return null;
};

export const updateUserProgress = async (userId: string, progressUpdate: Partial<UserProgress>): Promise<void> => {
    const userDocRef = doc(usersCollection, userId);
    const updates: { [key: string]: any } = {};
    // This creates dot notation paths to update nested objects in Firestore
    Object.keys(progressUpdate).forEach(key => {
        updates[`progress.${key}`] = (progressUpdate as any)[key];
    });
    await updateDoc(userDocRef, updates);
}

export const updateUserSources = async (userId: string, sources: Source[]): Promise<void> => {
    const userDocRef = doc(usersCollection, userId);
    await updateDoc(userDocRef, { sources });
};


export const getAllUsers = async (): Promise<User[]> => {
    const querySnapshot = await getDocs(usersCollection);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data() as User);
    });
    return users;
}

export const deleteUserData = async (userId: string): Promise<void> => {
    const userDocRef = doc(usersCollection, userId);
    await deleteDoc(userDocRef);
}
