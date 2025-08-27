
import { ChatStats } from "@/utils/chatParser";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface EmojiAnalysisProps {
  data: ChatStats;
}

export default function EmojiAnalysis({ data }: EmojiAnalysisProps) {
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [topEmojis, setTopEmojis] = useState<[string, number][]>([]);

  useEffect(() => {
    // Get all senders with emoji data
    const sendersWithEmojis = Object.entries(data.topEmojis)
      .filter(([_, emojis]) => Object.keys(emojis).length > 0)
      .map(([sender]) => sender);
    
    // If there's no emoji data, don't try to select a person
    if (sendersWithEmojis.length === 0) {
      setTopEmojis([]);
      return;
    }
    
    // Set default selected person if none is selected
    if (!selectedPerson || !sendersWithEmojis.includes(selectedPerson)) {
      setSelectedPerson(sendersWithEmojis.length > 0 ? sendersWithEmojis[0] : "");
    }
    
    // Get top emojis for selected person or combine all emojis if "All People" is selected
    if (selectedPerson && data.topEmojis[selectedPerson]) {
      const emojiEntries = Object.entries(data.topEmojis[selectedPerson])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      setTopEmojis(emojiEntries);
    } else {
      // Combine all emojis if no person is selected or "All People" is selected
      const allEmojis: { [emoji: string]: number } = {};
      Object.values(data.topEmojis).forEach(personEmojis => {
        Object.entries(personEmojis).forEach(([emoji, count]) => {
          allEmojis[emoji] = (allEmojis[emoji] || 0) + count;
        });
      });
      
      const emojiEntries = Object.entries(allEmojis)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      setTopEmojis(emojiEntries);
    }
  }, [data, selectedPerson]);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Top Emojis</h3>
        <select
          className="border rounded p-1 text-sm bg-background"
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
          disabled={Object.keys(data.topEmojis).length === 0}
        >
          <option value="">All People</option>
          {Object.keys(data.messageCount).map((sender) => (
            <option key={sender} value={sender}>
              {sender}
            </option>
          ))}
        </select>
      </div>
      <div className="h-60 overflow-y-auto">
        {topEmojis.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {topEmojis.map(([emoji, count]) => (
              <div
                key={emoji}
                className="flex items-center justify-between p-3 rounded-md bg-accent/50"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-sm font-medium">{count} uses</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No emoji data available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
