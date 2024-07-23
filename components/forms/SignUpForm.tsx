
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
import { RegistrationFormValidation } from "@/lib/validation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/services/firebase";

interface SignUpFormProps {
  onSignUpSuccess: () => void;
}

const SignUpForm = ({ onSignUpSuccess }: SignUpFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof RegistrationFormValidation>>({
    resolver: zodResolver(RegistrationFormValidation),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit({
    email,
    password,
  }: z.infer<typeof RegistrationFormValidation>) {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onSignUpSuccess(); // Notify parent component of success
    } catch (error) {
      console.error(error);
      form.setError("email", {
        type: "manual",
        message: "Error creating account",
      });
      form.setError("password", {
        type: "manual",
        message: "Error creating account",
      });
    } finally {
      setIsLoading(false);
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
          className="bg-green-800 w-full"
        >
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
