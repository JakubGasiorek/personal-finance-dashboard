"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ExpenseFormValidation } from "@/lib/validation";
import { ExpenseFormProps } from "@/types";
import { addExpense, updateExpense } from "@/store/expenseSlice";
import { AppDispatch, RootState } from "@/store/store";

const ExpenseForm = ({
  expenseToEdit = null,
  onEditCancel,
}: ExpenseFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.expense);

  const form = useForm<z.infer<typeof ExpenseFormValidation>>({
    resolver: zodResolver(ExpenseFormValidation),
    defaultValues: expenseToEdit
      ? {
          category: expenseToEdit.category || "",
          amount: expenseToEdit.amount || 0,
          date: expenseToEdit.date ? new Date(expenseToEdit.date) : new Date(),
        }
      : {
          category: "",
          amount: 0,
          date: new Date(),
        },
  });

  useEffect(() => {
    if (expenseToEdit) {
      form.reset({
        ...expenseToEdit,
        date: expenseToEdit.date ? new Date(expenseToEdit.date) : new Date(),
      });
    }
  }, [expenseToEdit, form]);

  const handleAddExpense = async (
    data: z.infer<typeof ExpenseFormValidation>
  ) => {
    try {
      const parsedData = {
        ...data,
        amount:
          typeof data.amount === "string"
            ? parseFloat(data.amount)
            : data.amount,
        date: data.date ? data.date.toISOString() : new Date().toISOString(),
      };

      if (expenseToEdit && expenseToEdit.id) {
        // Update existing expense
        await dispatch(updateExpense({ ...parsedData, id: expenseToEdit.id }));
      } else {
        // Add new expense
        await dispatch(addExpense(parsedData));
      }

      form.reset({
        category: "",
        amount: 0,
        date: new Date(),
      });

      if (onEditCancel) {
        onEditCancel();
      }
    } catch (error) {
      console.error("Error adding/updating expense:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleAddExpense)}
        className="space-y-4 py-4 mx-auto"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                  <Input placeholder="Category" {...field} className="w-full" />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                  <Input
                    type="number"
                    placeholder="Amount"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    value={field.value}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <div className="flex flex-col">
                  <DatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy/MM/dd"
                    className="h-10 w-full rounded-md border border-dark-500 bg-dark-400 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={loading}
            className="btn-add-value w-full"
          >
            {loading
              ? expenseToEdit
                ? "Updating Expense..."
                : "Adding Expense..."
              : expenseToEdit
              ? "Update Expense"
              : "Add Expense"}
          </Button>
          {expenseToEdit && (
            <Button
              type="button"
              onClick={() => {
                form.reset({
                  category: "",
                  amount: 0,
                  date: new Date(),
                });
                if (onEditCancel) {
                  onEditCancel();
                }
              }}
              className="btn-delete w-full"
            >
              Cancel
            </Button>
          )}
        </div>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </Form>
  );
};

export default ExpenseForm;
