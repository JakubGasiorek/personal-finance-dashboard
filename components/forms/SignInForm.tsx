"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserFormValidation } from "@/lib/validation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/services/firebase";

const SignInForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof UserFormValidation>>({
    resolver: zodResolver(UserFormValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit({
    email,
    password,
  }: z.infer<typeof UserFormValidation>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      form.setError("email", {
        type: "manual",
        message: "Invalid email or password",
      });
      form.setError("password", {
        type: "manual",
        message: "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword() {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", {
        type: "manual",
        message: "Please enter your email to reset your password",
      });
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error(error);
      form.setError("email", {
        type: "manual",
        message: "Failed to send reset email. Please try again",
      });
      return;
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                <Input placeholder="name@mail.com" {...field} />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-800 hover:bg-green-600 w-full"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        <Button
          type="button"
          onClick={handleResetPassword}
          disabled={isResetting}
          className="-ml-4 text-blue-500 hover:underline"
        >
          {isResetting ? "Sending reset email..." : "Forgot your password?"}
        </Button>
      </form>
    </Form>
  );
};

export default SignInForm;
