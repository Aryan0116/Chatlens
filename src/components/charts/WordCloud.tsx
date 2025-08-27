
import { ChatStats, generateWordCloudData } from "@/utils/chatParser";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import ReactWordcloud from "react-wordcloud";
import { useTheme } from "@/components/ThemeProvider";

interface WordCloudProps {
  data: ChatStats;
}

// Define the Scale type to match what react-wordcloud expects
type Scale = "linear" | "log" | "sqrt";

// Define the Spiral type to match what react-wordcloud expects
type Spiral = "archimedean" | "rectangular";

export default function WordCloud({ data }: WordCloudProps) {
  const { theme } = useTheme();
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [words, setWords] = useState<{ text: string; value: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const senders = Object.keys(data.messageCount);
    if (senders.length > 0 && !selectedPerson) {
      setSelectedPerson(senders[0]);
    }
    
    // Generate word cloud data
    if (selectedPerson && data.topWords[selectedPerson]) {
      const wordCloudData = generateWordCloudData(data.topWords[selectedPerson]);
      setWords(wordCloudData);
    } else {
      // Combine all words if no person is selected
      const allWords: { [word: string]: number } = {};
      Object.values(data.topWords).forEach(personWords => {
        Object.entries(personWords).forEach(([word, count]) => {
          allWords[word] = (allWords[word] || 0) + count;
        });
      });
      
      const wordCloudData = generateWordCloudData(allWords);
      setWords(wordCloudData);
    }
  }, [data, selectedPerson]);

  const options = {
    colors: [
      '#8B5CF6', '#6366F1', '#D946EF', '#0EA5E9',
      '#A855F7', '#8B5CF6', '#3B82F6', '#6366F1'
    ],
    enableTooltip: true,
    deterministic: false,
    fontFamily: "Inter, sans-serif",
    fontSizes: [10, 60] as [number, number], // Specify as tuple with exactly two elements
    fontStyle: "normal",
    fontWeight: "bold",
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 0] as [number, number], // Specify as tuple with exactly two elements
    scale: "sqrt" as Scale, // Explicitly type as Scale
    spiral: "archimedean" as Spiral, // Explicitly type as Spiral
    transitionDuration: 1000,
  };

  const callbacks = {
    getWordColor: (word: any) => {
      return word.value > 10 ? '#8B5CF6' : '#6366F1';
    },
    onWordClick: console.log,
    onWordMouseOver: console.log,
    getWordTooltip: (word: any) => `${word.text} (${word.value})`,
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Most Used Words</h3>
        <select
          className="border rounded p-1 text-sm bg-background"
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
        >
          <option value="">All People</option>
          {Object.keys(data.messageCount).map((sender) => (
            <option key={sender} value={sender}>
              {sender}
            </option>
          ))}
        </select>
      </div>
      <div ref={containerRef} className="chart-container">
        {words.length > 0 ? (
          <ReactWordcloud
            words={words}
            options={options}
            callbacks={callbacks}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No word data available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
