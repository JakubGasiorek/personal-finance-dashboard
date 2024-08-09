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
import ProgressBarChart from "@/components/charts/ProgressBarChart";
import Modal from "@/components/Modal";

const Goals: React.FC = () => {
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [goalList, setGoalList] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    });
  };

  const handleEditGoal = (goal: Goal) => {
    setGoalToEdit(goal);
  };

  const confirmDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal);
    setIsModalOpen(true);
  };

  const handleEditCancel = () => {
    setGoalToEdit(null);
  };

  return (
    <div className="bg-dark-300">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        logout={logout}
      />
      <div>
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="my-8 px-4 text-white">
          <h1 className="mb-8 text-xl xl:text-3xl text-center">
            Manage Your Goals
          </h1>
          <div className="mx-auto flex flex-col items-center justify-center max-w-5xl lg:flex-row">
            <div className="mb-4 w-full rounded-md bg-dark-400 p-4 lg:mr-8 lg:w-1/3">
              <h2 className="mb-4 text-xl">Set Your Financial Goal</h2>
              <GoalForm
                onGoalAdded={handleAddGoal}
                goalToEdit={goalToEdit}
                onGoalUpdated={handleUpdateGoal}
                onEditCancel={handleEditCancel}
              />
            </div>

            <div className="w-full rounded-md bg-dark-400 p-4 lg:w-2/3">
              <ul className="space-y-4">
                {goalList.map((goal) => (
                  <li key={goal.id} className="rounded-md bg-dark-300 p-4">
                    <div className="mb-2 flex items-center justify-between space-x-4">
                      <div>
                        <span className="block text-lg font-bold">
                          {goal.title}
                        </span>
                        <span className="block text-sm">
                          {goal.description}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditGoal(goal)}
                          className="bg-blue-900 hover:bg-blue-600"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => confirmDeleteGoal(goal)}
                          className="bg-red-900 hover:bg-red-600"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <ProgressBarChart
                      progressPercentage={
                        (goal.amount / goal.amountNeeded) * 100
                      }
                    />
                    <div className="text-right text-sm">
                      ${goal.amount.toFixed(2)} / $
                      {goal.amountNeeded.toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Add modal for adding to the goal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => goalToDelete && handleDeleteGoal(goalToDelete.id)}
        title="Confirm Delete"
        message={`Are you sure you want to delete the goal "${goalToDelete?.title}"?`}
      />
    </div>
  );
};

export default Goals;
