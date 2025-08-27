import { ChatStats } from "@/utils/chatParser";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useMemo } from "react";
import { Calendar, MessageSquare, Users, ChevronLeft, ChevronRight, BarChart2, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, TooltipProps } from "recharts";
import { ReactNode } from "react";

interface ConversationCalendarProps {
  data: ChatStats;
}

export default function ConversationCalendar({ data }: ConversationCalendarProps) {
  // Track the current view month/year
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayDetails, setDayDetails] = useState<{
    date: Date;
    totalMessages: number;
    messagesBySender: { [sender: string]: number };
  } | null>(null);
  
  // Process data into a map of dates to message counts
  const { messagesByDate, senders, dateRange, maxMessagesPerDay, activityData } = useMemo(() => {
    const messageMap = new Map<string, { 
      total: number, 
      bySender: { [sender: string]: number } 
    }>();
    const senderSet = new Set<string>();
    let minDate = Infinity;
    let maxDate = 0;
    let maxCount = 0;
    
    const activityByDate: Record<string, { date: string; total: number; [key: string]: any }> = {};
    
    data.messages.forEach(message => {
      const date = new Date(message.date);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split('T')[0];
      const sender = message.sender;
      
      senderSet.add(sender);
      minDate = Math.min(minDate, date.getTime());
      maxDate = Math.max(maxDate, date.getTime());
      
      if (!messageMap.has(dateKey)) {
        messageMap.set(dateKey, { total: 0, bySender: {} });
      }
      
      const dayData = messageMap.get(dateKey)!;
      dayData.total += 1;
      dayData.bySender[sender] = (dayData.bySender[sender] || 0) + 1;
      
      // Store activity data for the chart
      if (!activityByDate[dateKey]) {
        activityByDate[dateKey] = { date: dateKey, total: 0 };
        // Initialize sender counts after we have the full sender list
      }
      activityByDate[dateKey].total += 1;
      if (!activityByDate[dateKey][sender]) {
        activityByDate[dateKey][sender] = 0;
      }
      activityByDate[dateKey][sender] += 1;
      
      maxCount = Math.max(maxCount, dayData.total);
    });
    
    // Get final sender list
    const sendersList = Array.from(senderSet);
    
    // Ensure all activities have all senders initialized
    Object.values(activityByDate).forEach(dayData => {
      sendersList.forEach(sender => {
        if (dayData[sender] === undefined) {
          dayData[sender] = 0;
        }
      });
    });
    
    // Convert activity data to array and sort by date
    const activityDataArray = Object.values(activityByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return { 
      messagesByDate: messageMap, 
      senders: sendersList,
      dateRange: { min: minDate, max: maxDate },
      maxMessagesPerDay: maxCount,
      activityData: activityDataArray
    };
  }, [data]);

  // Colors for senders
  const colors = useMemo(() => {
    const colorPalette = [
      "#3498db", // Blue
      "#e74c3c", // Red
      "#2ecc71", // Green
      "#9b59b6", // Purple
      "#f39c12", // Orange
      "#1abc9c", // Teal
    ];
    
    return senders.map((_, i) => colorPalette[i % colorPalette.length]);
  }, [senders]);

  // Generate calendar data for current view month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days to show (including prev/next month days)
    const totalDays = 42; // Always show 6 weeks
    
    const days = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      const date = new Date(year, month - 1, i);
      const dateKey = date.toISOString().split('T')[0];
      const messageData = messagesByDate.get(dateKey);
      
      days.push({
        date,
        isCurrentMonth: false,
        messageCount: messageData?.total || 0,
        messagesBySender: messageData?.bySender || {},
        dateKey
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateKey = date.toISOString().split('T')[0];
      const messageData = messagesByDate.get(dateKey);
      
      days.push({
        date,
        isCurrentMonth: true,
        messageCount: messageData?.total || 0,
        messagesBySender: messageData?.bySender || {},
        dateKey
      });
    }
    
    // Add days from next month
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const dateKey = date.toISOString().split('T')[0];
      const messageData = messagesByDate.get(dateKey);
      
      days.push({
        date,
        isCurrentMonth: false,
        messageCount: messageData?.total || 0,
        messagesBySender: messageData?.bySender || {},
        dateKey
      });
    }
    
    return days;
  }, [viewDate, messagesByDate]);

  // Change month
  const changeMonth = (delta: number) => {
    setViewDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  // Get color intensity based on message count
  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    return Math.max(0.1, Math.min(0.95, count / maxMessagesPerDay));
  };

  // Handle day click
  const handleDayClick = (day: typeof calendarDays[0]) => {
    setSelectedDate(day.date);
    setDayDetails({
      date: day.date,
      totalMessages: day.messageCount,
      messagesBySender: day.messagesBySender
    });
  };

  // Format date for tooltip
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Custom tooltip for the chart
  interface TooltipContentProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
      name: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipContentProps): ReactNode => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border rounded-md shadow-md">
          <p className="font-medium">{formatDate(label || '')}</p>
          <p className="text-sm">
            <span className="font-medium">Total:</span> {payload[0]?.value || 0} messages
          </p>
          {payload.slice(1).map((entry, index) => (
            entry.value > 0 && (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="font-medium">{entry.dataKey}:</span> {entry.value}
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  // Get weekly average messages
  const weeklyAverage = useMemo(() => {
    if (!activityData || activityData.length === 0) return 0;
    const totalMsgs = activityData.reduce((sum, day: any) => sum + (day.total || 0), 0);
    const uniqueDays = activityData.length;
    return Math.round((totalMsgs / uniqueDays) * 7);
  }, [activityData]);

  // Get total messages
  const totalMessages = useMemo(() => {
    if (!activityData || activityData.length === 0) return 0;
    return activityData.reduce((sum, day: any) => sum + (day.total || 0), 0);
  }, [activityData]);

  // Week days
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Conversation Activity Calendar
          </h3>
          <p className="text-sm text-muted-foreground">
            Message frequency heatmap showing conversation patterns
          </p>
        </div>
        
        <div className="flex items-center mt-2 sm:mt-0">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-l-md border border-r-0 hover:bg-muted transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="px-4 py-2 border font-medium">
            {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-r-md border border-l-0 hover:bg-muted transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => setViewDate(new Date())}
            className="ml-2 px-3 py-2 text-xs rounded-md border hover:bg-muted transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Activity Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border shadow-sm flex items-center">
          <div className="mr-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Messages</p>
            <p className="text-2xl font-bold">{totalMessages}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border shadow-sm flex items-center">
          <div className="mr-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Weekly Average</p>
            <p className="text-2xl font-bold">{weeklyAverage}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border shadow-sm flex items-center">
          <div className="mr-4 p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <Users className="h-5 w-5 text-green-600 dark:text-green-300" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Participants</p>
            <p className="text-2xl font-bold">{senders.length}</p>
          </div>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border shadow-sm mb-6">
        <h4 className="font-medium mb-4 flex items-center">
          <BarChart2 className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-300" />
          Message Activity Timeline
        </h4>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={activityData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                tickCount={5}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickCount={5}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#3498db" 
                strokeWidth={3}
                dot={false}
                name="All Messages"
              />
              {senders.map((sender, i) => (
                <Line
                  key={sender}
                  type="monotone"
                  dataKey={sender}
                  stroke={colors[i % colors.length]}
                  strokeWidth={1.5}
                  dot={false}
                  name={sender}
                  strokeDasharray="3 3"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {weekDays.map(day => (
          <div key={day} className="text-center py-2 font-medium text-sm">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, i) => {
          const intensity = getIntensity(day.messageCount);
          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className={`
                relative aspect-square p-1 rounded-md flex flex-col justify-between items-center
                transition-all duration-200 hover:scale-105 hover:shadow-md
                ${day.isCurrentMonth ? 'font-medium' : 'text-muted-foreground font-normal opacity-60'}
                ${selectedDate && selectedDate.toDateString() === day.date.toDateString() ? 'ring-2 ring-primary ring-offset-2' : ''}
              `}
              style={{
                background: day.messageCount > 0 ? `rgba(52, 152, 219, ${intensity})` : '',
                color: intensity > 0.5 ? 'white' : ''
              }}
            >
              <div className="self-start text-xs">
                {day.date.getDate()}
              </div>
              
              {day.messageCount > 0 && (
                <div className="flex flex-col items-center">
                  <MessageSquare className="h-3 w-3 mb-1" />
                  <span className="text-xs font-medium">{day.messageCount}</span>
                </div>
              )}
              
              {day.messageCount > 0 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                  {Object.keys(day.messagesBySender).length > 1 && (
                    <div className="flex justify-center space-x-0.5 mb-0.5">
                      {Object.keys(day.messagesBySender).slice(0, 3).map((sender, i) => (
                        <div 
                          key={sender} 
                          className="h-1 w-1 rounded-full" 
                          style={{ backgroundColor: colors[senders.indexOf(sender) % colors.length] }}
                        />
                      ))}
                      {Object.keys(day.messagesBySender).length > 3 && (
                        <div className="h-1 w-1 rounded-full bg-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Details Panel */}
      {dayDetails && (
        <div className="border rounded-lg p-4 mt-4 bg-white dark:bg-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h4 className="font-medium mb-2 flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {dayDetails.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h4>
          
          {dayDetails.totalMessages > 0 ? (
            <>
              <p className="text-sm mb-3 flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="font-medium">{dayDetails.totalMessages}</span> messages exchanged
              </p>
              
              <h5 className="text-sm font-medium mb-2 flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Participant Activity:
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(dayDetails.messagesBySender).map(([sender, count]) => (
                  <div 
                    key={sender} 
                    className="flex items-center justify-between py-1 px-2 rounded-md"
                    style={{ backgroundColor: `${colors[senders.indexOf(sender) % colors.length]}20` }}
                  >
                    <span className="font-medium" style={{ color: colors[senders.indexOf(sender) % colors.length] }}>
                      {sender}
                    </span>
                    <div className="flex items-center">
                      <div 
                        className="h-2 rounded-full mr-2" 
                        style={{ 
                          width: `${Math.max(20, Math.min(100, (count / dayDetails.totalMessages) * 100))}px`,
                          backgroundColor: colors[senders.indexOf(sender) % colors.length]
                        }}
                      />
                      <span className="text-sm">{count} msgs</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No messages on this day</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 border-t pt-4">
        <h4 className="font-medium mb-2">Activity Legend</h4>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-sm" style={{ background: 'rgba(52, 152, 219, 0.1)' }} />
            <span className="text-xs">Low</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-sm" style={{ background: 'rgba(52, 152, 219, 0.4)' }} />
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-sm" style={{ background: 'rgba(52, 152, 219, 0.7)' }} />
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-sm text-white flex items-center justify-center" style={{ background: 'rgba(52, 152, 219, 0.95)' }}>
              <span className="text-xs">+</span>
            </div>
            <span className="text-xs">Very High</span>
          </div>
        </div>
      </div>
    </Card>
  );
}