"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchIncome,
  addIncome,
  updateIncome,
  deleteIncome,
} from "@/store/incomeSlice";
import {
  fetchExpense,
  addExpense,
  updateExpense,
  deleteExpense,
} from "@/store/expenseSlice";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import IncomeForm from "@/components/forms/IncomeForm";
import ExpenseForm from "@/components/forms/ExpenseForm";
import Modal from "@/components/Modal";
import IncomeChart from "@/components/charts/IncomeChart";
import ExpenseChart from "@/components/charts/ExpenseChart";
import PaginatedList from "@/components/PaginatedList";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import useSidebar from "@/hooks/useSidebar";
import useAuth from "@/hooks/useAuth";
import TransactionHistory from "@/components/TransactionHistory";
import { Income, Expense } from "@/types";
import { withAuthenticatedUser } from "@/lib/utils";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 3;

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const income = useSelector((state: RootState) => state.income.income);
  const expenses = useSelector((state: RootState) => state.expense.expense);
  const incomeLoading = useSelector((state: RootState) => state.income.loading);
  const expenseLoading = useSelector(
    (state: RootState) => state.expense.loading
  );

  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { logout } = useAuth();

  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeIdToDelete, setIncomeIdToDelete] = useState<string | null>(null);
  const [expenseIdToDelete, setExpenseIdToDelete] = useState<string | null>(
    null
  );
  const [showIncome, setShowIncome] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);

  const router = useRouter();

  useEffect(() => {
    withAuthenticatedUser(async () => {
      dispatch(fetchIncome());
      dispatch(fetchExpense());
    }).catch((error) => {
      console.error("User is not authenticated:", error);
      router.push("/"); // Redirect to login page if not authenticated
    });
  }, [dispatch, router]);

  const handleIncomeAdded = (newIncome: Income) =>
    dispatch(addIncome(newIncome));

  const handleExpenseAdded = (newExpense: Expense) =>
    dispatch(addExpense(newExpense));

  const handleIncomeUpdated = (updatedIncome: Income) => {
    dispatch(updateIncome(updatedIncome));
    setIncomeToEdit(null);
  };

  const handleExpenseUpdated = (updatedExpense: Expense) => {
    dispatch(updateExpense(updatedExpense));
    setExpenseToEdit(null);
  };

  const handleDeleteIncome = () => {
    if (incomeIdToDelete) {
      dispatch(deleteIncome(incomeIdToDelete));
      setIsModalOpen(false);
    }
  };

  const handleDeleteExpense = () => {
    if (expenseIdToDelete) {
      dispatch(deleteExpense(expenseIdToDelete));
      setIsModalOpen(false);
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

  if (incomeLoading || expenseLoading) {
    return (
      <div className="flex h-screen justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  const totalIncome = income.reduce((acc, item) => acc + (item.amount || 0), 0);
  const totalExpenses = expenses.reduce(
    (acc, item) => acc + (item.amount || 0),
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
              <TransactionHistory />
            </div>

            <div className="bg-dark-400 p-4 rounded-md">
              <h2 className="text-xl mb-4">Income</h2>
              <IncomeChart />
              <IncomeForm
                onIncomeAdded={handleIncomeAdded}
                incomeToEdit={incomeToEdit}
                onEditCancel={() => setIncomeToEdit(null)}
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
                    items={income}
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
                            className="btn-edit"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() =>
                              openDeleteModal(income.id!, "income")
                            }
                            className="btn-delete"
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
              <ExpenseChart />
              <ExpenseForm
                onExpenseAdded={handleExpenseAdded}
                expenseToEdit={expenseToEdit}
                onEditCancel={() => setExpenseToEdit(null)}
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
                    items={expenses}
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
                            className="btn-edit"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() =>
                              openDeleteModal(expense.id!, "expense")
                            }
                            className="btn-delete"
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
          if (incomeIdToDelete) handleDeleteIncome();
          if (expenseIdToDelete) handleDeleteExpense();
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
