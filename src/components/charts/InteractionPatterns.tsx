
import { ChatStats, msToReadableTime } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface InteractionPatternsProps {
  data: ChatStats;
}

interface ResponseTimeData {
  date: string;
  [sender: string]: string | number;
}

export default function InteractionPatterns({ data }: InteractionPatternsProps) {
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeData[]>([]);
  const [senders, setSenders] = useState<string[]>([]);

  // Process response time data
  useEffect(() => {
    // Group response times by date
    const responseTimesByDate: { [date: string]: { [sender: string]: { total: number; count: number } } } = {};
    const allSenders = new Set<string>();
    
    data.responseTimeHistory.forEach(item => {
      if (!responseTimesByDate[item.date]) {
        responseTimesByDate[item.date] = {};
      }
      
      if (!responseTimesByDate[item.date][item.sender]) {
        responseTimesByDate[item.date][item.sender] = { total: 0, count: 0 };
      }
      
      responseTimesByDate[item.date][item.sender].total += item.time;
      responseTimesByDate[item.date][item.sender].count += 1;
      allSenders.add(item.sender);
    });
    
    // Calculate average response time per day
    const formattedData: ResponseTimeData[] = [];
    
    Object.entries(responseTimesByDate).sort().forEach(([date, senderData]) => {
      const dayData: ResponseTimeData = { date };
      
      for (const sender of allSenders) {
        if (senderData[sender]) {
          // Convert to minutes for better visualization
          const avgTimeMinutes = senderData[sender].total / senderData[sender].count / 60000;
          dayData[sender] = parseFloat(avgTimeMinutes.toFixed(1));
        } else {
          dayData[sender] = 0;
        }
      }
      
      formattedData.push(dayData);
    });
    
    setResponseTimeData(formattedData);
    setSenders(Array.from(allSenders));
  }, [data]);

  // Generate colors for each sender
  const colors = senders.map((_, i) => `hsla(${180 + i * 60}, 70%, 50%, 0.8)`);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Interaction Patterns</h3>
      <p className="text-sm text-muted-foreground mb-4">
        How response times have evolved over the course of the conversation
      </p>
      
      <div className="h-[400px]">
        {responseTimeData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={responseTimeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                label={{ value: "Date", position: "insideBottomRight", offset: -5 }}
              />
              <YAxis 
                label={{ value: "Response Time (mins)", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} mins`, "Avg Response Time"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              
              {senders.map((sender, i) => (
                <Line 
                  key={sender}
                  type="monotone"
                  dataKey={sender}
                  name={sender}
                  stroke={colors[i]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No response time history available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
