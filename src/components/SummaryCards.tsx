
import { ChatStats, getSentimentLabel, msToReadableTime } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";

interface SummaryCardsProps {
  data: ChatStats;
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const totalMessages = Object.values(data.messageCount).reduce((a, b) => a + b, 0);
  const totalWords = Object.values(data.wordCount).reduce((a, b) => a + b, 0);
  
  // Find most active sender
  const mostActiveSender = Object.entries(data.messageCount)
    .sort((a, b) => b[1] - a[1])[0][0];
    
  // Find top emoji
  const allEmojis: { [emoji: string]: number } = {};
  Object.values(data.topEmojis).forEach(emojiCounts => {
    Object.entries(emojiCounts).forEach(([emoji, count]) => {
      allEmojis[emoji] = (allEmojis[emoji] || 0) + count;
    });
  });
  
  const topEmoji = Object.entries(allEmojis)
    .sort((a, b) => b[1] - a[1])
    .map(([emoji]) => emoji)[0] || "❓";
    
  // Calculate overall sentiment
  let overallSentiment = 0;
  let totalSentimentPoints = 0;
  
  Object.entries(data.avgSentimentScores).forEach(([sender, score]) => {
    const messageCount = data.messageCount[sender] || 0;
    overallSentiment += score * messageCount;
    totalSentimentPoints += messageCount;
  });
  
  const averageSentiment = totalSentimentPoints > 0 
    ? overallSentiment / totalSentimentPoints 
    : 0;
    
  // Calculate average response time
  const responseTimesArray = Object.values(data.averageResponseTime);
  const avgResponseTimeMs = responseTimesArray.length > 0
    ? responseTimesArray.reduce((a, b) => a + b, 0) / responseTimesArray.length
    : 0;
    
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
      <Card className="stat-card">
        <div className="text-4xl font-bold">{totalMessages}</div>
        <div className="text-sm text-muted-foreground">Total Messages</div>
      </Card>
      
      <Card className="stat-card">
        <div className="text-4xl font-bold">{totalWords}</div>
        <div className="text-sm text-muted-foreground">Total Words</div>
      </Card>
      
      <Card className="stat-card">
        <div className="text-4xl font-bold">{topEmoji}</div>
        <div className="text-sm text-muted-foreground">Top Emoji</div>
      </Card>
      
      <Card className="stat-card">
        <div className="text-4xl font-bold">{mostActiveSender}</div>
        <div className="text-sm text-muted-foreground">Most Active Person</div>
      </Card>
      
      <Card className="stat-card">
        <div className="text-2xl font-bold">{getSentimentLabel(averageSentiment)}</div>
        <div className="text-sm text-muted-foreground">Overall Sentiment</div>
      </Card>
      
      <Card className="stat-card">
        <div className="text-2xl font-bold">{msToReadableTime(avgResponseTimeMs)}</div>
        <div className="text-sm text-muted-foreground">Avg Response Time</div>
      </Card>
      
      <Card className="stat-card">
        <div className="text-2xl font-bold">
          {Object.values(data.affectionateWordsCount).reduce((a, b) => a + b, 0)}
        </div>
        <div className="text-sm text-muted-foreground">Affectionate Words</div>
      </Card>
      
      <Card className="stat-card">
        <div className="text-2xl font-bold">
          {Object.values(data.profanityCount).reduce((a, b) => a + b, 0)}
        </div>
        <div className="text-sm text-muted-foreground">Profanity Count</div>
      </Card>
    </div>
  );
}
