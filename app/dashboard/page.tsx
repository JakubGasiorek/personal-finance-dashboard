"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { auth, db } from "@/services/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, DocumentData } from "firebase/firestore";
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
import IncomeForm from "@/components/forms/IncomeForm";

// Define the interface for Income data
interface Income {
  id?: string; // Optional, since it will be added by Firestore
  source: string;
  amount: number;
  date: any; // Timestamp type from Firebase
}

// Define FinancialData interface
interface FinancialData {
  summary: DocumentData[];
  income: Income[];
  expenses: DocumentData[];
}

// Define a color map for categories
const colors = [
  "rgba(75, 192, 192, 0.6)", // teal
  "rgba(153, 102, 255, 0.6)", // purple
  "rgba(255, 159, 64, 0.6)", // orange
  "rgba(255, 99, 132, 0.6)", // red
  "rgba(54, 162, 235, 0.6)", // blue
  "rgba(255, 206, 86, 0.6)", // yellow
];

const getColorForCategory = (
  category: string,
  colorMap: Record<string, string>
) => {
  if (!colorMap[category]) {
    // Assign a new color from the color list
    colorMap[category] = colors[Object.keys(colorMap).length % colors.length];
  }
  return colorMap[category];
};

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
  const [financialData, setFinancialData] = useState<FinancialData>({
    summary: [],
    income: [],
    expenses: [],
  });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async (user: User) => {
      try {
        const userId = user.uid;
        const summarySnapshot = await getDocs(
          collection(db, `users/${userId}/summary`)
        );
        const incomeSnapshot = await getDocs(
          collection(db, `users/${userId}/income`)
        );
        const expensesSnapshot = await getDocs(
          collection(db, `users/${userId}/expenses`)
        );

        const summaryData = summarySnapshot.docs.map((doc) => doc.data());
        const incomeData = incomeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Income[];
        const expensesData = expensesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFinancialData({
          summary: summaryData,
          income: incomeData,
          expenses: expensesData,
        });
      } catch (error) {
        console.error("Error fetching financial data:", error);
      }
      setLoading(false); // User is authenticated, stop loading
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/unauthorized"); // Redirect to unauthorized page if not authenticated
      } else {
        fetchData(user);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const logout = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleIncomeAdded = (newIncome: Income) => {
    setFinancialData((prevData) => ({
      ...prevData,
      income: [...prevData.income, newIncome],
    }));
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  // Process financial data for charts
  const totalIncome =
    financialData?.income.reduce((acc, item) => acc + item.amount, 0) || 0;
  const totalExpenses =
    financialData?.expenses.reduce((acc, item) => acc + item.amount, 0) || 0;
  const netBalance = totalIncome - totalExpenses;

  // Create color maps for income and expenses
  const incomeColorMap: Record<string, string> = {};
  const expenseColorMap: Record<string, string> = {};

  const incomeCategories =
    financialData?.income.reduce((acc, item) => {
      const source = item.source || "Uncategorized";
      acc[source] = (acc[source] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>) || {};

  const expenseCategories =
    financialData?.expenses.reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>) || {};

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
              <IncomeForm onIncomeAdded={handleIncomeAdded} />
            </div>
            <div className="bg-dark-400 p-4 rounded-md">
              <h2 className="text-xl mb-4">Expenses</h2>
              <Pie data={expenseChartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
