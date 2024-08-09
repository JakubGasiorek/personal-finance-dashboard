"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import IncomeForm from "@/components/forms/IncomeForm";
import ExpenseForm from "@/components/forms/ExpenseForm";
import useFinancialData from "@/hooks/useFinancialData";
import useSidebar from "@/hooks/useSidebar";
import useAuth from "@/hooks/useAuth";
import { FinancialData, Income, Expense } from "@/types";
import { db } from "@/services/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/Modal";
import IncomeChart from "@/components/charts/IncomeChart";
import ExpenseChart from "@/components/charts/ExpenseChart";
import TransactionHistory from "@/components/TransactionHistory";
import PaginatedList from "@/components/PaginatedList";
import { withAuthenticatedUser } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 3;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData>({
    summary: [],
    income: [],
    expenses: [],
  });

  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { logout } = useAuth();

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

  const data = useFinancialData();

  useEffect(() => {
    setFinancialData(data);
    setLoading(false);
  }, [data]);

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
    await withAuthenticatedUser(async (userId) => {
      try {
        await deleteDoc(doc(db, `users/${userId}/income`, incomeId));
        setFinancialData((prev) => ({
          ...prev,
          income: prev.income.filter((income) => income.id !== incomeId),
        }));
        setIsModalOpen(false); // Close the modal after deletion
      } catch (error) {
        console.error("Error deleting income:", error);
      }
    });
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await withAuthenticatedUser(async (userId) => {
      try {
        await deleteDoc(doc(db, `users/${userId}/expenses`, expenseId));
        setFinancialData((prev) => ({
          ...prev,
          expenses: prev.expenses.filter((expense) => expense.id !== expenseId),
        }));
        setIsModalOpen(false); // Close the modal after deletion
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    });
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
    <div className="bg-dark-300">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        logout={logout}
      />
      <div>
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="text-white my-8 px-4">
          <h1 className="text-center text-xl xl:text-3xl mb-8">
            Welcome to your dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-dark-400 p-4 rounded-md lg:col-span-1 md:col-span-2">
              <h2 className="text-xl mb-4">Summary</h2>
              <div className="p-3 space-y-1 bg-dark-300 rounded-md text-lg">
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
                <div className="mt-4">
                  <PaginatedList
                    items={financialData.income}
                    itemsPerPage={ITEMS_PER_PAGE}
                    renderItem={(income) => (
                      <div
                        key={income.id}
                        className="flex justify-between items-center bg-dark-300 p-2 rounded-md mb-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{income.source}</p>
                          <p>${income.amount.toFixed(2)}</p>
                          <p>{new Date(income.date).toLocaleDateString()}</p>
                        </div>
                        <div className="space-x-2 flex-shrink-0">
                          <Button
                            onClick={() => setIncomeToEdit(income)}
                            className="bg-blue-900 hover:bg-blue-600 "
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() =>
                              openDeleteModal(income.id!, "income")
                            }
                            className="bg-red-900 hover:bg-red-600 text-white"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                </div>
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
                <div className="mt-4">
                  <PaginatedList
                    items={financialData.expenses}
                    itemsPerPage={ITEMS_PER_PAGE}
                    renderItem={(expense) => (
                      <div
                        key={expense.id}
                        className="flex justify-between items-center bg-dark-300 p-2 rounded-md mb-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{expense.category}</p>
                          <p>${expense.amount.toFixed(2)}</p>
                          <p>{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                        <div className="space-x-2 flex-shrink-0">
                          <Button
                            onClick={() => setExpenseToEdit(expense)}
                            className="bg-blue-900 hover:bg-blue-600 "
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() =>
                              openDeleteModal(expense.id!, "expense")
                            }
                            className="bg-red-900 hover:bg-red-600 "
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                </div>
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
