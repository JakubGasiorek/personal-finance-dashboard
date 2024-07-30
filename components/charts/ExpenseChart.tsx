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
import { getColorForCategory } from "@/lib/colors";
import { FinancialData } from "@/types";

ChartJS.register(ArcElement, Tooltip, Title, Legend);

interface ExpenseChartProps {
  expenseData: FinancialData["expenses"];
  colorMap: Record<string, string>;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({
  expenseData,
  colorMap,
}) => {
  const categories = expenseData.reduce((acc, expense) => {
    const key = expense.category || "Uncategorized";
    acc[key] = (acc[key] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(categories),
        backgroundColor: Object.keys(categories).map((category) =>
          getColorForCategory(category, colorMap)
        ),
      },
    ],
  };

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
