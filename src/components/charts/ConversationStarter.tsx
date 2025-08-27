
import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

interface ConversationStarterProps {
  data: ChatStats;
}

interface PieData {
  name: string;
  value: number;
}

export default function ConversationStarter({ data }: ConversationStarterProps) {
  // Extract conversation starter data
  const starterData: PieData[] = Object.entries(data.conversationStarters)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  
  // Generate colors
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
  
  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Conversation Starter Analysis</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Who typically initiates conversations after periods of silence
      </p>
      
      <div className="h-[400px]">
        {starterData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={starterData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={renderLabel}
              >
                {starterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} conversations`, name]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No conversation starter data available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
