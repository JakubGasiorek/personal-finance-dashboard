"use client";

import { useState } from "react";
import SignInForm from "../components/forms/SignInForm";
import SignUpForm from "../components/forms/SignUpForm";

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
    <div className="text-white flex-center h-screen max-h-screen mx-6">
      <div>
        <h1 className="text-2xl my-4">
          {isSigningIn
            ? "Sign in to your personal finance dashboard"
            : "Sign up for a personal finance dashboard account"}
        </h1>

        {signUpSuccess && !isSigningIn && (
          <p className="text-green-400 mb-4">
            Sign up successful! Redirecting to sign in...
          </p>
        )}

        {isSigningIn ? (
          <SignInForm />
        ) : (
          <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
        )}

        <button
          onClick={toggleForm}
          className="mt-4 text-blue-500 hover:underline"
        >
          {isSigningIn
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>

        <p className="copyright mt-4 py-4">© 2024 FinTrack</p>
      </div>
    </div>
  );
};

export default Home;
