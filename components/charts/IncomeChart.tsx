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
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Access expense data from Redux store
  const incomeData = useSelector((state: RootState) => state.income.income);

  // Define color map for source
  const incomeColorMap: Record<string, string> = {};
  incomeData.forEach((incomeItem) => {
    getColorForCategory(incomeItem.source, incomeColorMap);
  });

  // Filter data by the specified month and year
  const filteredData = incomeData.filter((income) => {
    const date = new Date(income.date);
    return selectedMonth === "all"
      ? date.getFullYear() === selectedYear
      : date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear;
  });

  let labels: string[],
    data: number[],
    backgroundColors: string[],
    dates: string[];

  if (selectedMonth === "all") {
    // Group data by month for the whole year
    const monthlyData = Array(12)
      .fill(0)
      .map(() => ({ total: 0, count: 0 }));
    filteredData.forEach((income) => {
      const month = new Date(income.date).getMonth();
      monthlyData[month].total += income.amount;
      monthlyData[month].count++;
    });

    labels = monthlyData.map((_, index) =>
      new Date(0, index).toLocaleString("en-US", { month: "short" })
    );
    data = monthlyData.map((month) => month.total);
    backgroundColors = filteredData.map((income) =>
      getColorForCategory(income.source || "Uncategorized", incomeColorMap)
    );
    dates = labels;
  } else {
    // Use the original logic for a specific month
    labels = filteredData.map((income) => `${income.source}`);
    data = filteredData.map((income) => income.amount);
    backgroundColors = filteredData.map((income) =>
      getColorForCategory(income.source || "Uncategorized", incomeColorMap)
    );
    dates = filteredData.map((income) =>
      new Date(income.date).toLocaleDateString()
    );
  }

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
            return selectedMonth === "all"
              ? `${date}: $${value.toFixed(2)}`
              : `${date}  $${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
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
      <div className="flex gap-4 mb-4 w-full">
        <select
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
          className="p-2 bg-dark-300 text-white rounded w-full"
        >
          <option value="all">Whole year</option>
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default IncomeChart;
