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

const GoalForm = ({
  onGoalAdded,
  goalToEdit = null,
  onEditCancel,
  onGoalUpdated,
}: GoalFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof GoalFormValidation>>({
    resolver: zodResolver(GoalFormValidation),
    defaultValues: goalToEdit || {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (goalToEdit) {
      form.reset(goalToEdit);
    }
  }, [goalToEdit]);

  const handleAddGoal = async (data: z.infer<typeof GoalFormValidation>) => {
    setIsLoading(true);
    try {
      if (goalToEdit && goalToEdit.id) {
        // Update existing goal
        if (onGoalUpdated) {
          onGoalUpdated({ ...data, id: goalToEdit.id });
        }
      } else {
        // Add new goal
        onGoalAdded({ ...data, id: Date.now().toString() });
      }
      form.reset({ title: "", description: "" });
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
        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-800 w-full"
          >
            {isLoading
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
                form.reset({ title: "", description: "" });
                if (onEditCancel) {
                  onEditCancel();
                }
              }}
              className="bg-red-800 w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default GoalForm;
