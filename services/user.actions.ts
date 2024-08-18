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

    // Initialize user's financial data
    await setDoc(doc(db, `users/${user.uid}/summary`, "summary"), {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
    });

    await setDoc(doc(db, `users/${user.uid}/income`, "exampleIncome"), {
      source: "Initial Setup",
      amount: 0,
      date: Timestamp.now(),
    });

    await setDoc(doc(db, `users/${user.uid}/expenses`, "exampleExpense"), {
      category: "Initial Setup",
      amount: 0,
      date: Timestamp.now(),
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error creating user or adding data: ", error);
    return { success: false, error };
  }
}
