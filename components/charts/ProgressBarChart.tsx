import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

interface ProgressBarChartProps {
  progressPercentage: number;
}

const ProgressBarChart: React.FC<ProgressBarChartProps> = ({
  progressPercentage,
}) => {
  const data = {
    labels: ["Progress"],
    datasets: [
      {
        label: "Progress",
        data: [progressPercentage],
        backgroundColor: progressPercentage >= 100 ? "#4caf50" : "#2196f3",
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    scales: {
      x: {
        max: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      bar: {
        borderRadius: 5,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-6 mb-2">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ProgressBarChart;
