import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Title,
  Legend,
  TooltipItem,
} from "chart.js";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getColorForCategory } from "@/lib/colors";

ChartJS.register(ArcElement, Tooltip, Title, Legend);

const ExpenseChart: React.FC = () => {
  // State for selected month and year
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Access expense data from Redux store
  const expenseData = useSelector((state: RootState) => state.expense.expense);

  // Define color map for categories
  const expenseColorMap: Record<string, string> = {};
  expenseData.forEach((expenseItem) => {
    getColorForCategory(expenseItem.category, expenseColorMap);
  });

  // Filter data by the specified month and year
  const filteredData = expenseData.filter((expense) => {
    const date = new Date(expense.date);
    return (
      date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    );
  });

  // Aggregate filtered expense data by category
  const categories = filteredData.reduce((acc, expense) => {
    const key = expense.category || "Uncategorized";
    acc[key] = (acc[key] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Define chart data
  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(categories),
        backgroundColor: Object.keys(categories).map((category) =>
          getColorForCategory(category, expenseColorMap)
        ),
      },
    ],
  };

  // Define chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right" as const,
        labels: {
          color: "white",
          boxWidth: 15,
          padding: 15,
        },
        maxWidth: 150,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<"pie">) {
            const value = tooltipItem.raw as number;
            return `Amount: $${value.toFixed(2)}`;
          },
        },
      },
    },
    aspectRatio: 2,
  };

  // Generate year options for the dropdown
  const years = Array.from(
    new Set(expenseData.map((expense) => new Date(expense.date).getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="flex gap-4 mb-4 w-full">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="p-2 bg-dark-300 text-white rounded w-full"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("en-US", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="p-2 bg-dark-300 text-white rounded w-full"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <Pie data={data} options={options} />
    </div>
  );
};

export default ExpenseChart;
