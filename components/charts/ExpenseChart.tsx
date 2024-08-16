import React from "react";
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
  // Access expense data from Redux store
  const expenseData = useSelector((state: RootState) => state.expense.expense);

  // Define color map for categories
  const expenseColorMap: Record<string, string> = {};
  expenseData.forEach((expenseItem) => {
    getColorForCategory(expenseItem.category, expenseColorMap);
  });

  // Aggregate expense data by category
  const categories = expenseData.reduce((acc, expense) => {
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
            const value = (tooltipItem.raw as number) || 0;
            return ` $${value.toFixed(2)}`;
          },
        },
      },
    },
    aspectRatio: 2,
  };

  return (
    <div className="flex items-center justify-center mb-4">
      <Pie data={data} options={options} />
    </div>
  );
};

export default ExpenseChart;
