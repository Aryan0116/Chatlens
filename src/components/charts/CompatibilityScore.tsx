
import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Laugh, Smile, Meh, Frown, Heart } from "lucide-react";
import { toast } from "sonner";

interface CompatibilityScoreProps {
  data: ChatStats;
}

export default function CompatibilityScore({ data }: CompatibilityScoreProps) {
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [explanation, setExplanation] = useState<string[]>([]);
  
  useEffect(() => {
    // Calculate a fun "compatibility score" based on various metrics
    let score = 50; // Start at 50%
    const reasons: string[] = [];
    
    // 1. Response times - faster = better compatibility
    const avgResponseTimeMs = Object.values(data.averageResponseTime).reduce((a, b) => a + b, 0) / 
      Math.max(Object.values(data.averageResponseTime).length, 1);
    
    if (avgResponseTimeMs < 60000) { // Less than 1 minute
      score += 10;
      reasons.push("You respond to each other quickly! That's a good sign.");
    } else if (avgResponseTimeMs > 300000) { // More than 5 minutes
      score -= 5;
      reasons.push("Sometimes you take a while to respond to each other.");
    }
    
    // 2. Message frequency - more messages = better compatibility
    const totalMessages = Object.values(data.messageCount).reduce((a, b) => a + b, 0);
    const daysAnalyzed = Object.keys(data.messagesByDay).length;
    const messagesPerDay = daysAnalyzed > 0 ? totalMessages / daysAnalyzed : 0;
    
    if (messagesPerDay > 20) {
      score += 10;
      reasons.push("You text each other a lot! Great communication.");
    } else if (messagesPerDay < 5) {
      score -= 5;
      reasons.push("You don't text very often. Maybe you prefer face-to-face?");
    }
    
    // 3. Sentiment - more positive sentiment = better compatibility
    const avgSentiment = Object.values(data.avgSentimentScores)
      .reduce((a, b) => a + b, 0) / 
      Math.max(Object.values(data.avgSentimentScores).length, 1);
    
    if (avgSentiment > 2) {
      score += 15;
      reasons.push("Your conversations are overwhelmingly positive!");
    } else if (avgSentiment > 0) {
      score += 5;
      reasons.push("You generally keep things positive. Nice!");
    } else if (avgSentiment < 0) {
      score -= 10;
      reasons.push("Your chat has a bit of a negative tone. Everything ok?");
    }
    
    // 4. Emoji usage - more emojis = better compatibility (it's just for fun!)
    const totalEmojis = Object.entries(data.topEmojis)
      .flatMap(([_, emojis]) => Object.values(emojis))
      .reduce((a, b) => a + b, 0);
    
    const emojiRatio = totalMessages > 0 ? totalEmojis / totalMessages : 0;
    
    if (emojiRatio > 0.5) {
      score += 10;
      reasons.push("You use lots of emojis! Very expressive communication.");
    } else if (emojiRatio < 0.1) {
      score -= 5;
      reasons.push("Not many emojis? Are you two robots? 🤖");
    }
    
    // 5. Balance - more balanced conversation = better compatibility
    const messageEntries = Object.entries(data.messageCount);
    if (messageEntries.length >= 2) {
      const [firstCount, secondCount] = messageEntries.map(([_, count]) => count);
      const ratio = Math.min(firstCount, secondCount) / Math.max(firstCount, secondCount);
      
      if (ratio > 0.8) {
        score += 10;
        reasons.push("Your conversation is very balanced. True harmony!");
      } else if (ratio < 0.3) {
        score -= 10;
        reasons.push("One person is doing a lot more talking than the other...");
      }
    }
    
    // 6. Profanity - for fun, we'll say more profanity = spicier relationship!
    const totalProfanity = Object.values(data.profanityCount).reduce((a, b) => a + b, 0);
    if (totalProfanity > 50) {
      score += 5;
      reasons.push("You're comfortable enough to use colorful language with each other!");
    }
    
    // 7. Affectionate words - more affection = better compatibility
    const totalAffection = Object.values(data.affectionateWordsCount).reduce((a, b) => a + b, 0);
    const affectionRatio = totalMessages > 0 ? totalAffection / totalMessages : 0;
    
    if (affectionRatio > 0.1) {
      score += 15;
      reasons.push("You express a lot of affection in your messages!");
    } else if (affectionRatio === 0) {
      score -= 5;
      reasons.push("No affectionate words detected. Keep it professional!");
    }
    
    // Cap the score between 0-100
    score = Math.min(100, Math.max(0, score));
    
    setCompatibilityScore(score);
    setExplanation(reasons);
  }, [data]);
  
  const getEmoji = () => {
    if (compatibilityScore >= 80) return <Heart className="text-red-500" size={64} />;
    if (compatibilityScore >= 60) return <Laugh className="text-amber-500" size={64} />;
    if (compatibilityScore >= 40) return <Smile className="text-blue-500" size={64} />;
    if (compatibilityScore >= 20) return <Meh className="text-purple-500" size={64} />;
    return <Frown className="text-gray-500" size={64} />;
  };
  
  const getCompatibilityText = () => {
    if (compatibilityScore >= 80) return "Soul Mates";
    if (compatibilityScore >= 60) return "Perfect Match";
    if (compatibilityScore >= 40) return "Good Friends";
    if (compatibilityScore >= 20) return "It's Complicated";
    return "Awkward Acquaintances";
  };
  
  const handleShareResult = () => {
    // Create a funny message to share
    const message = `My WhatsApp chat analysis reveals a ${compatibilityScore}% compatibility score: "${getCompatibilityText()}"! Analyzed with ChatLens.`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
      toast.success("Copied to clipboard! Share your results!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-2">Friendship Compatibility Score</h3>
      <p className="text-sm text-muted-foreground mb-6">
        A totally scientific and definitely not made-up analysis of your relationship
      </p>
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          {getEmoji()}
          <span className="absolute -right-2 -top-2 bg-primary text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center">
            {Math.round(compatibilityScore)}%
          </span>
        </div>
        <h2 className="text-2xl font-bold text-center">{getCompatibilityText()}</h2>
        
        <div className="w-full bg-accent rounded-full h-4 mt-2 mb-4">
          <div 
            className="bg-primary h-4 rounded-full" 
            style={{ width: `${compatibilityScore}%` }}
          />
        </div>
        
        <div className="mt-4 space-y-2 text-sm">
          <h4 className="font-medium">Analysis Insights:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {explanation.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
        
        <button 
          onClick={handleShareResult}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Share This Result
        </button>
        
        <p className="text-xs text-muted-foreground mt-4 text-center italic">
          *Results are for entertainment purposes only. No actual relationship science was harmed in the making of this score.
        </p>
      </div>
    </Card>
  );
}
