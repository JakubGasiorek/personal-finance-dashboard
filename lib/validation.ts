import { Goal } from "@/types";
import { z } from "zod";

export const amountValidation = z
  .number({
    invalid_type_error: "Amount must be a valid number",
  })
  .min(0, "Amount must be a positive number")
  .refine((val) => !isNaN(val), {
    message: "Expected a valid number, received nothing",
  });

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
  amount: amountValidation,
  date: z
    .date()
    .nullable()
    .transform((val) => val || new Date()),
});

export const ExpenseFormValidation = z.object({
  category: z.string().nonempty("Category is required"),
  amount: amountValidation,
  date: z
    .date()
    .nullable()
    .transform((val) => val || new Date()),
});

const isTitleUnique = (title: string, goals: Goal[]) => {
  return !goals.some(
    (goal) => goal.title.toLowerCase() === title.toLowerCase()
  );
};

export const GoalFormValidation = (goals: Goal[]) =>
  z
    .object({
      title: z.string().nonempty("Title is required"),
      description: z.string().nonempty("Description is required"),
      amount: amountValidation,
      amountNeeded: z
        .number({
          invalid_type_error: "Needed amount must be a valid number",
        })
        .min(1, "Needed amount must be greater than 0")
        .refine((val) => !isNaN(val), {
          message: "Expected a valid number, received NaN",
        }),
    })
    .refine((data) => isTitleUnique(data.title, goals), {
      message: "A goal with this title already exists.",
      path: ["title"],
    })
    .refine((data) => data.amount <= data.amountNeeded, {
      message:
        "Needed amount must be higher than or equal to the current amount",
      path: ["amountNeeded"],
    });
