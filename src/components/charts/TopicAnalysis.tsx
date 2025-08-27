import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TopicAnalysisProps {
  data: ChatStats;
}

interface TopicData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// Vibrant color palette
const COLORS = [
  "#FF6B6B", // Coral red
  "#4ECDC4", // Turquoise
  "#FFD166", // Yellow
  "#6A0572", // Purple
  "#1A535C", // Deep teal
  "#F9C80E", // Bright yellow
  "#FF928B", // Light coral
  "#5C4B99", // Lavender
  "#3ABEFF", // Bright blue
];

export default function TopicAnalysis({ data }: TopicAnalysisProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Process data
  const topicData: TopicData[] = data.topTopics.map((item, index) => ({
    name: item.topic,
    value: item.count,
    percentage: 0, // Will be calculated
    color: COLORS[index % COLORS.length]
  }));

  // Calculate percentages
  const totalMessages = topicData.reduce((sum, topic) => sum + topic.value, 0);
  topicData.forEach(topic => {
    topic.percentage = totalMessages > 0 ? (topic.value / totalMessages) * 100 : 0;
  });

  // Sort by value (descending)
  topicData.sort((a, b) => b.value - a.value);

  // Animation effect
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Card className="overflow-hidden relative bg-slate-900 text-white border-0 rounded-xl shadow-xl">
      {/* Header with gradient background */}
      <div className="p-6 bg-gradient-to-r from-indigo-900 to-purple-900">
        <h3 className="text-xl font-bold mb-1">Topic Analysis</h3>
        <p className="text-sm text-gray-300 opacity-80">
          Conversation topic distribution
        </p>
      </div>

      {/* Content area */}
      <div className="p-6">
        {topicData.length > 0 ? (
          <div className="space-y-8">
            {/* Topic visualization */}
            <div className="flex flex-wrap gap-2 mb-6">
              {topicData.map((topic, index) => (
                <motion.div
                  key={topic.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: selectedTopic === topic.name || !selectedTopic ? 1 : 0.4,
                    transition: { 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 15
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                >
                  <div 
                    className="rounded-lg px-3 py-1 text-sm font-medium"
                    style={{ 
                      backgroundColor: topic.color,
                      boxShadow: selectedTopic === topic.name ? `0 0 12px ${topic.color}` : 'none'
                    }}
                  >
                    {topic.name}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dual visualization: Pie chart and bar */}
            <div className="grid grid-cols-2 gap-6">
              {/* Pie chart visualization */}
              <div className="relative h-48">
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <g transform="translate(50, 50)">
                    {topicData.map((topic, index) => {
                      // Calculate pie segments
                      const previousTopics = topicData.slice(0, index);
                      const previousTotal = previousTopics.reduce((sum, t) => sum + t.percentage, 0);
                      const startAngle = (previousTotal / 100) * 2 * Math.PI - Math.PI / 2;
                      const endAngle = ((previousTotal + topic.percentage) / 100) * 2 * Math.PI - Math.PI / 2;
                      
                      // Calculate SVG arc path
                      const x1 = 40 * Math.cos(startAngle);
                      const y1 = 40 * Math.sin(startAngle);
                      const x2 = 40 * Math.cos(endAngle);
                      const y2 = 40 * Math.sin(endAngle);
                      
                      const largeArcFlag = topic.percentage > 50 ? 1 : 0;
                      
                      // Create arc path
                      const pathData = `M 0 0 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                      
                      return (
                        <motion.path
                          key={topic.name}
                          d={pathData}
                          fill={topic.color}
                          opacity={selectedTopic === topic.name || !selectedTopic ? 1 : 0.4}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: selectedTopic === topic.name || !selectedTopic ? 1 : 0.4,
                            scale: selectedTopic === topic.name ? 1.05 : 1,
                            transition: { 
                              duration: 0.5, 
                              delay: index * 0.05 
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    })}
                    
                    {/* Inner circle for donut effect */}
                    <motion.circle
                      cx="0"
                      cy="0"
                      r="25"
                      fill="#1e1e2e"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.5 } }}
                    />
                    
                    {/* Center text */}
                    <motion.text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.7 } }}
                    >
                      {selectedTopic ? 
                        selectedTopic : 
                        `${topicData.length} Topics`}
                    </motion.text>
                    
                    {/* Count or percentage text */}
                    <motion.text
                      x="0"
                      y="10"
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.7)"
                      fontSize="6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.8 } }}
                    >
                      {selectedTopic ? 
                        `${topicData.find(t => t.name === selectedTopic)?.percentage.toFixed(1)}%` : 
                        `${totalMessages} messages`}
                    </motion.text>
                  </g>
                </svg>
              </div>
              
              {/* Bar visualization */}
              <div className="relative h-48 flex flex-col justify-center">
                <div className="space-y-4">
                  {topicData.slice(0, 5).map((topic, index) => (
                    <div key={topic.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <span 
                            className="inline-block w-2 h-2 rounded-full" 
                            style={{ backgroundColor: topic.color }}
                          ></span>
                          {topic.name}
                        </span>
                        <span className="text-gray-400">{topic.percentage.toFixed(1)}%</span>
                      </div>
                      <motion.div 
                        className="h-2 rounded-full overflow-hidden bg-gray-800"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: "100%",
                          transition: { duration: 0.3 }
                        }}
                      >
                        <motion.div 
                          className="h-full"
                          style={{ backgroundColor: topic.color }}
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${topic.percentage}%`,
                            transition: { 
                              delay: 0.3 + index * 0.1, 
                              duration: 1,
                              ease: "easeOut"
                            }
                          }}
                        />
                      </motion.div>
                    </div>
                  ))}
                </div>
                
                {topicData.length > 5 && (
                  <div className="text-xs text-gray-500 text-right mt-2 italic">
                    +{topicData.length - 5} more topics
                  </div>
                )}
              </div>
            </div>

            {/* Selected topic details */}
            <AnimatePresence mode="wait">
              {selectedTopic ? (
                <motion.div
                  key={selectedTopic}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${topicData.find(t => t.name === selectedTopic)?.color}22`
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg">{selectedTopic}</h4>
                    <div 
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: topicData.find(t => t.name === selectedTopic)?.color }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Message Count</p>
                      <p className="text-2xl font-bold">
                        {topicData.find(t => t.name === selectedTopic)?.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Percentage</p>
                      <p className="text-2xl font-bold">
                        {topicData.find(t => t.name === selectedTopic)?.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-4 text-gray-400 text-sm italic"
                >
                  Select a topic for detailed information
                </motion.div>
              )}
            </AnimatePresence>

            {/* Topic table */}
            <div className="mt-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left py-2 font-medium">Topic</th>
                    <th className="text-right py-2 font-medium">Count</th>
                    <th className="text-right py-2 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {topicData.map((topic) => (
                    <motion.tr 
                      key={topic.name}
                      className="border-b border-gray-800 cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        backgroundColor: selectedTopic === topic.name ? 'rgba(255,255,255,0.05)' : 'transparent'
                      }}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                    >
                      <td className="py-3 flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: topic.color }}
                        ></div>
                        {topic.name}
                      </td>
                      <td className="py-3 text-right font-medium">{topic.value}</td>
                      <td className="py-3 text-right font-medium">{topic.percentage.toFixed(1)}%</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <motion.div 
            className="py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block p-4 rounded-full bg-gray-800 mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-300">No conversation data</h4>
            <p className="text-gray-500 mt-2">Start chatting to generate topic insights</p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}