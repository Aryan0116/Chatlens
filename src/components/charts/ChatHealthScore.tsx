
import { useMemo } from "react";
import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Smile, MessageSquare, TrendingUp, Heart } from "lucide-react";

interface ChatHealthScoreProps {
  data: ChatStats;
}

export default function ChatHealthScore({ data }: ChatHealthScoreProps) {
  const healthMetrics = useMemo(() => {
    // Calculate engagement score based on message frequency
    const messageDays = Object.keys(data.messagesByDay).length;
    const totalDays = Math.max(1, Math.ceil((data.lastDate.getTime() - data.firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    const engagementScore = Math.min(100, Math.round((messageDays / totalDays) * 100));
    
    // Calculate positivity score based on sentiment
    let totalSentiment = 0;
    let sentimentCount = 0;
    
    Object.values(data.sentimentScores).forEach(scores => {
      totalSentiment += scores.reduce((a, b) => a + b, 0);
      sentimentCount += scores.length;
    });
    
    const avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0;
    const positivityScore = Math.min(100, Math.max(0, Math.round((avgSentiment + 5) * 10))); // Scale -5 to +5 to 0-100
    
    // Calculate balance score based on message count distribution
    const messageCounts = Object.values(data.messageCount);
    const totalMessages = messageCounts.reduce((a, b) => a + b, 0);
    const maxMessages = Math.max(...messageCounts);
    const balanceScore = Math.min(100, Math.round((1 - (maxMessages / totalMessages - (1 / messageCounts.length))) * 100));
    
    // Calculate response rate
    const totalResponses = Object.values(data.responseTimeHistory).length;
    const responseRate = Math.min(100, Math.round((totalResponses / totalMessages) * 100));
    
    // Calculate affection score
    const totalAffection = Object.values(data.affectionateWordsCount).reduce((a, b) => a + b, 0);
    const affectionScore = Math.min(100, Math.round((totalAffection / totalMessages) * 100 * 5)); // Weighted to be meaningful
    
    // Calculate overall health score
    const overallScore = Math.round(
      (engagementScore * 0.25) + 
      (positivityScore * 0.25) + 
      (balanceScore * 0.2) + 
      (responseRate * 0.15) + 
      (affectionScore * 0.15)
    );
    
    return {
      engagementScore,
      positivityScore,
      balanceScore,
      responseRate,
      affectionScore,
      overallScore
    };
  }, [data]);
  
  const getScoreDescription = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Very Good";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    if (score >= 20) return "Needs Improvement";
    return "Poor";
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-emerald-500";
    if (score >= 40) return "text-amber-500";
    if (score >= 20) return "text-orange-500";
    return "text-red-500";
  };
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Chat Health Score</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Overall health metrics for your conversation
      </p>
      
      <div className="mb-8 text-center">
        <div className="text-sm font-medium mb-2">Overall Health Score</div>
        <div className={`text-5xl font-bold mb-1 ${getScoreColor(healthMetrics.overallScore)}`}>
          {healthMetrics.overallScore}
        </div>
        <div className="text-sm font-medium">{getScoreDescription(healthMetrics.overallScore)}</div>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <span className={`text-sm font-medium ${getScoreColor(healthMetrics.engagementScore)}`}>
              {healthMetrics.engagementScore}%
            </span>
          </div>
          <Progress value={healthMetrics.engagementScore} className="h-2" />
          <p className="text-xs text-muted-foreground">How consistently you communicate</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Positivity</span>
            </div>
            <span className={`text-sm font-medium ${getScoreColor(healthMetrics.positivityScore)}`}>
              {healthMetrics.positivityScore}%
            </span>
          </div>
          <Progress value={healthMetrics.positivityScore} className="h-2" />
          <p className="text-xs text-muted-foreground">Overall sentiment and tone</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Balance</span>
            </div>
            <span className={`text-sm font-medium ${getScoreColor(healthMetrics.balanceScore)}`}>
              {healthMetrics.balanceScore}%
            </span>
          </div>
          <Progress value={healthMetrics.balanceScore} className="h-2" />
          <p className="text-xs text-muted-foreground">Equal participation in conversation</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Response Rate</span>
            </div>
            <span className={`text-sm font-medium ${getScoreColor(healthMetrics.responseRate)}`}>
              {healthMetrics.responseRate}%
            </span>
          </div>
          <Progress value={healthMetrics.responseRate} className="h-2" />
          <p className="text-xs text-muted-foreground">How often messages get responses</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Affection</span>
            </div>
            <span className={`text-sm font-medium ${getScoreColor(healthMetrics.affectionScore)}`}>
              {healthMetrics.affectionScore}%
            </span>
          </div>
          <Progress value={healthMetrics.affectionScore} className="h-2" />
          <p className="text-xs text-muted-foreground">Expressions of care and closeness</p>
        </div>
      </div>
    </Card>
  );
}
