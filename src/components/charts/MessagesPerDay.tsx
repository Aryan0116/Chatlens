import { ChatStats } from "@/utils/chatParser";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "@/components/ThemeProvider";
import { Calendar, Activity, ArrowUpRight } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MessagesPerDayProps {
  data: ChatStats;
}

export default function MessagesPerDay({ data }: MessagesPerDayProps) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartData<"line">>({
    datasets: [],
    labels: []
  });
  const [chartOptions, setChartOptions] = useState<ChartOptions<"line">>({});
  const [totalMessages, setTotalMessages] = useState(0);
  const [peakDay, setPeakDay] = useState({ date: "", count: 0 });
  const [avgMessages, setAvgMessages] = useState(0);

  useEffect(() => {
    // Only proceed if we have data
    if (!data || !data.messagesByDay || Object.keys(data.messagesByDay).length === 0) {
      return;
    }

    // Ensure date keys are properly formatted
    const formattedData: { [date: string]: number } = {};
    let total = 0;
    let peak = { date: "", count: 0 };

    Object.entries(data.messagesByDay).forEach(([rawDate, count]) => {
      // Ensure we have a properly formatted date (YYYY-MM-DD)
      let formattedDate = rawDate;
      
      // If the date is in a different format, try to standardize it
      if (!rawDate.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
        try {
          const dateParts = rawDate.split(/[-/]/);
          if (dateParts.length === 3) {
            // Handle different potential date formats
            const year = dateParts[0].length === 4 ? dateParts[0] : dateParts[2];
            const month = dateParts[0].length === 4 ? dateParts[1] : dateParts[0];
            const day = dateParts[0].length === 4 ? dateParts[2] : dateParts[1];
            
            formattedDate = `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.error("Error parsing date:", rawDate);
        }
      }
      
      formattedData[formattedDate] = count;
      total += count;
      
      if (count > peak.count) {
        peak = { date: formattedDate, count };
      }
    });

    // Sort the dates
    const sortedDates = Object.keys(formattedData).sort();
    
    // Fill in missing dates
    const filledData: { [date: string]: number } = {};
    
    if (sortedDates.length > 0) {
      const firstDate = new Date(sortedDates[0]);
      const lastDate = new Date(sortedDates[sortedDates.length - 1]);
      
      // Create a loop that iterates through each day between first and last
      for (let d = new Date(firstDate); d <= lastDate; d.setDate(d.getDate() + 1)) {
        const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        filledData[dateKey] = formattedData[dateKey] || 0;
      }
    }
    
    const finalSortedDates = Object.keys(filledData).sort();
    const messageValues = finalSortedDates.map(date => filledData[date]);
    
    // Format dates for display
    const formattedDates = finalSortedDates.map(dateStr => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Update stats
    setTotalMessages(total);
    setPeakDay({
      date: new Date(peak.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: peak.count
    });
    setAvgMessages(messageValues.length > 0 ? Math.round(total / messageValues.length * 10) / 10 : 0);
    
    // Chart styling
    const isDark = theme === "dark";
    const gradientColor = isDark ? "rgba(124, 58, 237, 0.8)" : "rgba(109, 40, 217, 0.7)";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    const textColor = isDark ? "#E5E7EB" : "#374151";
    
    setChartData({
      labels: formattedDates,
      datasets: [
        {
          label: "Messages",
          data: messageValues,
          borderColor: isDark ? "#9333EA" : "#7C3AED",
          backgroundColor: function(context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) {
              return;
            }
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, "transparent");
            gradient.addColorStop(1, isDark ? "rgba(124, 58, 237, 0.2)" : "rgba(124, 58, 237, 0.1)");
            return gradient;
          },
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: isDark ? "#9333EA" : "#7C3AED",
          pointBorderColor: isDark ? "#1F2937" : "#FFFFFF",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    });
    
    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: isDark ? "#1F2937" : "white",
          titleColor: isDark ? "white" : "#111827",
          bodyColor: isDark ? "#E5E7EB" : "#374151",
          borderColor: isDark ? "#4B5563" : "#E5E7EB",
          borderWidth: 1,
          padding: 10,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            title: function(tooltipItems) {
              return tooltipItems[0].label;
            },
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} messages`;
            }
          }
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: textColor,
            maxRotation: 45,
            minRotation: 45,
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
            drawBorder: false
          },
          ticks: {
            color: textColor,
            font: {
              size: 11
            },
            callback: function(value) {
              return value % 1 === 0 ? value : '';
            }
          },
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      elements: {
        point: {
          hoverBackgroundColor: "#9333EA",
        }
      }
    });
  }, [data, theme]);

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Messages Per Day</h3>
        </div>
        <div className="flex items-center space-x-1 text-violet-600 dark:text-violet-400 text-sm font-medium">
          <span>View All</span>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <Activity className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Messages</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{totalMessages}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <Activity className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Peak Day</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{peakDay.count}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{peakDay.date}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <Activity className="h-4 w-4 text-violet-500 mr-2" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Daily Average</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{avgMessages}</p>
        </div>
      </div>
      
      <div className="chart-container h-64 lg:h-72">
        <Line options={chartOptions} data={chartData} />
      </div>
    </Card>
  );
}