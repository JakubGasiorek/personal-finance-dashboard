"use client";

import { useState } from "react";
import SignInForm from "../components/forms/SignInForm";
import SignUpForm from "../components/forms/SignUpForm";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [isSigningIn, setIsSigningIn] = useState(true);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const toggleForm = () => {
    setIsSigningIn((prev) => !prev);
    setSignUpSuccess(false); // Reset success message when toggling
  };

  const handleSignUpSuccess = () => {
    setSignUpSuccess(true);
    setTimeout(() => {
      setIsSigningIn(true); // Redirect to sign-in form after success
    }, 2000); // Show success message for 2 seconds
  };

  return (
    <div className="min-h-screen px-4 flex-center text-white bg-gradient-to-b from-dark-300 via-dark-400 to-dark-300">
      <div className="bg-gradient-to-b from-green-700 via-green-900 to-green-700 rounded-xl">
        <div className="bg-dark-300 md:p-8 p-6 m-2 rounded-xl">
          <h1 className="header text-center text-white mb-6">
            {isSigningIn
              ? "Welcome Back to FinTrack"
              : "Create Your FinTrack Account"}
          </h1>

          {signUpSuccess && !isSigningIn && (
            <p className="text-green-400 text-center mb-4">
              Sign up successful! Redirecting to sign in...
            </p>
          )}

          {isSigningIn ? (
            <SignInForm />
          ) : (
            <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
          )}

          <div className="text-left mt-4">
            <Button
              onClick={toggleForm}
              variant="link"
              className="text-green-400 hover:text-green-300 text-wrap -mx-4"
            >
              {isSigningIn
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </div>
      </div>
      <p className="absolute bottom-4 text-gray-500 text-sm">© 2024 FinTrack</p>
    </div>
  );
};

export default Home;
