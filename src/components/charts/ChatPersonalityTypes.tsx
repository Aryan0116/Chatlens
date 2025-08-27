
import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface ChatPersonalityTypesProps {
  data: ChatStats;
}

interface PersonalityTraits {
  [sender: string]: {
    type: string;
    description: string;
    traits: string[];
  };
}

export default function ChatPersonalityTypes({ data }: ChatPersonalityTypesProps) {
  const [personalities, setPersonalities] = useState<PersonalityTraits>(() => {
    const result: PersonalityTraits = {};
    
    Object.entries(data.messageCount).forEach(([sender, count]) => {
      // Get message count
      const totalMessages = count;
      
      // Average message length
      const avgMsgLength = data.wordCount[sender] ? data.wordCount[sender] / totalMessages : 0;
      
      // Response time
      const responseTime = data.averageResponseTime[sender] || 0;
      
      // Emoji usage
      const emojiCount = Object.values(data.topEmojis[sender] || {}).reduce((a, b) => a + b, 0);
      const emojiRatio = totalMessages > 0 ? emojiCount / totalMessages : 0;
      
      // Sentiment
      const sentiment = data.avgSentimentScores[sender] || 0;
      
      // Determine primary personality
      let type: string;
      let traits: string[];
      let description: string;
      
      // The Analyzer - long messages, slow responses, few emojis
      if (avgMsgLength > 15 && responseTime > 120000 && emojiRatio < 0.5) {
        type = "The Analyst";
        description = "Thoughtful and detailed, you craft messages with care and precision";
        traits = [
          "Writes thorough, well-considered messages",
          "Takes time to respond with meaningful content",
          "Prefers words over emojis",
          "Values depth over frequency",
          "The voice of reason in group chats"
        ];
      }
      // The Swift - short messages, quick responses
      else if (avgMsgLength < 8 && responseTime < 60000) {
        type = "The Swift";
        description = "Quick and to-the-point, you keep the conversation flowing";
        traits = [
          "Responds almost immediately",
          "Keeps messages short and efficient",
          "Likely to double or triple text",
          "Always available for chat",
          "The group chat catalyst"
        ];
      }
      // The Emoji Master - heavy emoji usage
      else if (emojiRatio > 1.0) {
        type = "The Emoji Master";
        description = "Why use words when emojis say it better?";
        traits = [
          "Communicates through the universal language of emojis",
          "Can tell entire stories with no words",
          "Emotional and expressive",
          "Believes a picture is worth a thousand words",
          "The group chat mood-lifter"
        ];
      }
      // The Positive Force - high positive sentiment
      else if (sentiment > 2.5) {
        type = "The Positive Force";
        description = "You bring sunshine to every conversation";
        traits = [
          "Always upbeat and encouraging",
          "Finds the silver lining in every topic",
          "Generous with compliments",
          "The group's cheerleader",
          "Makes everyone feel better"
        ];
      }
      // The Night Owl - messages mostly at night
      else if (data.messagesByHour && 
              (data.messagesByHour[23] || 0 + data.messagesByHour[0] || 0) / totalMessages > 0.3) {
        type = "The Night Owl";
        description = "When everyone else is sleeping, you're just getting started";
        traits = [
          "Most active after dark",
          "Sends those 2AM thoughts",
          "Probably seeing this message right now",
          "Has interesting sleep patterns",
          "The group's companion during insomnia"
        ];
      }
      // The Conversation Starter - initiates conversations
      else if (data.conversationStarters[sender] > 
              Object.values(data.conversationStarters).reduce((a, b) => a + b, 0) * 0.4) {
        type = "The Initiator";
        description = "Why wait for others? You get conversations going";
        traits = [
          "Regularly checks in with messages",
          "Not afraid to break the silence",
          "Keeps the group connected",
          "Values maintaining relationships",
          "The social glue of the group"
        ];
      }
      // The Wordsmith - rich vocabulary
      else if (data.vocabularyRichness[sender] > 0.6) {
        type = "The Wordsmith";
        description = "Your vocabulary and writing style would make English teachers proud";
        traits = [
          "Uses a rich and diverse vocabulary",
          "Writes with style and flair",
          "Probably corrects others' grammar",
          "Values quality expression",
          "The group's resident poet"
        ];
      }
      // The Emoji-phobic - very few emojis
      else if (emojiRatio < 0.05 && totalMessages > 50) {
        type = "The Traditionalist";
        description = "You believe in the power of words, not silly little pictures";
        traits = [
          "Communicates primarily through text",
          "Believes emojis are for the weak",
          "Probably types with proper punctuation",
          "Prefers clarity over embellishment",
          "The serious one in the group chat"
        ];
      }
      // The Chatterbox - just talks a lot
      else if (totalMessages > Object.values(data.messageCount).reduce((a, b) => a + b, 0) * 0.5) {
        type = "The Chatterbox";
        description = "Some people talk a lot. You talk more.";
        traits = [
          "Never met a thought that shouldn't be shared",
          "Dominates the conversation count",
          "Keeps silence at bay",
          "Has something to say about everything",
          "The voice of the group chat"
        ];
      }
      // The Balanced One - default
      else {
        type = "The Balanced One";
        description = "You maintain perfect harmony in your communication style";
        traits = [
          "Neither too wordy nor too brief",
          "Responds in a reasonable timeframe",
          "Uses emojis appropriately",
          "Adapts to the conversation flow",
          "The ideal chat partner"
        ];
      }
      
      result[sender] = { type, description, traits };
    });
    
    return result;
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-2">Chat Personality Types</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Discover your WhatsApp personality based on your chat behavior
      </p>
      
      <div className="space-y-6">
        {Object.entries(personalities).map(([name, personality]) => (
          <div key={name} className="border rounded-lg p-4 bg-accent/20">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-medium">{name}</h4>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {personality.type}
              </span>
            </div>
            
            <p className="italic mb-4">{personality.description}</p>
            
            <h5 className="text-sm font-medium mb-2">Defining Traits:</h5>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {personality.traits.map((trait, i) => (
                <li key={i}>{trait}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground mt-6 text-center italic">
        *These personality types are just for fun and based on simple message patterns.
      </p>
    </Card>
  );
}
