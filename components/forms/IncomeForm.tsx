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
import { IncomeFormValidation } from "@/lib/validation";
import { IncomeFormProps } from "@/types";
import { addIncome, updateIncome } from "@/store/incomeSlice";
import { AppDispatch, RootState } from "@/store/store";

const IncomeForm = ({ incomeToEdit = null, onEditCancel }: IncomeFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.income);

  const form = useForm<z.infer<typeof IncomeFormValidation>>({
    resolver: zodResolver(IncomeFormValidation),
    defaultValues: incomeToEdit
      ? {
          source: incomeToEdit.source || "",
          amount: incomeToEdit.amount || 0,
          date: incomeToEdit.date ? new Date(incomeToEdit.date) : new Date(), // Ensure date is a Date object
        }
      : {
          source: "",
          amount: 0,
          date: new Date(),
        },
  });

  useEffect(() => {
    if (incomeToEdit) {
      form.reset({
        source: incomeToEdit.source || "",
        amount: incomeToEdit.amount || 0,
        date: incomeToEdit.date ? new Date(incomeToEdit.date) : new Date(), // Ensure date is a Date object
      });
    }
  }, [incomeToEdit, form]);

  const handleAddIncome = async (
    data: z.infer<typeof IncomeFormValidation>
  ) => {
    const parsedData = {
      ...data,
      amount:
        typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
      date: data.date ? data.date.toISOString() : new Date().toISOString(), // Convert to ISO string
    };

    try {
      if (incomeToEdit && incomeToEdit.id) {
        // Update existing income
        await dispatch(updateIncome({ ...parsedData, id: incomeToEdit.id }));
      } else {
        // Add new income
        await dispatch(addIncome(parsedData));
      }

      form.reset({
        source: "",
        amount: 0,
        date: new Date(),
      });

      if (onEditCancel) {
        onEditCancel();
      }
    } catch (error) {
      console.error("Error adding/updating income:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleAddIncome)}
        className="space-y-4 py-4 mx-auto"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="source">Source</FormLabel>
                <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                  <Input
                    id="source"
                    placeholder="Source"
                    {...field}
                    className="w-full"
                  />
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
                <FormLabel htmlFor="amount">Amount</FormLabel>
                <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                  <Input
                    id="amount"
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
              <FormLabel htmlFor="date">Date</FormLabel>
              <FormControl>
                <div className="flex flex-col">
                  <DatePicker
                    id="date"
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy/MM/dd"
                    className="h-10 w-full rounded-md border border-dark-500 bg-dark-400 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    popperPlacement="bottom-start"
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
              ? incomeToEdit
                ? "Updating Income..."
                : "Adding Income..."
              : incomeToEdit
              ? "Update Income"
              : "Add Income"}
          </Button>
          {incomeToEdit && (
            <Button
              type="button"
              onClick={() => {
                form.reset({
                  source: "",
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

export default IncomeForm;
