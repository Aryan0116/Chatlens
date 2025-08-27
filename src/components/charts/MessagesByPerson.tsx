import { ChatStats } from "@/utils/chatParser";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MessagesByPersonProps {
  data: ChatStats;
}

export default function MessagesByPerson({ data }: MessagesByPersonProps) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Messages",
        data: [],
        backgroundColor: [],
      },
      {
        label: "Words",
        data: [],
        backgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    const senders = Object.keys(data.messageCount);
    const messageValues = senders.map(sender => data.messageCount[sender] || 0);
    const wordValues = senders.map(sender => data.wordCount[sender] || 0);
    
    // Generate colors
    const messageColors = senders.map((_, i) => `hsla(${260 + i * 30}, 70%, 60%, 0.8)`);
    const wordColors = senders.map((_, i) => `hsla(${200 + i * 30}, 70%, 60%, 0.8)`);
    
    setChartData({
      labels: senders,
      datasets: [
        {
          label: "Messages",
          data: messageValues,
          backgroundColor: messageColors,
        },
        {
          label: "Words",
          data: wordValues,
          backgroundColor: wordColors,
        },
      ],
    });
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: theme === "dark" ? "#E5E7EB" : "#374151",
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#374151" : "white",
        titleColor: theme === "dark" ? "white" : "#111827",
        bodyColor: theme === "dark" ? "#E5E7EB" : "#374151",
        borderColor: theme === "dark" ? "#4B5563" : "#E5E7EB",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
        ticks: {
          color: theme === "dark" ? "#E5E7EB" : "#374151",
        },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        grid: {
          color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: theme === "dark" ? "#E5E7EB" : "#374151",
          precision: 0,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Messages & Words by Person</h3>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}
