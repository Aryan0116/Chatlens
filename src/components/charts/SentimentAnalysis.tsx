import { ChatStats, getSentimentLabel } from "@/utils/chatParser";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

interface SentimentAnalysisProps {
  data: ChatStats;
}

export default function SentimentAnalysis({ data }: SentimentAnalysisProps) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Sentiment Score",
        data: [],
        backgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    const senders = Object.keys(data.avgSentimentScores);
    const sentimentScores = senders.map(sender => data.avgSentimentScores[sender] || 0);
    
    // Generate colors based on sentiment scores
    const sentimentColors = sentimentScores.map(score => {
      if (score > 3) return 'rgba(34, 197, 94, 0.8)'; // Very positive - green
      if (score > 0) return 'rgba(59, 130, 246, 0.8)'; // Positive - blue
      if (score === 0) return 'rgba(168, 85, 247, 0.8)'; // Neutral - purple
      if (score > -3) return 'rgba(249, 115, 22, 0.8)'; // Negative - orange
      return 'rgba(239, 68, 68, 0.8)'; // Very negative - red
    });
    
    setChartData({
      labels: senders,
      datasets: [
        {
          label: "Sentiment Score",
          data: sentimentScores,
          backgroundColor: sentimentColors,
        },
      ],
    });
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items: any) => {
            if (!items?.length) return "";
            return items[0].label;
          },
          label: (context: any) => {
            const score = context.raw;
            return [
              `Score: ${score.toFixed(2)}`,
              `Sentiment: ${getSentimentLabel(score)}`
            ];
          },
        },
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
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-2">Sentiment Analysis</h3>
      <div className="mb-4 text-sm">
        <span className="inline-block px-2 py-1 rounded-full bg-green-500/20 text-green-500 mr-2">Very Positive &gt;3</span>
        <span className="inline-block px-2 py-1 rounded-full bg-blue-500/20 text-blue-500 mr-2">Positive &gt;0</span>
        <span className="inline-block px-2 py-1 rounded-full bg-purple-500/20 text-purple-500 mr-2">Neutral =0</span>
        <span className="inline-block px-2 py-1 rounded-full bg-orange-500/20 text-orange-500 mr-2">Negative &gt;-3</span>
        <span className="inline-block px-2 py-1 rounded-full bg-red-500/20 text-red-500">Very Negative &lt;-3</span>
      </div>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}
