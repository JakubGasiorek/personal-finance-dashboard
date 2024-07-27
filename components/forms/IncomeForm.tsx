"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/services/firebase";
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

interface IncomeFormProps {
  onIncomeAdded: (income: any) => void;
}

const IncomeForm = ({ onIncomeAdded }: IncomeFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof IncomeFormValidation>>({
    resolver: zodResolver(IncomeFormValidation),
    defaultValues: {
      source: "",
      amount: 0,
      date: new Date(),
    },
  });

  const handleAddIncome = async (
    data: z.infer<typeof IncomeFormValidation>
  ) => {
    if (auth.currentUser) {
      setIsLoading(true);
      try {
        // Convert the amount to a number if it's a string
        const parsedData = {
          ...data,
          amount:
            typeof data.amount === "string"
              ? parseFloat(data.amount)
              : data.amount,
          date: data.date || new Date(),
        };

        const userId = auth.currentUser.uid;
        const docRef = await addDoc(
          collection(db, `users/${userId}/income`),
          parsedData
        );
        onIncomeAdded({ ...parsedData, id: docRef.id });
        form.reset();
      } catch (error) {
        console.error("Error adding income:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("User is not authenticated");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleAddIncome)}
        className="space-y-4 p-4 mx-auto"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                  <Input placeholder="Source" {...field} className="w-full" />
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
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-green-800 w-full"
        >
          {isLoading ? "Adding Income..." : "Add Income"}
        </Button>
      </form>
    </Form>
  );
};

export default IncomeForm;
