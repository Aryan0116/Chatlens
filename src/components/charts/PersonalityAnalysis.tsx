import { useMemo, useState } from "react";
import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Shield, 
  Heart, 
  MessageSquare, 
  Activity, 
  Clock, 
  ThumbsUp, 
  Smile, 
  Sun, 
  Moon, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  BarChart,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PersonalityAnalysisProps {
  data: ChatStats;
}

interface PersonalityTrait {
  name: string;
  score: number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface PersonalityProfile {
  sender: string;
  traits: PersonalityTrait[];
  personalityType: string;
  personalityDescription: string;
  communicationTips: string;
  compatibilityScore?: number;
  strengths: string[];
  growthAreas: string[];
  moodPattern: string;
  activityPattern: string;
}

interface CommunicationInsight {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function PersonalityAnalysis({ data }: PersonalityAnalysisProps) {
  const [expandedSender, setExpandedSender] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("personalities");
  const [viewMode, setViewMode] = useState("detailed");
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  const progressVariants = {
    hidden: { width: 0 },
    visible: (value: number) => ({
      width: `${value}%`,
      transition: { duration: 0.8, ease: "easeOut" }
    })
  };

  const personalityProfiles = useMemo(() => {
    const profiles: PersonalityProfile[] = [];
    
    // Calculate personality traits for each person
    Object.keys(data.messageCount).forEach(sender => {
      // Skip if there are too few messages
      if ((data.messageCount[sender] || 0) < 5) return;
      
      // Calculate traits based on message metrics
      const traits: PersonalityTrait[] = [];
      
      // Responsiveness trait
      const responseCount = data.responseTimeHistory.filter(r => r.sender === sender).length;
      const responsiveness = Math.min(100, Math.round((responseCount / Math.max(1, data.messageCount[sender])) * 100));
      traits.push({
        name: "Responsiveness",
        score: responsiveness,
        description: responsiveness > 70 ? "Replies quickly to messages" : "Sometimes slow to respond",
        icon: <MessageSquare className="h-4 w-4" />,
        color: "text-blue-500"
      });
      
      // Verbosity trait
      const verbosity = Math.min(100, Math.round((data.wordCount[sender] / Math.max(1, data.messageCount[sender])) * 10));
      traits.push({
        name: "Verbosity",
        score: verbosity,
        description: verbosity > 70 ? "Tends to write long messages" : "Prefers brief messages",
        icon: <Activity className="h-4 w-4" />,
        color: "text-purple-500"
      });
      
      // Positivity trait
      const avgSentiment = (data.avgSentimentScores[sender] || 0);
      const positivity = Math.min(100, Math.max(0, Math.round((avgSentiment + 5) * 10))); // Scale -5 to +5 to 0-100
      traits.push({
        name: "Positivity",
        score: positivity,
        description: positivity > 70 ? "Uses positive language" : "Could use more positive language",
        icon: <ThumbsUp className="h-4 w-4" />,
        color: "text-green-500"
      });
      
      // Affection trait
      const affectionRate = Math.min(100, Math.round((data.affectionateWordsCount[sender] || 0) / Math.max(1, data.messageCount[sender]) * 100 * 5));
      traits.push({
        name: "Affection",
        score: affectionRate,
        description: affectionRate > 60 ? "Very affectionate" : "Not overly affectionate",
        icon: <Heart className="h-4 w-4" />,
        color: "text-pink-500"
      });
      
      // Initiative trait (conversation starting)
      const initiativeRate = Math.min(100, Math.round(((data.conversationStarters[sender] || 0) / Math.max(1, Object.values(data.conversationStarters).reduce((a, b) => a + b, 0))) * 100));
      traits.push({
        name: "Initiative",
        score: initiativeRate,
        description: initiativeRate > 60 ? "Often starts conversations" : "Rarely initiates chats",
        icon: <User className="h-4 w-4" />,
        color: "text-teal-500"
      });
      
      // Vocabulary trait
      const vocabularyRichness = Math.min(100, Math.round((data.vocabularyRichness[sender] || 0) * 100 * 2));
      traits.push({
        name: "Vocabulary",
        score: vocabularyRichness,
        description: vocabularyRichness > 60 ? "Uses diverse vocabulary" : "Uses simple language",
        icon: <Activity className="h-4 w-4" />,
        color: "text-amber-500"
      });
      
      // Consistency trait (new)
      const messagesByDay = Object.values(data.messagesByDay);
      const avgMessagesPerDay = messagesByDay.reduce((a, b) => a + b, 0) / messagesByDay.length;
      const senderMessagesPerDay = (data.messageCount[sender] || 0) / messagesByDay.length;
      const consistency = Math.min(100, Math.round((senderMessagesPerDay / avgMessagesPerDay) * 70));
      traits.push({
        name: "Consistency",
        score: consistency,
        description: consistency > 60 ? "Regularly active in the chat" : "Communication pattern fluctuates",
        icon: <Calendar className="h-4 w-4" />,
        color: "text-indigo-500"
      });
      
      // Emoji Usage trait (new)
      const emojiCount = Object.values(data.topEmojis[sender] || {}).reduce((a, b) => a + b, 0);
      const emojiRate = Math.min(100, Math.round((emojiCount / Math.max(1, data.messageCount[sender])) * 100));
      traits.push({
        name: "Emoji Usage",
        score: emojiRate,
        description: emojiRate > 60 ? "Frequently uses emojis" : "Rarely uses emojis",
        icon: <Smile className="h-4 w-4" />,
        color: "text-yellow-500"
      });
      
      // Time of day preference (new)
      const nightMessages = calculateNightTimeMessages(sender, data);
      const timePreference = Math.min(100, Math.max(0, nightMessages));
      traits.push({
        name: "Night Owl",
        score: timePreference,
        description: timePreference > 60 ? "Tends to chat at night" : "Prefers chatting during daylight hours",
        icon: timePreference > 50 ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
        color: timePreference > 50 ? "text-blue-800" : "text-orange-500"
      });
      
      // Calculate personality type and other insights
      const personalityType = determinePersonalityType(traits);
      const personalityDescription = getPersonalityDescription(personalityType, sender);
      const communicationTips = getCommunicationTips(personalityType);
      
      // Calculate strengths and growth areas
      const strengths = calculateStrengths(traits);
      const growthAreas = calculateGrowthAreas(traits);
      
      // Calculate mood and activity patterns
      const moodPattern = calculateMoodPattern(sender, data);
      const activityPattern = calculateActivityPattern(sender, data);
      
      profiles.push({
        sender,
        traits,
        personalityType,
        personalityDescription,
        communicationTips,
        strengths,
        growthAreas,
        moodPattern,
        activityPattern
      });
    });
    
    // Calculate compatibility scores if there are exactly 2 profiles
    if (profiles.length === 2) {
      calculateCompatibilityScores(profiles);
    }
    
    return profiles;
  }, [data]);
  
  // Calculate what percentage of messages are sent at night (7PM-6AM)
  function calculateNightTimeMessages(sender: string, data: ChatStats): number {
    let nightMessages = 0;
    let totalMessages = 0;
    
    data.messages.forEach(message => {
      if (message.sender === sender) {
        totalMessages++;
        const hour = parseInt(message.time.split(':')[0]);
        if (hour >= 19 || hour < 6) {
          nightMessages++;
        }
      }
    });
    
    return totalMessages > 0 ? Math.round((nightMessages / totalMessages) * 100) : 50;
  }
  
  // Calculate mood pattern over time
  function calculateMoodPattern(sender: string, data: ChatStats): string {
    const senderMessages = data.messages.filter(m => m.sender === sender);
    
    if (senderMessages.length < 10) return "Not enough data to determine mood patterns";
    
    // Group messages by month
    const monthlyMood: { [month: string]: number[] } = {};
    senderMessages.forEach(message => {
      const month = `${message.date.getFullYear()}-${(message.date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyMood[month]) monthlyMood[month] = [];
      monthlyMood[month].push(message.sentimentScore);
    });
    
    // Analyze mood patterns
    const monthlyAvgs = Object.entries(monthlyMood).map(([month, scores]) => ({
      month,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    if (monthlyAvgs.length < 2) return "Not enough data to determine mood patterns";
    
    // Check for trend
    let increasingCount = 0;
    let decreasingCount = 0;
    for (let i = 1; i < monthlyAvgs.length; i++) {
      if (monthlyAvgs[i].avg > monthlyAvgs[i-1].avg) increasingCount++;
      else if (monthlyAvgs[i].avg < monthlyAvgs[i-1].avg) decreasingCount++;
    }
    
    const totalComparisons = monthlyAvgs.length - 1;
    if (increasingCount / totalComparisons > 0.6) return "Gradually becoming more positive over time";
    if (decreasingCount / totalComparisons > 0.6) return "Gradually becoming less positive over time";
    
    // Check for volatility
    const monthlyVariance = monthlyAvgs.map(m => m.avg);
    const variance = calculateVariance(monthlyVariance);
    
    if (variance > 2) return "Highly variable mood patterns";
    if (variance > 1) return "Somewhat variable mood patterns";
    return "Fairly consistent mood patterns";
  }
  
  // Calculate variance of an array
  function calculateVariance(array: number[]): number {
    const mean = array.reduce((a, b) => a + b, 0) / array.length;
    const squaredDifferences = array.map(x => Math.pow(x - mean, 2));
    return Math.sqrt(squaredDifferences.reduce((a, b) => a + b, 0) / array.length);
  }
  
  // Calculate activity pattern
  function calculateActivityPattern(sender: string, data: ChatStats): string {
    const messageCounts = Array(24).fill(0);
    
    data.messages.forEach(message => {
      if (message.sender === sender) {
        const hour = parseInt(message.time.split(':')[0]);
        messageCounts[hour]++;
      }
    });
    
    const morningCount = messageCounts.slice(5, 12).reduce((a, b) => a + b, 0);
    const afternoonCount = messageCounts.slice(12, 17).reduce((a, b) => a + b, 0);
    const eveningCount = messageCounts.slice(17, 22).reduce((a, b) => a + b, 0);
    const nightCount = messageCounts.slice(22, 24).reduce((a, b) => a + b, 0) + messageCounts.slice(0, 5).reduce((a, b) => a + b, 0);
    
    const total = morningCount + afternoonCount + eveningCount + nightCount;
    if (total < 10) return "Not enough data to determine activity patterns";
    
    const timeFrames = [
      { name: "morning", count: morningCount },
      { name: "afternoon", count: afternoonCount },
      { name: "evening", count: eveningCount },
      { name: "night", count: nightCount }
    ].sort((a, b) => b.count - a.count);
    
    const primaryTimeFrame = timeFrames[0];
    const primaryPercentage = Math.round((primaryTimeFrame.count / total) * 100);
    
    if (primaryPercentage > 50) {
      return `Primarily active in the ${primaryTimeFrame.name} (${primaryPercentage}% of messages)`;
    } else {
      const secondaryTimeFrame = timeFrames[1];
      return `Most active in the ${primaryTimeFrame.name} and ${secondaryTimeFrame.name}`;
    }
  }
  
  // Calculate strengths based on traits
  function calculateStrengths(traits: PersonalityTrait[]): string[] {
    const strengths: string[] = [];
    
    traits.forEach(trait => {
      if (trait.score >= 70) {
        switch (trait.name) {
          case "Responsiveness":
            strengths.push("Quick to respond");
            break;
          case "Verbosity":
            strengths.push("Detailed communicator");
            break;
          case "Positivity":
            strengths.push("Brings positive energy");
            break;
          case "Affection":
            strengths.push("Emotionally expressive");
            break;
          case "Initiative":
            strengths.push("Conversation starter");
            break;
          case "Vocabulary":
            strengths.push("Articulate communicator");
            break;
          case "Consistency":
            strengths.push("Reliable communicator");
            break;
          case "Emoji Usage":
            strengths.push("Expressive with emojis");
            break;
        }
      }
    });
    
    // Add at least one strength if none found
    if (strengths.length === 0) {
      const highestTrait = [...traits].sort((a, b) => b.score - a.score)[0];
      strengths.push(`Relatively stronger in ${highestTrait.name.toLowerCase()}`);
    }
    
    return strengths.slice(0, 3); // Limit to top 3 strengths
  }
  
  // Calculate growth areas based on traits
  function calculateGrowthAreas(traits: PersonalityTrait[]): string[] {
    const growthAreas: string[] = [];
    
    traits.forEach(trait => {
      if (trait.score <= 40) {
        switch (trait.name) {
          case "Responsiveness":
            growthAreas.push("Could respond more promptly");
            break;
          case "Verbosity":
            growthAreas.push("Could provide more details");
            break;
          case "Positivity":
            growthAreas.push("Could use more positive language");
            break;
          case "Affection":
            growthAreas.push("Could be more emotionally expressive");
            break;
          case "Initiative":
            growthAreas.push("Could initiate conversations more often");
            break;
          case "Vocabulary":
            growthAreas.push("Could diversify language choices");
            break;
          case "Consistency":
            growthAreas.push("Could maintain more consistent communication");
            break;
          case "Emoji Usage":
            growthAreas.push("Could use emojis to express emotions");
            break;
        }
      }
    });
    
    // Add at least one growth area if none found
    if (growthAreas.length === 0) {
      const lowestTrait = [...traits].sort((a, b) => a.score - b.score)[0];
      growthAreas.push(`Could improve ${lowestTrait.name.toLowerCase()}`);
    }
    
    return growthAreas.slice(0, 3); // Limit to top 3 growth areas
  }
  
  // Calculate compatibility scores between two profiles
  function calculateCompatibilityScores(profiles: PersonalityProfile[]) {
    if (profiles.length !== 2) return;
    
    const profile1 = profiles[0];
    const profile2 = profiles[1];
    
    // Base score - starts at 70%
    let compatibilityScore = 70;
    
    // Compare traits
    profile1.traits.forEach(trait1 => {
      const trait2 = profile2.traits.find(t => t.name === trait1.name);
      if (trait2) {
        const difference = Math.abs(trait1.score - trait2.score);
        
        // Small differences (complementary traits) can be good
        if (difference < 20) {
          compatibilityScore += 2; // Similar traits
        } else if (difference > 40) {
          // For most traits, big differences decrease compatibility
          if (trait1.name !== "Initiative" && trait1.name !== "Verbosity") {
            compatibilityScore -= 3;
          } else {
            // However, for initiative and verbosity, complementary differences can be good
            compatibilityScore += 1;
          }
        }
      }
    });
    
    // Positivity is especially important for compatibility
    const positivity1 = profile1.traits.find(t => t.name === "Positivity")?.score || 50;
    const positivity2 = profile2.traits.find(t => t.name === "Positivity")?.score || 50;
    if (positivity1 > 70 && positivity2 > 70) {
      compatibilityScore += 5; // Both very positive
    } else if (positivity1 < 40 && positivity2 < 40) {
      compatibilityScore -= 5; // Both negative could amplify negativity
    }
    
    // Cap score between 0-100
    compatibilityScore = Math.min(100, Math.max(0, compatibilityScore));
    
    // Assign score to both profiles
    profiles[0].compatibilityScore = compatibilityScore;
    profiles[1].compatibilityScore = compatibilityScore;
  }
  
  // Determine personality type based on trait scores
  function determinePersonalityType(traits: PersonalityTrait[]): string {
    const responsiveness = traits.find(t => t.name === "Responsiveness")?.score || 0;
    const verbosity = traits.find(t => t.name === "Verbosity")?.score || 0;
    const positivity = traits.find(t => t.name === "Positivity")?.score || 0;
    const affection = traits.find(t => t.name === "Affection")?.score || 0;
    const initiative = traits.find(t => t.name === "Initiative")?.score || 0;
    const consistency = traits.find(t => t.name === "Consistency")?.score || 0;
    const nightOwl = traits.find(t => t.name === "Night Owl")?.score || 0;
    
    if (positivity > 75 && affection > 65) return "The Sweetheart";
    if (initiative > 70 && responsiveness > 70) return "The Reliable Friend";
    if (positivity < 40 && verbosity > 70) return "The Deep Thinker";
    if (verbosity < 40 && responsiveness < 40) return "The Mysterious One";
    if (verbosity > 70 && initiative > 60) return "The Chatterbox";
    if (affection > 70 && responsiveness > 60) return "The Nurturing Soul";
    if (positivity < 50 && initiative < 40) return "The Reserved Observer";
    if (responsiveness > 80 && verbosity < 40) return "The Efficient Responder";
    if (initiative > 80 && verbosity > 60) return "The Conversation Leader";
    if (affection < 30 && verbosity > 60) return "The Logical Thinker";
    if (consistency > 75) return "The Steady Communicator";
    if (nightOwl > 70) return "The Night Owl";
    if (nightOwl < 30) return "The Early Bird";
    
    return "The Balanced Communicator";
  }
  
  // Get personality description
  function getPersonalityDescription(type: string, name: string): string {
    switch (type) {
      case "The Sweetheart":
        return `${name} brings warmth and positivity to your conversations. They're affectionate, supportive, and their messages likely brighten your day.`;
      case "The Reliable Friend":
        return `You can count on ${name} to respond promptly and keep the conversation going. They're consistent and dependable in their communication.`;
      case "The Deep Thinker":
        return `${name} tends to communicate with depth and intensity. They express complex thoughts and emotions, often analyzing situations thoroughly.`;
      case "The Mysterious One":
        return `${name} keeps things brief and doesn't always respond quickly. They're selective about what they share, creating an air of mystery.`;
      case "The Chatterbox":
        return `${name} loves to talk! They send longer messages and often initiate new conversation topics with enthusiasm and energy.`;
      case "The Nurturing Soul":
        return `${name} shows care through their messages, responding thoughtfully and using affectionate language. They prioritize emotional connection.`;
      case "The Reserved Observer":
        return `${name} tends to be more reserved in conversation, often observing more than contributing. They may need encouragement to open up.`;
      case "The Efficient Responder":
        return `${name} replies quickly but keeps things brief. They communicate what's necessary without extra details, valuing efficiency.`;
      case "The Conversation Leader":
        return `${name} frequently starts conversations and keeps them flowing with engaging messages. They take initiative in maintaining the relationship.`;
      case "The Logical Thinker":
        return `${name} focuses on factual communication with less emotional content. They're straightforward, clear, and precise in their messaging.`;
      case "The Steady Communicator":
        return `${name} maintains a consistent presence in the conversation, regularly checking in and responding. They provide stability in communication.`;
      case "The Night Owl":
        return `${name} is most active in conversations during evening and night hours. Their energy and engagement peaks when the sun goes down.`;
      case "The Early Bird":
        return `${name} tends to be most communicative during morning and daytime hours. They're fresh and responsive earlier in the day.`;
      default:
        return `${name} maintains a balanced approach to conversation, adapting their style to different situations and needs.`;
    }
  }
  
  // Get communication tips based on personality type
  function getCommunicationTips(type: string): string {
    switch (type) {
      case "The Sweetheart":
        return "Best approached with warm, positive messages. They appreciate emotional openness and affection in return.";
      case "The Reliable Friend":
        return "They value consistency. Regular check-ins and prompt responses keep the connection strong.";
      case "The Deep Thinker":
        return "Give them space for thoughtful responses. They appreciate meaningful questions and depth over small talk.";
      case "The Mysterious One":
        return "Respect their privacy and need for space. Direct questions may help draw them out when needed.";
      case "The Chatterbox":
        return "They thrive on engagement. Ask open-ended questions and be prepared for detailed responses.";
      case "The Nurturing Soul":
        return "Show appreciation for their care. They connect through emotional sharing and personal updates.";
      case "The Reserved Observer":
        return "Gentle prompting helps them open up. They may need time to formulate responses to deeper questions.";
      case "The Efficient Responder":
        return "Be clear and concise when important. They prefer straightforward communication without unnecessary details.";
      case "The Conversation Leader":
        return "They enjoy reciprocal energy. Following their conversational leads creates engaging exchanges.";
      case "The Logical Thinker":
        return "Focus on facts and clear reasoning. They respond well to logical structure rather than emotional appeals.";
      case "The Steady Communicator":
        return "They appreciate regular, predictable communication patterns. Sudden changes in frequency may confuse them.";
      case "The Night Owl":
        return "You'll likely get more engaged responses in the evening or at night when they're most active.";
      case "The Early Bird":
        return "Morning and daytime hours are best for reaching them when they're most responsive and engaged.";
      default:
        return "They adapt well to different communication styles. Pay attention to their cues and mirror their approach.";
    }
  }
  
  // Generate insights about the communication relationship
  const communicationInsights = useMemo(() => {
    if (personalityProfiles.length !== 2) return [];
    
    const insights: CommunicationInsight[] = [];
    const [profile1, profile2] = personalityProfiles;
    
    // Response dynamics insight
    const responsiveness1 = profile1.traits.find(t => t.name === "Responsiveness")?.score || 0;
    const responsiveness2 = profile2.traits.find(t => t.name === "Responsiveness")?.score || 0;
    
    if (Math.abs(responsiveness1 - responsiveness2) > 30) {
      const fasterResponder = responsiveness1 > responsiveness2 ? profile1.sender : profile2.sender;
      insights.push({
        title: "Response Timing Mismatch",
        description: `${fasterResponder} typically responds much faster. This difference in timing expectations could occasionally lead to frustration.`,
        icon: <Clock className="h-5 w-5 text-amber-500" />
      });
    }
    
    // Conversation initiation insight
    const initiative1 = profile1.traits.find(t => t.name === "Initiative")?.score || 0;
    const initiative2 = profile2.traits.find(t => t.name === "Initiative")?.score || 0;
    
    if (Math.abs(initiative1 - initiative2) > 30) {
      const initiator = initiative1 > initiative2 ? profile1.sender : profile2.sender;
      insights.push({
        title: "Conversation Starter Dynamic",
        description: `${initiator} typically initiates conversations more often. This creates a consistent pattern in how your discussions begin.`,
        icon: <User className="h-5 w-5 text-blue-500" />
      });
    }
    
    // Communication style insight
    const verbosity1 = profile1.traits.find(t => t.name === "Verbosity")?.score || 0;
    const verbosity2 = profile2.traits.find(t => t.name === "Verbosity")?.score || 0;
    
    if (Math.abs(verbosity1 - verbosity2) > 30) {
      const verbose = verbosity1 > verbosity2 ? profile1.sender : profile2.sender;
      const concise = verbosity1 > verbosity2 ? profile2.sender : profile1.sender;
      insights.push({
        title: "Message Length Dynamic",
        description: `${verbose} tends to write longer messages, while ${concise} is more concise. This creates a complementary communication pattern.`,
        icon: <MessageSquare className="h-5 w-5 text-purple-500" />
      });
    }
    
    // Emotional tone insight
    const positivity1 = profile1.traits.find(t => t.name === "Positivity")?.score || 0;
    const positivity2 = profile2.traits.find(t => t.name === "Positivity")?.score || 0;
    const affection1 = profile1.traits.find(t => t.name === "Affection")?.score || 0;
    const affection2 = profile2.traits.find(t => t.name === "Affection")?.score || 0;
    
    const emotionalTone1 = (positivity1 + affection1) / 2;
    const emotionalTone2 = (positivity2 + affection2) / 2;
    
    if (emotionalTone1 > 70 && emotionalTone2 > 70) {
      insights.push({
        title: "Positive Emotional Exchange",
        description: "Both of you use warm, positive language in your communication, creating a mutually supportive environment.",
        icon: <Heart className="h-5 w-5 text-red-500" />
      });
    } else if (emotionalTone1 < 40 && emotionalTone2 < 40) {
      insights.push({
        title: "Practical Communication Style",
        description: "Your conversations tend to be more practical and focused, with less emotional expression from both sides.",
        icon: <Activity className="h-5 w-5 text-gray-500" />
      });
    }
    
    // Time of day preference insight
    const nightOwl1 = profile1.traits.find(t => t.name === "Night Owl")?.score || 0;
    const nightOwl2 = profile2.traits.find(t => t.name === "Night Owl")?.score || 0;
    
    if ((nightOwl1 > 70 && nightOwl2 < 30) || (nightOwl1 < 30 && nightOwl2 > 70)) {
      const nightPerson = nightOwl1 > nightOwl2 ? profile1.sender : profile2.sender;
      const dayPerson = nightOwl1 > nightOwl2 ? profile2.sender : profile1.sender;
      insights.push({
        title: "Time Preference Difference",
        description: `${nightPerson} tends to be more active at night, while ${dayPerson} is more active during the day. This may affect real-time conversation availability.`,
        icon: <Clock className="h-5 w-5 text-indigo-500" />
      });
    }
    
    // Add general assessment based on compatibility score
    if (profile1.compatibilityScore !== undefined) {
      if (profile1.compatibilityScore > 85) {
        insights.push({
          title: "High Communication Compatibility",
          description: "Your communication styles complement each other well, creating a balanced and effective exchange.",
          icon: <Sparkles className="h-5 w-5 text-yellow-500" />
        });
      } else if (profile1.compatibilityScore < 60) {
        insights.push({
          title: "Communication Style Differences",
          description: "Your different communication preferences may sometimes create challenges, but can also bring valuable perspective.",
          icon: <BarChart className="h-5 w-5 text-blue-500" />
        });
      }
    }
    
    return insights;
  }, [personalityProfiles]);
  
  // Toggle expanded details for a sender
  const toggleExpanded = (sender: string) => {
    if (expandedSender === sender) {
      setExpandedSender(null);
    } else {
      setExpandedSender(sender);
    }
  };
  
  // No profiles available
  if (personalityProfiles.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Chat Personality Analysis</h3>
        <div className="text-center py-8 text-muted-foreground">
          Not enough messages to analyze personalities. At least 5 messages per person are needed.
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Chat Personality Analysis</h3>
        <div className="flex space-x-2">
          <button 
            className={`text-xs px-2 py-1 rounded ${viewMode === "simple" ? "bg-primary text-white" : "bg-gray-100"}`}
            onClick={() => setViewMode("simple")}
          >
            Simple
          </button>
          <button 
            className={`text-xs px-2 py-1 rounded ${viewMode === "detailed" ? "bg-primary text-white" : "bg-gray-100"}`}
            onClick={() => setViewMode("detailed")}
          >
            Detailed
          </button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Analysis of communication styles based on message patterns and language
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personalities">Personalities</TabsTrigger>
          <TabsTrigger value="insights">Relationship Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personalities" className="pt-4">
          <motion.div 
            className="space-y-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {personalityProfiles.map(profile => (
              <motion.div
                key={profile.sender}
                className="pb-6 border-b last:border-b-0 last:pb-0"
                variants={itemVariants}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h4 className="text-lg font-medium">{profile.sender}</h4>
                  </div>
                  {viewMode === "detailed" && (
                    <button
                      onClick={() => toggleExpanded(profile.sender)}
                      className="text-sm text-gray-500 flex items-center"
                    >
                      {expandedSender === profile.sender ? (
                        <>Less <ChevronUp className="h-4 w-4 ml-1" /></>
                      ) : (
                        <>More <ChevronDown className="h-4 w-4 ml-1" /></>
                      )}
                    </button>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="text-sm font-semibold mb-1">{profile.personalityType}</div>
                  <p className="text-sm text-muted-foreground">{profile.personalityDescription}</p>
                </div>
                
                {profile.compatibilityScore !== undefined && (
                  <div className="mb-4 bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Communication Compatibility</span>
                      <span className="text-sm font-mono">{profile.compatibilityScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${
                          profile.compatibilityScore > 80 ? "bg-green-500" : 
                          profile.compatibilityScore > 60 ? "bg-blue-500" : 
                          "bg-amber-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${profile.compatibilityScore}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
                
                {viewMode === "simple" ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {profile.traits.slice(0, 4).map(trait => (
                      <div key={trait.name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className={trait.color}>{trait.icon}</span>
                            <span className="text-sm">{trait.name}</span>
                          </div>
                        </div>
                        <Progress value={trait.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.traits.map(trait => (
                      <TooltipProvider key={trait.name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className={trait.color}>{trait.icon}</span>
                                  <span className="text-sm">{trait.name}</span>
                                </div>
                                <span className="text-sm font-mono">{trait.score}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div 
                                  className={`h-full ${
                                    trait.score > 80 ? "bg-green-500" : 
                                    trait.score > 60 ? "bg-blue-500" : 
                                    trait.score > 40 ? "bg-amber-500" : 
                                    "bg-red-400"
                                  }`}
                                  custom={trait.score}
                                  variants={progressVariants}
                                  initial="hidden"
                                  animate="visible"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">{trait.description}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{trait.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                )}
                
                <AnimatePresence>
                  {expandedSender === profile.sender && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h5 className="text-sm font-medium mb-2">Communication Tips</h5>
                          <p className="text-sm text-muted-foreground">{profile.communicationTips}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h5 className="text-sm font-medium mb-2">Activity Pattern</h5>
                          <p className="text-sm text-muted-foreground">{profile.activityPattern}</p>
                          <p className="text-sm text-muted-foreground mt-2">{profile.moodPattern}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Communication Strengths</h5>
                          <ul className="space-y-1">
                            {profile.strengths.map((strength, index) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <ThumbsUp className="h-3 w-3 text-green-500" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-2">Growth Opportunities</h5>
                          <ul className="space-y-1">
                            {profile.growthAreas.map((area, index) => (
                              <li key={index} className="text-sm flex items-center gap-2">
                                <Activity className="h-3 w-3 text-amber-500" />
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="insights">
          {communicationInsights.length > 0 ? (
            <motion.div 
              className="space-y-4 py-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {communicationInsights.map((insight, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-50 p-4 rounded-md"
                  variants={itemVariants}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {insight.icon}
                    <h5 className="text-sm font-medium">{insight.title}</h5>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </motion.div>
              ))}
              
              <motion.div 
                className="mt-6 text-center text-sm text-muted-foreground"
                variants={itemVariants}
              >
                This analysis is based on message patterns and should be viewed as entertainment rather than scientific assessment.
              </motion.div>
            </motion.div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              {personalityProfiles.length < 2 ? 
                "Insights are available when analyzing conversations between two people." :
                "Not enough data to generate relationship insights."}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}