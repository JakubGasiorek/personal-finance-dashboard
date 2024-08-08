"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import useSidebar from "@/hooks/useSidebar";
import useAuth from "@/hooks/useAuth";
import GoalForm from "@/components/forms/GoalForm";
import { db } from "@/services/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { Goal } from "@/types";
import { withAuthenticatedUser } from "@/lib/utils";

const Goals: React.FC = () => {
  const [goalToEdit, setGoalToEdit] = useState<{
    id: string;
    title: string;
    description: string;
    amount: number;
    amountNeeded: number;
  } | null>(null);

  const [goalList, setGoalList] = useState<
    {
      id: string;
      title: string;
      description: string;
      amount: number;
      amountNeeded: number;
    }[]
  >([]);

  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        await withAuthenticatedUser(async (userId) => {
          const goalsSnapshot = await getDocs(
            collection(db, `users/${userId}/goals`)
          );
          const goalsData = goalsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Goal[];
          setGoalList(goalsData);
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchGoals();
  }, []);

  const handleAddGoal = (goal: Goal) => {
    setGoalList([...goalList, goal]);
  };

  const handleUpdateGoal = (goal: Goal) => {
    setGoalList(goalList.map((g) => (g.id === goal.id ? goal : g)));
    setGoalToEdit(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    await withAuthenticatedUser(async (userId) => {
      try {
        await deleteDoc(doc(db, `users/${userId}/goals`, goalId));
        setGoalList(goalList.filter((goal) => goal.id !== goalId));
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    });
  };

  const handleEditGoal = (goal: Goal) => {
    setGoalToEdit(goal);
  };

  return (
    <div className="flex min-h-screen bg-dark-300">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        logout={logout}
      />
      <div className="flex-1">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="text-white mt-8 px-4 mb-8 flex flex-col items-center">
          <h1 className="text-xl xl:text-3xl mb-8">Manage Your Goals</h1>
          <div className="bg-dark-400 p-4 rounded-md max-w-2xl w-full">
            <h2 className="text-xl mb-4">Set Your Financial Goal</h2>
            <GoalForm
              onGoalAdded={handleAddGoal}
              goalToEdit={goalToEdit}
              onEditCancel={() => setGoalToEdit(null)}
              onGoalUpdated={handleUpdateGoal}
            />
            <ul className="mt-6 space-y-2">
              {goalList.map((goal) => (
                <li
                  key={goal.id}
                  className="flex justify-between items-center bg-dark-300 p-2 rounded-md"
                >
                  {/* Add progress bar for this */}
                  <span>{goal.title}</span>
                  <span className="text-xs">{goal.description}</span>
                  <span className="text-xs">{goal.amount}</span>
                  <span className="text-xs">{goal.amountNeeded}</span>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEditGoal(goal)}
                      className="bg-blue-900 hover:bg-blue-600"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="bg-red-900 hover:bg-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
