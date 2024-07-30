import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
  TooltipItem,
} from "chart.js";
import { getColorForCategory } from "@/lib/colors";
import { FinancialData } from "@/types";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

interface IncomeChartProps {
  incomeData: FinancialData["income"];
  colorMap: Record<string, string>;
}

const IncomeChart: React.FC<IncomeChartProps> = ({ incomeData, colorMap }) => {
  const categories = incomeData.reduce((acc, income) => {
    const key = income.source || "Uncategorized";
    acc[key] = (acc[key] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: "Income",
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
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<"bar">) {
            const value = (tooltipItem.raw as number) || 0;
            return `$${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white", // Set x-axis label color to white
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Optional: Set grid line color to a light shade for better visibility
        },
      },
      y: {
        ticks: {
          color: "white", // Set y-axis label color to white
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Optional: Set grid line color to a light shade for better visibility
        },
      },
    },
    aspectRatio: 2,
  };

  return (
    <div className="flex items-center justify-center mb-4">
      <Bar data={data} options={options} />
    </div>
  );
};

export default IncomeChart;
