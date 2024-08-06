"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import useSidebar from "@/hooks/useSidebar";
import useAuth from "@/hooks/useAuth";
import GoalForm from "@/components/forms/GoalForm";

const Goals: React.FC = () => {
  const [goalToEdit, setGoalToEdit] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);
  const [goalList, setGoalList] = useState<
    { id: string; title: string; description: string }[]
  >([]);

  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { logout } = useAuth();

  const handleAddGoal = (goal: {
    id: string;
    title: string;
    description: string;
  }) => {
    setGoalList([...goalList, goal]);
  };

  const handleUpdateGoal = (goal: {
    id: string;
    title: string;
    description: string;
  }) => {
    setGoalList(goalList.map((g) => (g.id === goal.id ? goal : g)));
    setGoalToEdit(null);
  };

  const handleRemoveGoal = (id: string) => {
    setGoalList(goalList.filter((g) => g.id !== id));
  };

  const handleEditGoal = (goal: {
    id: string;
    title: string;
    description: string;
  }) => {
    setGoalToEdit(goal);
  };

  const handleSaveGoals = () => {
    console.log("Goals saved:", goalList);
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
            <h2 className="text-xl mb-4">Set Your Financial Goals</h2>
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
                  className="flex justify-between items-center bg-dark-300 p-2 rounded-md text-white"
                >
                  <span>{goal.title}</span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleEditGoal(goal)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            {/* <Button
              onClick={handleSaveGoals}
              className="bg-green-500 hover:bg-green-600 text-white mt-4"
            >
              Save Goals
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Goals;
