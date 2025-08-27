
import { ChatStats, msToReadableTime } from "@/utils/chatParser";
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

interface ResponseTimeAnalysisProps {
  data: ChatStats;
}

export default function ResponseTimeAnalysis({ data }: ResponseTimeAnalysisProps) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Average Response Time",
        data: [],
        backgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    // Filter out senders with valid response times
    const validSenders = Object.entries(data.averageResponseTime)
      .filter(([_, time]) => time > 0)
      .map(([sender]) => sender);
    
    // Get response times for valid senders
    const responseTimes = validSenders.map(sender => data.averageResponseTime[sender]);
    
    // If no valid response times, ensure chart doesn't break
    if (validSenders.length === 0) {
      setChartData({
        labels: ["No Data"],
        datasets: [
          {
            label: "Average Response Time (seconds)",
            data: [0],
            backgroundColor: ["#ccc"],
          },
        ],
      });
      return;
    }
    
    // Generate gradient colors
    const colors = validSenders.map((_, i) => `hsla(${230 + i * 30}, 70%, 60%, 0.8)`);
    
    setChartData({
      labels: validSenders,
      datasets: [
        {
          label: "Average Response Time (seconds)",
          data: responseTimes.map(ms => ms / 1000), // Convert to seconds for better readability
          backgroundColor: colors,
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
            const ms = context.raw * 1000; // Convert back to ms
            return `Response Time: ${msToReadableTime(ms)}`;
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
          callback: (value: any) => {
            return msToReadableTime(value * 1000).split(' ')[0]; // Simplified display
          },
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Average Response Time</h3>
      <div className="h-[300px] chart-container">
        {Object.entries(data.averageResponseTime).length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No response time data available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
