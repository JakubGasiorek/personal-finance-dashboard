"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const UnauthorizedPage = () => {
  const router = useRouter();

  const redirectToSignIn = () => {
    router.push("/");
  };

  return (
    <div className="flex-center min-h-screen bg-dark-300 text-white">
      <div className="text-center">
        <h1 className="text-xl xl:text-3xl font-bold mb-4">
          Unauthorized Access
        </h1>
        <p className="mb-4 mx-4">You must be signed in to view this page.</p>
        <Button onClick={redirectToSignIn} className="bg-green-500">
          Go to Sign In
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
