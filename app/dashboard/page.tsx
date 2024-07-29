"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import IncomeForm from "@/components/forms/IncomeForm";
import useFinancialData from "@/hooks/useFinancialData";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FinancialData, Income } from "@/types";
import { auth, db } from "@/services/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { getColorForCategory } from "@/lib/colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/Modal";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData>({
    summary: [],
    income: [],
    expenses: [],
  });

  // State for toggling sections
  const [showIncome, setShowIncome] = useState(true);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeIdToDelete, setIncomeIdToDelete] = useState<string | null>(null);

  const router = useRouter();
  const data = useFinancialData();

  useEffect(() => {
    setFinancialData(data);
    setLoading(false);
  }, [data]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const logout = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleIncomeAdded = (newIncome: Income) => {
    setFinancialData((prev) => ({
      ...prev,
      income: [...prev.income, newIncome],
    }));
  };

  const handleIncomeUpdated = (updatedIncome: Income) => {
    setFinancialData((prev) => ({
      ...prev,
      income: prev.income.map((income) =>
        income.id === updatedIncome.id ? updatedIncome : income
      ),
    }));
    setIncomeToEdit(null);
  };

  const handleEditCancel = () => setIncomeToEdit(null);

  const handleDeleteIncome = async (incomeId: string) => {
    if (auth.currentUser) {
      try {
        const userId = auth.currentUser.uid;
        await deleteDoc(doc(db, `users/${userId}/income`, incomeId));
        setFinancialData((prev) => ({
          ...prev,
          income: prev.income.filter((income) => income.id !== incomeId),
        }));
        setIsModalOpen(false); // Close the modal after deletion
      } catch (error) {
        console.error("Error deleting income:", error);
      }
    } else {
      console.error("User is not authenticated");
    }
  };

  const openDeleteModal = (incomeId: string) => {
    setIncomeIdToDelete(incomeId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setIncomeIdToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  const totalIncome = financialData.income.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const totalExpenses = financialData.expenses.reduce(
    (acc, item) => acc + item.amount,
    0
  );
  const netBalance = totalIncome - totalExpenses;

  const incomeColorMap: Record<string, string> = {};
  const expenseColorMap: Record<string, string> = {};

  const incomeCategories = financialData.income.reduce((acc, item) => {
    const source = item.source || "Uncategorized";
    acc[source] = (acc[source] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const expenseCategories = financialData.expenses.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const incomeChartData = {
    labels: Object.keys(incomeCategories),
    datasets: [
      {
        label: "Income",
        data: Object.values(incomeCategories),
        backgroundColor: Object.keys(incomeCategories).map((category) =>
          getColorForCategory(category, incomeColorMap)
        ),
      },
    ],
  };

  const expenseChartData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(expenseCategories),
        backgroundColor: Object.keys(expenseCategories).map((category) =>
          getColorForCategory(category, expenseColorMap)
        ),
      },
    ],
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
        <div className="text-white mt-8 px-4 mb-8">
          <h1 className="flex-center text-xl xl:text-3xl mb-8">
            Welcome to your dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-dark-400 p-4 rounded-md">
              <h2 className="text-xl mb-4">Summary</h2>
              <div className="p-4 bg-dark-300 rounded-md">
                <p>Total Income: ${totalIncome.toFixed(2)}</p>
                <p>Total Expenses: ${totalExpenses.toFixed(2)}</p>
                <p>Net Balance: ${netBalance.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-dark-400 p-4 rounded-md">
              <h2 className="text-xl mb-4">Income</h2>
              <Bar data={incomeChartData} />
              <IncomeForm
                onIncomeAdded={handleIncomeAdded}
                incomeToEdit={incomeToEdit}
                onEditCancel={handleEditCancel}
                onIncomeUpdated={handleIncomeUpdated}
              />
              <button
                onClick={() => setShowIncome((prev) => !prev)}
                className="flex items-center space-x-2 pl-4 text-blue-500 hover:underline"
              >
                <span>{showIncome ? "Hide Income" : "Show Income"}</span>
                <FontAwesomeIcon
                  icon={showIncome ? faChevronUp : faChevronDown}
                  className="ml-2"
                  size="sm"
                />
              </button>
              {showIncome && (
                <>
                  <ul className="mt-4 px-4">
                    {financialData.income.map((income) => (
                      <li
                        key={income.id}
                        className="flex justify-between items-center bg-dark-300 p-2 rounded-md mb-2"
                      >
                        <div>
                          <p>{income.source}</p>
                          <p>${income.amount.toFixed(2)}</p>
                          <p>{new Date(income.date).toLocaleDateString()}</p>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => setIncomeToEdit(income)}
                            className="text-blue-500 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(income.id!)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="bg-dark-400 p-4 rounded-md">
              <h2 className="text-xl mb-4">Expenses</h2>
              <Pie data={expenseChartData} />
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (incomeIdToDelete) handleDeleteIncome(incomeIdToDelete);
        }}
        title="Confirm Deletion"
        message="Are you sure you want to delete this income?"
      />
    </div>
  );
};

export default Dashboard;
