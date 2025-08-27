import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { ChatStats } from "@/utils/chatParser";

interface LinkAnalysisProps {
  data: ChatStats;
}

interface LinkData {
  url: string;
  domain: string;
  siteName: string;
  pageTitle: string;
  sender: string;
  timestamp: string;
}

interface DomainStat {
  domain: string;
  count: number;
}

export default function LinkAnalysis({ data }: LinkAnalysisProps) {
  const linkAnalysis = useMemo(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const linkData: LinkData[] = [];
    const domainStats: Record<string, number> = {};
    let totalLinks = 0;
    
    // Extract links from messages
    data.messages.forEach(message => {
      const links = message.content.match(urlRegex);
      if (links) {
        links.forEach(link => {
          try {
            const url = new URL(link);
            const domain = url.hostname.replace('www.', '');
            const pathName = url.pathname;
            
            // Create a nice title from the domain/path
            let siteName = domain;
            if (domain.includes('.')) {
              siteName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
            }
            
            // Get clean path for website description
            let pageTitle = pathName;
            if (pathName && pathName.length > 1) {
              const segments = pathName.split('/').filter(Boolean);
              if (segments.length) {
                pageTitle = segments[segments.length - 1].replace(/-/g, ' ').replace(/\.[^/.]+$/, '');
                pageTitle = pageTitle.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
              }
            }
            
            const senderName = message.sender || 'Unknown';
            
            // Add to domain stats
            domainStats[domain] = (domainStats[domain] || 0) + 1;
            
            // Add to link data
            linkData.push({
              url: link,
              domain,
              siteName,
              pageTitle: pageTitle || 'Home Page',
              sender: senderName,
              timestamp: message.time || new Date().toISOString()
            });
            
            totalLinks++;
          } catch (e) {
            // Invalid URL, skip
          }
        });
      }
    });
    
    // Sort links by domain frequency
    linkData.sort((a, b) => {
      const domainDiff = domainStats[b.domain] - domainStats[a.domain];
      if (domainDiff === 0) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return domainDiff;
    });
    
    // Get top domains for chart
    const topDomains: DomainStat[] = Object.entries(domainStats)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      links: linkData.slice(0, 10), // Top 10 links
      domains: topDomains,
      totalLinks
    };
  }, [data]);
  
  const colors = [
    "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
    "#06b6d4", "#ec4899", "#d97706", "#6366f1", "#10b981"
  ];
  
  return (
    <Card className="overflow-hidden">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">Link Analysis</h3>
          <div className="bg-blue-100 text-blue-800 text-sm font-medium rounded-full px-3 py-1">
            {linkAnalysis.totalLinks} Links
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Top shared websites and who shared them
        </p>
      </div>
      
      {linkAnalysis.totalLinks > 0 ? (
        <div className="flex flex-col md:flex-row">
          <div className="p-6 pt-0 md:w-1/2">
            <div className="mb-4">
              <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">Top Domains</h4>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={linkAnalysis.domains}
                  layout="vertical"
                  margin={{ top: 5, right: 5, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    dataKey="domain" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} links`, 'Count']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {linkAnalysis.domains.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-gray-200 p-6 md:w-1/2">
            <div className="mb-4">
              <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">Top Shared Links</h4>
            </div>
            <div className="overflow-y-auto max-h-80 pr-2">
              {linkAnalysis.links.map((link, index) => (
                <div 
                  key={index} 
                  className="flex items-start mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full mr-3"
                    style={{ backgroundColor: `${colors[index % colors.length]}20`, color: colors[index % colors.length] }}>
                    {link.siteName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center mb-1">
                      <span className="font-medium truncate">{link.siteName}</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-sm text-gray-500 truncate">{link.domain}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 truncate">{link.pageTitle}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="font-medium">Shared by:</span>
                      <span className="ml-1">{link.sender}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Links Found</h3>
          <p className="text-gray-500">There are no links shared in this conversation.</p>
        </div>
      )}
    </Card>
  );
}