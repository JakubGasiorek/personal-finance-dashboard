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
    labels: [""],
    datasets: [
      {
        label: "",
        data: [progressPercentage],
        backgroundColor: progressPercentage >= 100 ? "#4caf50" : "#2196f3",
        borderRadius: 12,
        borderWidth: 0,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    scales: {
      x: {
        max: 100,
        display: false,
      },
      y: {
        display: false,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-6 mb-2 bg-dark-400 rounded-xl">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ProgressBarChart;
