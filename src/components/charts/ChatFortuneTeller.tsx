
import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { CakeSlice, Egg, Pizza } from "lucide-react";

interface ChatFortuneTellerProps {
  data: ChatStats;
}

export default function ChatFortuneTeller({ data }: ChatFortuneTellerProps) {
  const [showFortune, setShowFortune] = useState(false);
  
  const getFortune = () => {
    // Get some data to seed our "fortune"
    const totalMessages = Object.values(data.messageCount).reduce((a, b) => a + b, 0);
    const totalEmojis = Object.entries(data.topEmojis)
      .flatMap(([_, emojis]) => Object.values(emojis))
      .reduce((a, b) => a + b, 0);
    const avgSentiment = Object.values(data.avgSentimentScores)
      .reduce((a, b) => a + b, 0) / 
      Math.max(Object.values(data.avgSentimentScores).length, 1);
    
    // "Seed" based on chat stats for consistent but seemingly random fortunes
    const seed = (totalMessages * totalEmojis * Math.abs(avgSentiment || 1)) % 100;
    
    const fortunes = [
      "Your next conversation will bring surprising news!",
      "A new emoji will soon become your favorite form of expression.",
      "Your messaging skills will soon be needed in an unexpected situation.",
      "The next person to text you has something important to share.",
      "A friend from your past is thinking about reaching out to you.",
      "Your communication style will influence someone in ways you don't expect.",
      "Your next big opportunity will come through a casual conversation.",
      "Someone in this chat will need your advice in the coming days.",
      "Your words have more impact than you realize - use them wisely!",
      "An old message that was forgotten will become relevant again soon.",
      "The next group chat you join will introduce you to an important new friend.",
      "Your emoji usage reveals a creative side that others admire.",
      "A misunderstanding in your messages will lead to an unexpected adventure.",
      "The next voice message you receive will contain valuable information.",
      "Your chat history holds the answer to a question you'll have next week.",
      "A spontaneous conversation will lead to an exciting plan.",
      "Your response time to messages reveals more about you than you think.",
      "Someone is saving your messages because they find them meaningful.",
      "A conversation you're avoiding needs to happen for things to progress.",
      "The next link someone shares with you will be surprisingly relevant to your future."
    ];
    
    const relationshipFortunes = [
      "Your connection is stronger than you realize.",
      "A conversation about the past will strengthen your bond.",
      "A shared experience will soon bring you closer together.",
      "Clear communication will be vital in the coming weeks.",
      "A mutual friend will bring new energy to your relationship.",
      "A recurring topic in your chat will become a special inside joke.",
      "A small gesture mentioned in chat will mean much more than intended.",
      "The way you respond to each other's messages reflects your true connection.",
      "Something mentioned casually in your chat will become an important tradition.",
      "Your communication patterns show a rare and valuable connection."
    ];
    
    // Choose a fortune based on our seed
    if (Object.keys(data.messageCount).length >= 2) {
      return relationshipFortunes[Math.floor(seed % relationshipFortunes.length)];
    } else {
      return fortunes[Math.floor(seed % fortunes.length)];
    }
  };
  
  const getLuckyEmoji = () => {
    // Get the "lucky emoji" based on chat data
    const allEmojis: string[] = [];
    
    Object.values(data.topEmojis).forEach(emojiCounts => {
      Object.keys(emojiCounts).forEach(emoji => {
        allEmojis.push(emoji);
      });
    });
    
    // If there are no emojis in the chat, use some defaults
    const defaultEmojis = ["✨", "🍀", "🌟", "🔮", "🎯", "🎲", "🎁", "🎊", "🎉", "🌈"];
    
    const emojiPool = allEmojis.length > 0 ? allEmojis : defaultEmojis;
    const totalMessages = Object.values(data.messageCount).reduce((a, b) => a + b, 0);
    
    // Seed based on total messages for consistent but seemingly random selection
    const seed = totalMessages % emojiPool.length;
    return emojiPool[seed];
  };
  
  const getLuckyNumber = () => {
    // Calculate a "lucky number" based on chat statistics
    const totalMessages = Object.values(data.messageCount).reduce((a, b) => a + b, 0);
    const totalWords = Object.values(data.wordCount).reduce((a, b) => a + b, 0);
    
    // Generate a number between 1 and 99 that seems meaningful but is just for fun
    return (totalMessages + totalWords) % 99 + 1;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-2">The Chat Fortune Teller</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Your chat history reveals your future... or at least it's fun to pretend it does!
      </p>
      
      <div className="flex items-center justify-center space-x-4 mb-8">
        <CakeSlice className="text-pink-400" size={24} />
        <Egg className="text-yellow-400" size={24} />
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
          <span className="text-2xl">🔮</span>
        </div>
        <Pizza className="text-orange-400" size={24} />
        <CakeSlice className="text-pink-400" size={24} />
      </div>
      
      {showFortune ? (
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="font-medium mb-2">Your Chat Fortune</h4>
            <p className="text-lg font-medium italic">{getFortune()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="border rounded-md p-4 text-center">
              <h5 className="text-sm font-medium mb-2">Your Lucky Emoji</h5>
              <span className="text-4xl">{getLuckyEmoji()}</span>
            </div>
            
            <div className="border rounded-md p-4 text-center">
              <h5 className="text-sm font-medium mb-2">Your Lucky Number</h5>
              <span className="text-4xl font-bold text-primary">{getLuckyNumber()}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowFortune(false)}
            className="w-full mt-6 px-4 py-2 bg-accent hover:bg-accent/80 rounded-md transition-colors"
          >
            Ask Again
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-6">Focus on your chat history and ask a question silently...</p>
          <button 
            onClick={() => setShowFortune(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reveal My Chat Fortune
          </button>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-6 text-center italic">
        *For entertainment purposes only. No actual fortune-telling powers exist in this app.
      </p>
    </Card>
  );
}
