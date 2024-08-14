"use client";

import { useEffect, useState } from "react";
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
import { GoalFormValidation } from "@/lib/validation";
import { GoalFormProps } from "@/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addGoal, updateGoal } from "@/store/goalsSlice";

const GoalForm = ({ goalToEdit = null, onEditCancel }: GoalFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.goals);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof GoalFormValidation>>({
    resolver: zodResolver(GoalFormValidation),
    defaultValues: goalToEdit || {
      title: "",
      description: "",
      amount: 0,
      amountNeeded: 0,
    },
  });

  useEffect(() => {
    if (goalToEdit) {
      form.reset(goalToEdit);
    }
  }, [goalToEdit]);

  const handleAddGoal = async (data: z.infer<typeof GoalFormValidation>) => {
    setIsLoading(true);
    const parsedData = {
      ...data,
      amount:
        typeof data.amount === "string" ? parseFloat(data.amount) : data.amount,
      amountNeeded:
        typeof data.amountNeeded === "string"
          ? parseFloat(data.amountNeeded)
          : data.amountNeeded,
    };

    try {
      if (goalToEdit && goalToEdit.id) {
        // Update existing goal
        await dispatch(updateGoal({ ...parsedData, id: goalToEdit.id }));
      } else {
        // Add new goal
        await dispatch(addGoal(parsedData));
      }

      form.reset({ title: "", description: "", amountNeeded: 0, amount: 0 });
      if (onEditCancel) onEditCancel();
    } catch (error) {
      console.error("Error adding/updating goal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleAddGoal)}
        className="space-y-4 py-4 mx-auto"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                <Input placeholder="Title" {...field} className="w-full" />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  placeholder="Description"
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
              <FormLabel>Starting amount</FormLabel>
              <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  type="number"
                  placeholder="Starting amount"
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
        <FormField
          control={form.control}
          name="amountNeeded"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Needed amount</FormLabel>
              <FormControl className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  type="number"
                  placeholder="Needed amount"
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
        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isLoading || loading}
            className="btn-add-value w-full"
          >
            {isLoading || loading
              ? goalToEdit
                ? "Updating Goal..."
                : "Adding Goal..."
              : goalToEdit
              ? "Update Goal"
              : "Add Goal"}
          </Button>
          {goalToEdit && (
            <Button
              type="button"
              onClick={() => {
                form.reset({
                  title: "",
                  description: "",
                  amountNeeded: 0,
                  amount: 0,
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

export default GoalForm;
