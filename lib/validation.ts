import { z } from "zod";

export const RegistrationFormValidation = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Field that will receive the error
  });

export const UserFormValidation = z.object({
  email: z.string().email("Invalid email or password"),
  password: z.string().min(6, { message: "Invalid email or password" }),
});

export const IncomeFormValidation = z.object({
  source: z.string().nonempty("Source is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  date: z
    .date()
    .nullable()
    .transform((val) => val || new Date()),
});

export const ExpenseFormValidation = z.object({
  category: z.string().nonempty("Category is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  date: z
    .date()
    .nullable()
    .transform((val) => val || new Date()),
});

export const GoalFormValidation = z.object({
  title: z.string().nonempty("Title is required"),
  description: z.string().nonempty("Description is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  amountNeeded: z.number().min(1, "Needed amount must be greater than 0"),
});
