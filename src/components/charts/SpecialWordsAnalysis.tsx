
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

interface SpecialWordsAnalysisProps {
  data: ChatStats;
}

export default function SpecialWordsAnalysis({ data }: SpecialWordsAnalysisProps) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Affectionate Words",
        data: [],
        backgroundColor: [],
      },
      {
        label: "Profanity",
        data: [],
        backgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    const senders = Object.keys(data.messageCount);
    const affectionateWords = senders.map(sender => data.affectionateWordsCount[sender] || 0);
    const profanityWords = senders.map(sender => data.profanityCount[sender] || 0);
    
    // Use array of colors for backgroundColor instead of a single string
    const affectionateColor = Array(senders.length).fill("rgba(217, 70, 239, 0.8)"); // Pink
    const profanityColor = Array(senders.length).fill("rgba(239, 68, 68, 0.8)"); // Red
    
    setChartData({
      labels: senders,
      datasets: [
        {
          label: "Affectionate Words",
          data: affectionateWords,
          backgroundColor: affectionateColor,
        },
        {
          label: "Profanity",
          data: profanityWords,
          backgroundColor: profanityColor,
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
        grid: {
          display: false,
        },
        ticks: {
          color: theme === "dark" ? "#E5E7EB" : "#374151",
        },
      },
      y: {
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
      <h3 className="text-lg font-medium mb-4">Affectionate Words & Profanity</h3>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}
