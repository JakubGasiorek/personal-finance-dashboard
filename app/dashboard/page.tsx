"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import IncomeForm from "@/components/forms/IncomeForm";
import ExpenseForm from "@/components/forms/ExpenseForm";
import useFinancialData from "@/hooks/useFinancialData";
import { FinancialData, Income, Expense } from "@/types";
import { auth, db } from "@/services/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/Modal";
import IncomeChart from "@/components/charts/IncomeChart";
import ExpenseChart from "@/components/charts/ExpenseChart";
import TransactionHistory from "@/components/TransactionHistory";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData>({
    summary: [],
    income: [],
    expenses: [],
  });

  // State for toggling sections
  const [showIncome, setShowIncome] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeIdToDelete, setIncomeIdToDelete] = useState<string | null>(null);
  const [expenseIdToDelete, setExpenseIdToDelete] = useState<string | null>(
    null
  );

  // Define color maps
  const incomeColorMap: Record<string, string> = {};
  const expenseColorMap: Record<string, string> = {};

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

  const handleExpenseAdded = (newExpense: Expense) => {
    setFinancialData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
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

  const handleExpenseUpdated = (updatedExpense: Expense) => {
    setFinancialData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      ),
    }));
    setExpenseToEdit(null);
  };

  const handleEditCancel = () => {
    setIncomeToEdit(null);
    setExpenseToEdit(null);
  };

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

  const handleDeleteExpense = async (expenseId: string) => {
    if (auth.currentUser) {
      try {
        const userId = auth.currentUser.uid;
        await deleteDoc(doc(db, `users/${userId}/expenses`, expenseId));
        setFinancialData((prev) => ({
          ...prev,
          expenses: prev.expenses.filter((expense) => expense.id !== expenseId),
        }));
        setIsModalOpen(false); // Close the modal after deletion
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    } else {
      console.error("User is not authenticated");
    }
  };

  const openDeleteModal = (id: string, type: "income" | "expense") => {
    if (type === "income") {
      setIncomeIdToDelete(id);
    } else {
      setExpenseIdToDelete(id);
    }
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setIncomeIdToDelete(null);
    setExpenseIdToDelete(null);
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
              <TransactionHistory financialData={financialData} />
            </div>
            <div className="bg-dark-400 p-4 rounded-md">
              <h2 className="text-xl mb-4">Income</h2>
              <IncomeChart
                incomeData={financialData.income}
                colorMap={incomeColorMap}
              />
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
                <ul className="mt-4 px-4">
                  {financialData.income.map((income) => (
                    <li
                      key={income.id}
                      className="flex justify-between items-center bg-dark-300 p-2 rounded-md mb-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{income.source}</p>
                        <p>${income.amount.toFixed(2)}</p>
                        <p>{new Date(income.date).toLocaleDateString()}</p>
                      </div>
                      <div className="space-x-2 flex-shrink-0">
                        <button
                          onClick={() => setIncomeToEdit(income)}
                          className="text-blue-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(income.id!, "income")}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-dark-400 p-4 rounded-md">
              <h2 className="text-xl mb-4">Expenses</h2>
              <ExpenseChart
                expenseData={financialData.expenses}
                colorMap={expenseColorMap}
              />
              <ExpenseForm
                onExpenseAdded={handleExpenseAdded}
                expenseToEdit={expenseToEdit}
                onEditCancel={handleEditCancel}
                onExpenseUpdated={handleExpenseUpdated}
              />
              <button
                onClick={() => setShowExpenses((prev) => !prev)}
                className="flex items-center space-x-2 pl-4 text-blue-500 hover:underline"
              >
                <span>{showExpenses ? "Hide Expenses" : "Show Expenses"}</span>
                <FontAwesomeIcon
                  icon={showExpenses ? faChevronUp : faChevronDown}
                  className="ml-2"
                  size="sm"
                />
              </button>
              {showExpenses && (
                <ul className="mt-4 px-4">
                  {financialData.expenses.map((expense) => (
                    <li
                      key={expense.id}
                      className="flex justify-between items-center bg-dark-300 p-2 rounded-md mb-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{expense.category}</p>
                        <p>${expense.amount.toFixed(2)}</p>
                        <p>{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <div className="space-x-2 flex-shrink-0">
                        <button
                          onClick={() => setExpenseToEdit(expense)}
                          className="text-blue-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            openDeleteModal(expense.id!, "expense")
                          }
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (incomeIdToDelete) handleDeleteIncome(incomeIdToDelete);
          if (expenseIdToDelete) handleDeleteExpense(expenseIdToDelete);
        }}
        title="Confirm Deletion"
        message={`Are you sure you want to delete this ${
          incomeIdToDelete ? "income" : "expense"
        }?`}
      />
    </div>
  );
};

export default Dashboard;
