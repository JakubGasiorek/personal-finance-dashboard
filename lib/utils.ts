import { auth } from "@/services/firebase";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AuthenticatedAction = (userId: string) => Promise<void>;

export async function withAuthenticatedUser(action: AuthenticatedAction) {
  return new Promise<void>((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {
        unsubscribe();

        if (!user) {
          console.error("User is not authenticated");
          reject(new Error("User is not authenticated"));
          return;
        }

        const userId = user.uid;
        try {
          await action(userId);
          resolve();
        } catch (error) {
          console.error("Error performing authenticated action:", error);
          reject(error);
        }
      },
      (error) => {
        console.error("Error checking authentication state:", error);
        reject(error);
      }
    );
  });
}
