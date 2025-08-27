
import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
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

interface VocabularyRichnessProps {
  data: ChatStats;
}

interface ChartData {
  name: string;
  richness: number;
  uniqueWords: number;
}

export default function VocabularyRichness({ data }: VocabularyRichnessProps) {
  // Extract vocabulary richness data
  const chartData: ChartData[] = Object.entries(data.vocabularyRichness)
    .map(([name, richness]) => ({
      name,
      richness: parseFloat((richness * 100).toFixed(2)),
      uniqueWords: Object.keys(data.topWords[name] || {}).length
    }))
    .sort((a, b) => b.richness - a.richness);
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Vocabulary Richness</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Lexical diversity score (percentage of unique words used)
      </p>
      
      <div className="h-[400px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: "Unique Words (%)", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === "richness") return [`${value}%`, "Vocabulary Richness"];
                  return [value, "Unique Words"];
                }}
              />
              <Legend />
              <Bar 
                dataKey="richness" 
                fill="#8884d8" 
                name="Vocabulary Richness" 
              />
              <Bar 
                dataKey="uniqueWords" 
                fill="#82ca9d" 
                name="Unique Word Count"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No vocabulary data available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
