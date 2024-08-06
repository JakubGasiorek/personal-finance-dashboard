import { useRouter } from "next/navigation";
import { auth } from "@/services/firebase";

const useAuth = () => {
  const router = useRouter();

  const logout = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { logout };
};

export default useAuth;
