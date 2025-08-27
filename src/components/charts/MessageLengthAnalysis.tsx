
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
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MessageLengthAnalysisProps {
  data: ChatStats;
}

interface MessageLengthByPerson {
  name: string;
  avgLength: number;
  totalMessages: number;
}

interface MessageLengthByDate {
  date: string;
  [sender: string]: string | number;
}

export default function MessageLengthAnalysis({ data }: MessageLengthAnalysisProps) {
  const [byPersonData, setByPersonData] = useState<MessageLengthByPerson[]>([]);
  const [byTimeData, setByTimeData] = useState<MessageLengthByDate[]>([]);
  const [senders, setSenders] = useState<string[]>([]);
  
  // Calculate message length data
  useEffect(() => {
    // For per-person data
    const lengthsByPerson: { [sender: string]: { total: number, count: number } } = {};
    const allSenders = new Set<string>();
    
    // For time series data
    const lengthsByDate: { [date: string]: { [sender: string]: { total: number, count: number } } } = {};
    
    // Process all messages
    data.messages.forEach(message => {
      const sender = message.sender;
      const messageLength = message.content.length;
      const dateKey = message.date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Add to per-person data
      allSenders.add(sender);
      if (!lengthsByPerson[sender]) {
        lengthsByPerson[sender] = { total: 0, count: 0 };
      }
      lengthsByPerson[sender].total += messageLength;
      lengthsByPerson[sender].count += 1;
      
      // Add to time series data
      if (!lengthsByDate[dateKey]) {
        lengthsByDate[dateKey] = {};
      }
      if (!lengthsByDate[dateKey][sender]) {
        lengthsByDate[dateKey][sender] = { total: 0, count: 0 };
      }
      lengthsByDate[dateKey][sender].total += messageLength;
      lengthsByDate[dateKey][sender].count += 1;
    });
    
    // Process per-person data
    const byPersonResult = Object.entries(lengthsByPerson).map(([name, { total, count }]) => ({
      name,
      avgLength: Math.round(total / count),
      totalMessages: count
    }));
    
    // Process time series data
    const byTimeResult: MessageLengthByDate[] = Object.entries(lengthsByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, senderData]) => {
        const result: MessageLengthByDate = { date: new Date(date).toLocaleDateString() };
        
        Object.entries(senderData).forEach(([sender, { total, count }]) => {
          result[sender] = Math.round(total / count);
        });
        
        return result;
      });
    
    setByPersonData(byPersonResult);
    setByTimeData(byTimeResult);
    setSenders(Array.from(allSenders));
  }, [data]);

  // Colors for each sender
  const colors = senders.map((_, i) => `hsla(${180 + i * 60}, 70%, 50%, 0.8)`);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Message Length Analysis</h3>

      <Tabs defaultValue="by-person">
        <TabsList className="mb-4">
          <TabsTrigger value="by-person">By Person</TabsTrigger>
          <TabsTrigger value="over-time">Over Time</TabsTrigger>
        </TabsList>
        
        <TabsContent value="by-person">
          <p className="text-sm text-muted-foreground mb-4">
            Average characters per message for each person
          </p>
          
          <div className="h-[400px]">
            {byPersonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byPersonData}
                  margin={{ top: 20, right: 30, bottom: 40, left: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                  />
                  <YAxis 
                    label={{ value: "Avg. Characters", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} characters`, "Average Message Length"]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="avgLength" 
                    name="Average Message Length" 
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No message data available</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="over-time">
          <p className="text-sm text-muted-foreground mb-4">
            Average message length changes over time
          </p>
          
          <div className="h-[400px]">
            {byTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={byTimeData}
                  margin={{ top: 20, right: 30, bottom: 40, left: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                  />
                  <YAxis 
                    label={{ value: "Avg. Characters", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip />
                  <Legend />
                  
                  {senders.map((sender, i) => (
                    <Line 
                      key={sender}
                      type="monotone"
                      dataKey={sender}
                      name={sender}
                      stroke={colors[i]}
                      activeDot={{ r: 8 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No time series data available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
