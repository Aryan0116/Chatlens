
import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface MessageTimePatternsProps {
  data: ChatStats;
}

interface HourData {
  hour: string;
  [sender: string]: string | number;
}

export default function MessageTimePatterns({ data }: MessageTimePatternsProps) {
  const [hourlyData, setHourlyData] = useState<HourData[]>([]);
  const [senders, setSenders] = useState<string[]>([]);

  // Process message time data
  useEffect(() => {
    const hourCounts: { [hour: number]: { [sender: string]: number } } = {};
    const allSenders = new Set<string>();
    
    // Initialize hours
    for (let h = 0; h < 24; h++) {
      hourCounts[h] = {};
    }
    
    // Count messages by hour for each sender
    data.messages.forEach(message => {
      const hourMatch = message.time.match(/(\d{1,2}):/);
      if (hourMatch) {
        const hour = parseInt(hourMatch[1], 10);
        const sender = message.sender;
        
        allSenders.add(sender);
        hourCounts[hour][sender] = (hourCounts[hour][sender] || 0) + 1;
      }
    });
    
    // Format for chart
    const formattedData: HourData[] = [];
    for (let h = 0; h < 24; h++) {
      const hourLabel = `${h}:00`;
      const hourData: HourData = { hour: hourLabel };
      
      allSenders.forEach(sender => {
        hourData[sender] = hourCounts[h][sender] || 0;
      });
      
      formattedData.push(hourData);
    }
    
    setHourlyData(formattedData);
    setSenders(Array.from(allSenders));
  }, [data]);

  // Generate colors for each sender
  const colors = senders.map((_, i) => `hsla(${180 + i * 60}, 70%, 50%, 0.8)`);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Message Time Patterns</h3>
      <p className="text-sm text-muted-foreground mb-4">
        When each person is most active during the day (morning person vs night owl)
      </p>
      
      <div className="h-[400px]">
        {senders.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="hour" 
                label={{ value: "Hour of Day", position: "insideBottomRight", offset: -5 }}
              />
              <YAxis 
                label={{ value: "Number of Messages", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              
              {senders.map((sender, i) => (
                <Bar 
                  key={sender}
                  dataKey={sender}
                  name={sender}
                  fill={colors[i]}
                  stackId="stack"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No time pattern data available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
