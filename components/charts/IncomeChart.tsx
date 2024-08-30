import React, { useState } from "react";
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
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { getColorForCategory } from "@/lib/colors";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const IncomeChart: React.FC = () => {
  // State for selected month and year
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Access income data from Redux store
  const incomeData = useSelector((state: RootState) => state.income.income);

  // Define color map for categories
  const incomeColorMap: Record<string, string> = {};
  incomeData.forEach((incomeItem) => {
    getColorForCategory(incomeItem.source, incomeColorMap);
  });

  // Filter data by the specified month and year
  const filteredData = incomeData.filter((income) => {
    const date = new Date(income.date);
    return (
      date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    );
  });

  // Prepare data for the chart
  const labels = filteredData.map((income) => `${income.source}`);
  const data = filteredData.map((income) => income.amount);
  const backgroundColors = filteredData.map((income) =>
    getColorForCategory(income.source || "Uncategorized", incomeColorMap)
  );
  const dates = filteredData.map((income) =>
    new Date(income.date).toLocaleDateString()
  );

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Income",
        data: data,
        backgroundColor: backgroundColors,
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
            const index = tooltipItem.dataIndex;
            const value = tooltipItem.raw as number;
            const date = dates[index];
            return `${date}  $${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    aspectRatio: 2,
  };

  // Generate year options for the dropdown
  const years = Array.from(
    new Set(incomeData.map((income) => new Date(income.date).getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="flex gap-4 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="p-2  bg-dark-300 text-white rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="p-2 bg-dark-300 text-white rounded"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default IncomeChart;
