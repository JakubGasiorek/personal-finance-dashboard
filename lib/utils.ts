import { auth } from "@/services/firebase";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AuthenticatedAction<T> = (userId: string) => Promise<T>;

export async function withAuthenticatedUser<T>(
  action: AuthenticatedAction<T>
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
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
          const result = await action(userId);
          resolve(result);
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
