import { ChatStats } from "@/utils/chatParser";
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
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ActiveHoursHeatmapProps {
  data: ChatStats;
}

export default function ActiveHoursHeatmap({ data }: ActiveHoursHeatmapProps) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    // Create an array for 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hoursLabels = hours.map(hour => {
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      const period = hour < 12 ? "AM" : "PM";
      return `${formattedHour} ${period}`;
    });
    
    // Get message count for each hour
    const messagesByHour = hours.map(hour => data.messagesByHour[hour] || 0);
    
    // Find max value to calculate intensity
    const maxMessages = Math.max(...messagesByHour, 1);
    
    // Generate color intensities
    const colorIntensities = messagesByHour.map(count => {
      const intensity = count / maxMessages;
      return theme === "dark" 
        ? `hsla(260, 70%, ${40 + 20 * intensity}%, ${0.3 + 0.7 * intensity})`
        : `hsla(260, 70%, ${60 + 10 * intensity}%, ${0.3 + 0.7 * intensity})`;
    });
    
    setChartData({
      labels: hoursLabels,
      datasets: [
        {
          data: messagesByHour,
          backgroundColor: colorIntensities,
        },
      ],
    });
  }, [data, theme]);

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
            const item = items[0];
            const hour = item.dataIndex;
            return `${item.label}`;
          },
          label: (context: any) => {
            return `${context.raw} messages`;
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
          maxRotation: 45,
          minRotation: 45,
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
      <h3 className="text-lg font-medium mb-4">Activity by Hour of Day</h3>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}
