import { useState, useEffect } from "react";
import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Search, ChevronDown, ChevronUp, Tag, BarChart2,Shield, KeyRound } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface DetailedTopicWordAnalysisProps {
  data: ChatStats;
}

interface TopicWordDetails {
  [topic: string]: {
    words: { word: string; count: number }[];
    totalWordCount: number;
  };
}
// export default function ProtectedAnalytics({ onUnlock }) {
//   const [password, setPassword] = useState("");
//   const { theme } = useTheme();
  
//   const handlePasswordSubmit = () => {
//     // Handle password validation logic here
//     if (password.trim()) {
//       onUnlock(password);
//     }
//   }
//   };
export default function DetailedTopicWordAnalysis({ data }: DetailedTopicWordAnalysisProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [topicWordDetails, setTopicWordDetails] = useState<TopicWordDetails>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});
  const [selectedTab, setSelectedTab] = useState("all");

  // Generate topic word analysis data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      analyzeTopicWords();
    }
  }, [isAuthenticated]);

  const analyzeTopicWords = () => {
    const details: TopicWordDetails = {};

    data.topTopics.forEach(topicItem => {
      const topic = topicItem.topic;
      const keywords = TOPIC_KEYWORDS[topic]?.map(k => k.toLowerCase()) || [];
      const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "i");

      const wordCounts: { [word: string]: number } = {};
      let totalWordCount = 0;

      data.messages.forEach(message => {
        const lowerContent = message.content.toLowerCase();

        if (keywordRegex.test(lowerContent)) {
          const words = lowerContent
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);

          words.forEach(word => {
            if (keywords.includes(word)) {
              wordCounts[word] = (wordCounts[word] || 0) + 1;
              totalWordCount++;
            }
          });
        }
      });

      const sortedWords = Object.entries(wordCounts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);

      if (sortedWords.length > 0) {
        details[topic] = {
          words: sortedWords,
          totalWordCount
        };
      }
    });

    setTopicWordDetails(details);
    
    // Initialize expanded state
    const initialExpandedState: {[key: string]: boolean} = {};
    Object.keys(details).forEach((topic, index) => {
      initialExpandedState[topic] = index < 3; // Expand first 3 topics by default
    });
    setExpandedTopics(initialExpandedState);
  };

  const handlePasswordSubmit = () => {
    if (password === "magic") {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Password accepted! Access granted to detailed topic analysis.",
        variant: "default"
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive"
      });
      setPassword("");
    }
  };

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };

  const getFilteredTopics = () => {
    let topics = Object.entries(topicWordDetails);
    
    // Filter by search term
    if (searchTerm) {
      topics = topics.filter(([topic]) => 
        topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab
    if (selectedTab !== "all") {
      const categoryMap: {[key: string]: string[]} = {
        "social": ["Social Media", "Relationships", "Friendship & Bonding"],
        "work": ["Work", "Finance", "Technology", "Education"],
        "lifestyle": ["Food", "Travel", "Health", "Entertainment", "Shopping"],
        "personal": ["Family", "Emotions", "Religion & Spirituality"],
        "sensitive": ["Abusive Language (Gālī)", "Sexting & Sexual", "Suggestive Slang & Hinglish Dirty Talk"]
      };
      
      if (categoryMap[selectedTab]) {
        topics = topics.filter(([topic]) => 
          categoryMap[selectedTab].includes(topic)
        );
      }
    }
    
    return topics;
  };

  const getWordColor = (count: number, maxCount: number) => {
    const intensity = Math.min(Math.max(count / maxCount, 0.3), 1);
    return `rgba(var(--primary-rgb), ${intensity})`;
  };

  const TOPIC_KEYWORDS: { [topic: string]: string[] } = {
    "Work": [
    "work", "job", "project", "meeting", "deadline", "boss", "client", "office", "email", "business",
    "kaam", "naukri", "rozgaar", "target", "promotion", "office gaya", "office aaya", "workload"
    ],
    // ... [other topic keywords remain the same]
    "Social Media": [
      "instagram", "whatsapp", "facebook", "snapchat", "twitter", "threads", "reels", "story", "post", "dp",
      "followers", "like", "comment", "viral", "status", "online", "msg", "ping", "bio", "meme"
    ],
    "Family": [
      "family", "mom", "dad", "mother", "father", "bhai", "behen", "bhaiya", "didi", "son", "daughter",
      "grandma", "grandpa", "papa", "maa", "mommy", "daddy", "ghar wale", "ghar par"
    ],
    // Adding more topics to show categories are working
    "Finance": [
      "money", "salary", "payment", "upi", "bank", "transaction", "wallet", "loan", "emi", "debit",
      "credit", "paisa", "udhaar", "paytm", "gpay", "savings", "salary aayi", "broke", "income", "bonus"
    ],
    "Relationships": [
      "love", "bf", "gf", "boyfriend", "girlfriend", "breakup", "patchup", "proposal", "date", "crush",
      "pyar", "ishq", "mohabbat", "meri wali", "uska bf", "meri gf", "feeling", "ex", "emotional", "soulmate"
    ],
    "Emotions": [
      "happy", "sad", "angry", "upset", "excited", "tension", "depressed", "cry", "laugh", "mood",
      "feeling", "emotional", "gussa", "khush", "dukhi", "stress", "relaxed", "shocked", "love you", "missing you"
    ],
    "Food": [
      "food", "dinner", "lunch", "breakfast", "eat", "restaurant", "cook", "meal", "pizza", "burger",
      "khana", "bhojan", "khila", "cooking", "biryani", "chai", "coffee", "maggie", "chat", "swiggy", "zomato"
    ],
    "Travel": [
      "travel", "trip", "vacation", "holiday", "flight", "hotel", "airport", "beach", "tour", "visit",
      "safar", "yatra", "ghoomna", "chalna", "nikle", "goa", "manali", "trip plan", "hill station", "outstation"
    ],
    "Health": [
      "health", "doctor", "hospital", "sick", "medicine", "pain", "exercise", "gym", "workout", "fitness",
      "bimaar", "tablet", "aspirin", "checkup", "fever", "dard", "vaccination", "covid", "diet", "fit hona"
    ],
    "Entertainment": [
      "movie", "film", "show", "tv", "watch", "series", "netflix", "theater", "actor", "music",
      "entertainment", "songs", "dance", "bollywood", "hollywood", "reel", "youtube", "rap", "gana", "OTT"
    ],
    "Technology": [
      "phone", "computer", "laptop", "tech", "app", "software", "internet", "device", "wifi", "digital",
      "smartphone", "network", "charging", "android", "iPhone", "AI", "chatgpt", "coding", "startup", "bug"
    ],
    "Shopping": [
      "buy", "shop", "store", "price", "cost", "purchase", "sale", "bought", "spending", "ordered",
      "shopping", "cart", "amazon", "flipkart", "order kiya", "online manga", "bill", "checkout", "discount", "EMI"
    ],
    "Education": [
      "study", "homework", "exam", "class", "school", "college", "teacher", "test", "marks", "assignment",
      "padhaai", "lecture", "project", "internship", "bunk", "online class", "attendance", "fail", "pass", "subject"
    ],
    "Religion & Spirituality": [
      "mandir", "temple", "bhagwan", "god", "prayer", "puja", "aarti", "havan", "namaz", "masjid",
      "church", "guru", "shlok", "om", "allah", "jesus", "krishna", "shiv", "ganesh", "diya", "ram"
    ],
    "Friendship & Bonding": [
      "yaar", "dost", "bestie", "friend", "buddy", "gang", "group chat", "add me", "bro", "bhai",
      "sis", "yaari", "yaarana", "masti", "lifeline", "school friends", "college buddy", "gang hangout"
    ],
    "Abusive Language (Gālī)": [
      "bhenchod", "bhosdike", "madarchod", "gandu", "chutiya", "kutte", "harami", "randi", "chod", "lund",
      "chodu", "gaand", "tatti", "mc", "bc", "chodna", "chudai", "chod diya", "gaand mara", "gand fat gayi",
      "jhant", "jhatu", "suar", "behen ke laude", "randi ka bacha", "bkl", "bkl saala", "chakka", "kutta sala"
    ],
    "Sexting & Sexual": [
      "sex","sexy", "nude", "nudes", "boobs", "breasts", "ass", "penis", "vagina", "dick", "pussy",
      "horny", "fuck", "fucking", "sucking", "69", "condom", "xxx", "porn", "adult", "sexy",
      "ling", "yoni", "sambhog", "sambandh", "chikna", "chikni", "tharak", "nangi", "maal", "garmi chadhi",
      "mujhe chahiye", "send pic", "nangi photo", "show me", "baby i'm hard", "video call karo", "bistar mein aa jao"
    ],
    "Suggestive Slang & Hinglish Dirty Talk": [
      "item", "maal", "patane", "setting", "tharki", "flirt", "line maarna", "dirty talk", "romance", "lust",
      "raat bhar", "bedroom", "kamasutra", "makeout", "thighs", "cleavage", "hot photo", "send hot", "dirty pic",
      "bhabhi", "aunty", "sexy ladki", "naughty", "chat me aaja", "voice message bhej", "kya pehna hai", "underwear", "bra"
    ]
  };

  const getMaxCount = (words: { word: string; count: number }[]) => {
    return words.length > 0 ? words[0].count : 0;
  };

  const getCategoryIcon = (topic: string) => {
    const icons: {[key: string]: JSX.Element} = {
      "Work": <BarChart2 size={16} />,
      "Family": <Tag size={16} />,
      "Social Media": <Tag size={16} />,
      // Add more topic-specific icons as needed
    };
    
    return icons[topic] || <Tag size={16} />;
  };

  if (!isAuthenticated) {
    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden border-0 shadow-xl dark:shadow-primary/5 relative">
        {/* Glass background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-md z-0" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 via-primary/20 to-primary/80" />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary/5 dark:bg-primary/10 blur-2xl" />
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 blur-xl" />
        
        <div className="relative z-10 p-8 flex flex-col items-center justify-center space-y-8 py-12">
          {/* Lock icon with pulse animation and glow effect */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-background to-background/80 border-2 border-primary/30 dark:border-primary/20 shadow-lg relative z-10"
              animate={{
                scale: [1, 1.03, 1],
                boxShadow: [
                  "0px 0px 0px rgba(var(--primary-rgb), 0.2)",
                  "0px 0px 30px rgba(var(--primary-rgb), 0.4)",
                  "0px 0px 0px rgba(var(--primary-rgb), 0.2)"
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Lock className="w-10 h-10 text-primary dark:text-primary/90" />
            </motion.div>
          </div>
          
          {/* Text content with dynamic gradient */}
          <div className="text-center space-y-3">
            <motion.h3 
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              Protected Analytics
            </motion.h3>
            <motion.p 
              className="text-base text-foreground/80 dark:text-foreground/70 text-center max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              Unlock detailed word analysis for each conversation topic with secure authentication.
            </motion.p>
          </div>
          
          {/* Password input and button with enhanced styling */}
          <motion.div
            className="w-full max-w-sm space-y-4 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="relative group">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                className="pl-12 pr-4 py-6 rounded-xl border-2 border-primary/20 dark:border-primary/10 focus:border-primary/40 dark:focus:border-primary/30 transition-all text-lg bg-background/80 dark:bg-background/30 backdrop-blur-sm"
              />
              <div className="absolute left-3 top-3 text-primary/60 dark:text-primary/50 group-focus-within:text-primary transition-colors">
                <KeyRound size={20} />
              </div>
              
              <motion.span 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/30 dark:bg-primary/20 origin-left scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" 
                initial={false}
              />
            </div>
            
            <Button
              className="w-full py-6 rounded-xl shadow-lg dark:shadow-primary/10 transition-all text-white dark:text-white font-medium text-lg relative overflow-hidden group"
              onClick={handlePasswordSubmit}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70 z-0" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
              <div className="relative z-10 flex items-center justify-center">
                <Unlock size={18} className="mr-2" /> 
                <span>Unlock Analytics</span>
              </div>
              
              <motion.div
                className="absolute inset-0 bg-white dark:bg-white opacity-10 z-0"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ 
                  scale: 1.5,
                  opacity: 0.1,
                  transition: { duration: 0.4 }
                }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              />
            </Button>
          </motion.div>
          
          {/* Security badge with enhanced visibility */}
          <motion.div
            className="flex items-center text-sm text-foreground/60 dark:text-foreground/50 mt-4 space-x-2 bg-background/50 dark:bg-background/20 px-4 py-2 rounded-full backdrop-blur-sm border border-primary/10 dark:border-primary/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Shield size={14} className="text-primary/70 dark:text-primary/60" />
            <span>Secured with end-to-end encryption</span>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
  }

  const filteredTopics = getFilteredTopics();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-background to-background/90 border-2 border-primary/10 shadow-lg">
        <div className="p-6 md:p-8">
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Topic Insights
              </h3>
              <p className="text-muted-foreground">
                Explore word usage patterns across conversation topics
              </p>
            </div>
            <div className="hidden md:block">
              {/* <Button 
                variant="outline" 
                className="bg-primary-foreground/10 border-primary/20"
              >
                <BarChart2 size={16} className="mr-2" /> Export
              </Button> */}
            </div>
          </motion.div>

          <motion.div 
            className="mb-6 space-y-4"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <Input
                placeholder="Search topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-6 rounded-xl border-2 border-primary/20 focus:border-primary/40 transition-all"
              />
              <div className="absolute left-3 top-3 text-primary/60">
                <Search size={18} />
              </div>
            </div>
            
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
              {["all", "social", "work", "lifestyle", "personal", "sensitive"].map((tab) => (
                <Button
                  key={tab}
                  variant={selectedTab === tab ? "default" : "outline"}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedTab === tab ? "bg-primary text-primary-foreground" : "bg-background border-primary/20"
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6">
            <AnimatePresence>
              {filteredTopics.length > 0 ? (
                filteredTopics.map(([topic, details], index) => {
                  const maxCount = getMaxCount(details.words);
                  
                  return (
                    <motion.div
                      key={topic}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border border-primary/10 rounded-xl overflow-hidden bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm"
                    >
                      <div 
                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={() => toggleTopic(topic)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {getCategoryIcon(topic)}
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">{topic}</h4>
                            <p className="text-sm text-muted-foreground">
                              {details.totalWordCount} words • {details.words.length} unique terms
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-2">
                          {expandedTopics[topic] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {expandedTopics[topic] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0">
                              <div className="flex flex-wrap gap-2 mt-4">
                                {details.words.map((wordItem, wordIndex) => (
                                  <motion.div
                                    key={wordItem.word}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ 
                                      duration: 0.3, 
                                      delay: wordIndex * 0.01,
                                      type: "spring",
                                      stiffness: 100
                                    }}
                                    whileHover={{ 
                                      scale: 1.05,
                                      boxShadow: "0px 2px 8px rgba(var(--primary-rgb), 0.25)" 
                                    }}
                                    className="flex justify-between items-center py-1 px-3 rounded-full"
                                    style={{ 
                                      backgroundColor: `rgba(var(--primary-rgb), 0.1)`,
                                      border: `1px solid ${getWordColor(wordItem.count, maxCount)}`,
                                      color: getWordColor(wordItem.count, maxCount)
                                    }}
                                  >
                                    <span className="mr-2">{wordItem.word}</span>
                                    <span className="text-xs font-mono bg-background/80 px-2 py-0.5 rounded-full">
                                      {wordItem.count}
                                    </span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-primary/50" />
                  </div>
                  <h4 className="font-medium text-lg mb-1">No topics found</h4>
                  <p>Try adjusting your search or filters</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        :root {
          --primary-rgb: 59, 130, 246;
        }
      `}</style>
    </motion.div>
  );
}