import { useState, useEffect } from "react";
import { ChatStats } from "@/utils/chatParser"; 
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Filter,
  TrendingUp,
  MessageSquare,
  BarChart,
  Activity
} from "lucide-react";

interface AIInsightsProps {
  data: ChatStats;
}

export default function AIInsights({ data }: AIInsightsProps) {
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState("all");
  const [visibleInsights, setVisibleInsights] = useState([]);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Categories for insights with icons
  const categories = [
    { id: "all", label: "All", icon: <Filter className="h-3 w-3" /> },
    { id: "sentiment", label: "Sentiment", icon: <Activity className="h-3 w-3" /> },
    { id: "topics", label: "Topics", icon: <MessageSquare className="h-3 w-3" /> },
    { id: "patterns", label: "Patterns", icon: <TrendingUp className="h-3 w-3" /> },
    { id: "statistics", label: "Stats", icon: <BarChart className="h-3 w-3" /> }
  ];
  
  // Function to categorize insights (this is a mock - you'd implement real categorization)
  const categorizeInsight = (insight) => {
    // This is just an example - in real implementation, you'd analyze the insight text
    if (insight.toLowerCase().includes("sentiment") || insight.toLowerCase().includes("emotion")) {
      return "sentiment";
    } else if (insight.toLowerCase().includes("topic") || insight.toLowerCase().includes("discussion")) {
      return "topics";
    } else if (insight.toLowerCase().includes("stat") || insight.toLowerCase().includes("count") || insight.toLowerCase().includes("average")) {
      return "statistics";
    } else {
      return "patterns";
    }
  };
  
  // Get icon for a category
  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : <Lightbulb className="h-4 w-4" />;
  };
  
  // Filter insights based on selected category
  useEffect(() => {
    let filtered = data.aiInsights;
    
    if (filter !== "all") {
      filtered = data.aiInsights.filter(insight => categorizeInsight(insight) === filter);
    }
    
    // Initially set to empty array for animation effect
    setVisibleInsights([]);
    setAnimationComplete(false);
    
    // Gradually add insights for animation effect
    const timeout = setTimeout(() => {
      setVisibleInsights(filtered);
      setAnimationComplete(true);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [filter, data.aiInsights]);

  // Get pattern style based on category (dark mode compatible)
  const getPatternStyle = (category) => {
    switch(category) {
      case "sentiment": 
        return "dark:bg-blue-950/40 dark:border-blue-500 bg-blue-50 border-l-4 border-blue-500";
      case "topics": 
        return "dark:bg-emerald-950/40 dark:border-emerald-500 bg-emerald-50 border-l-4 border-emerald-500";
      case "patterns": 
        return "dark:bg-purple-950/40 dark:border-purple-500 bg-purple-50 border-l-4 border-purple-500";
      case "statistics": 
        return "dark:bg-amber-950/40 dark:border-amber-500 bg-amber-50 border-l-4 border-amber-500";
      default: 
        return "dark:bg-gray-800/50 dark:border-gray-500 bg-gray-50 border-l-4 border-gray-400";
    }
  };

  // Function to get badge color based on category (dark mode compatible)
  const getBadgeColor = (category) => {
    switch(category) {
      case "sentiment": return "dark:bg-blue-900 dark:text-blue-200 bg-blue-100 text-blue-800";
      case "topics": return "dark:bg-emerald-900 dark:text-emerald-200 bg-emerald-100 text-emerald-800";
      case "patterns": return "dark:bg-purple-900 dark:text-purple-200 bg-purple-100 text-purple-800";
      case "statistics": return "dark:bg-amber-900 dark:text-amber-200 bg-amber-100 text-amber-800";
      default: return "dark:bg-gray-700 dark:text-gray-200 bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border shadow-sm transition-all duration-300 hover:shadow-md dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-medium dark:text-gray-100">AI Insights</h3>
            <Badge variant="outline" className="ml-2 text-xs dark:border-gray-600 dark:text-gray-300">
              {data.aiInsights.length}
            </Badge>
          </div>
          
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={expanded ? "Collapse insights" : "Expand insights"}
          >
            {expanded ? 
              <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" /> : 
              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            }
          </button>
        </div>
        
        {expanded && (
          <>
            <p className="text-sm text-muted-foreground mb-4 dark:text-gray-300">
              Interesting patterns detected in your conversation
            </p>
            
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFilter(category.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    filter === category.id 
                      ? "bg-blue-500 text-white shadow-sm dark:bg-blue-600" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {category.icon}
                  {category.label}
                </button>
              ))}
            </div>
          </>
        )}
      </Card>
      
      {expanded && (
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500 ${
            animationComplete ? "opacity-100" : "opacity-0"
          }`}
        >
          {visibleInsights.length > 0 ? (
            visibleInsights.map((insight, index) => {
              const category = categorizeInsight(insight);
              return (
                <Card 
                  key={index}
                  className={`overflow-hidden hover:shadow-md transition-all duration-300 ${getPatternStyle(category)}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both",
                    animationName: "fadeIn",
                    animationDuration: "400ms"
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={`${getBadgeColor(category)} flex items-center gap-1.5`}>
                        {getCategoryIcon(category)}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                      <div className="text-xs text-gray-400 dark:text-gray-500">Insight #{index + 1}</div>
                    </div>
                    <p className="text-sm dark:text-gray-200">{insight}</p>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full p-8 text-center dark:bg-gray-800 dark:border-gray-700">
              <AlertCircle className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-muted-foreground dark:text-gray-400">No insights available for this filter</p>
            </Card>
          )}
        </div>
      )}
      
      {expanded && data.aiInsights.length > 6 && visibleInsights.length > 6 && (
        <div className="mt-2 text-center">
          {/* <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50">
            View all {data.aiInsights.length} insights
          </button> */}
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}