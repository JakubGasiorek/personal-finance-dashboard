import { z } from "zod";

export const RegistrationFormValidation = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Field that will receive the error
  });

export const UserFormValidation = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
