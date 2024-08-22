import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/services/firebase";
import { SignUpParams } from "@/types";

export async function signUpUser({ email, password, name }: SignUpParams) {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      name: name,
      createdAt: Timestamp.now(),
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error creating user or adding data: ", error);
    return { success: false, error };
  }
}
