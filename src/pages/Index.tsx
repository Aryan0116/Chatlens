import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import SummaryCards from "@/components/SummaryCards";
import MessagesPerDay from "@/components/charts/MessagesPerDay";
import ActiveHoursHeatmap from "@/components/charts/ActiveHoursHeatmap";
import MessagesByPerson from "@/components/charts/MessagesByPerson";
import WordCloud from "@/components/charts/WordCloud";
import EmojiAnalysis from "@/components/charts/EmojiAnalysis";
import SentimentAnalysis from "@/components/charts/SentimentAnalysis";
import ResponseTimeAnalysis from "@/components/charts/ResponseTimeAnalysis";
import SpecialWordsAnalysis from "@/components/charts/SpecialWordsAnalysis";
import ConversationTimeline from "@/components/charts/ConversationTimeline";
import MessageLengthAnalysis from "@/components/charts/MessageLengthAnalysis";
import MessageTimePatterns from "@/components/charts/MessageTimePatterns";
import InteractionPatterns from "@/components/charts/InteractionPatterns";
import ConversationStarter from "@/components/charts/ConversationStarter";
import VocabularyRichness from "@/components/charts/VocabularyRichness";
import TopicAnalysis from "@/components/charts/TopicAnalysis";
import DetailedTopicWordAnalysis from "@/components/charts/DetailedTopicWordAnalysis";
import LinkAnalysis from "@/components/charts/LinkAnalysis";
import ChatHealthScore from "@/components/charts/ChatHealthScore";
import PersonalityAnalysis from "@/components/charts/PersonalityAnalysis";
import { ThemeProvider } from "@/components/ThemeProvider";
import AIInsights from "@/components/AIInsights";
import ExportButton from "@/components/ExportButton";
// import StatsCounter from "@/components/StatsCounter";
import ExportInstructions from "@/components/ExportInstructions";
import { ChatStats, generateSampleData, parseWhatsAppChat, formatDateRange } from "@/utils/chatParser";
import { Toaster } from "sonner";
import { useExpandableChart } from "@/hooks/useExpandableChart";

const Index = () => {
  const [chatData, setChatData] = useState<ChatStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usingSample, setUsingSample] = useState(false);
  const analysisSectionRef = useRef<HTMLDivElement>(null);

  const handleFileSelected = (content: string) => {
    setIsLoading(true);
    setUsingSample(false);
    
    // Use a small timeout to allow UI to update before starting parsing
    setTimeout(() => {
      try {
        const parsedData = parseWhatsAppChat(content);
        setChatData(parsedData);
      } catch (error) {
        console.error("Error parsing chat:", error);
        alert("There was an error parsing your chat file. Please make sure it's a valid WhatsApp export.");
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  const loadSampleData = () => {
    setIsLoading(true);
    setUsingSample(true);
    
    // Use a small timeout to allow UI to update before generating sample data
    setTimeout(() => {
      const sampleData = generateSampleData();
      setChatData(sampleData);
      setIsLoading(false);
    }, 100);
  };

  const resetData = () => {
    setChatData(null);
    setUsingSample(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamically load html2canvas only when needed
  useEffect(() => {
    if (chatData) {
      import('html2canvas').catch(err => 
        console.error('Error loading html2canvas:', err)
      );
    }
  }, [chatData]);

  // Calculate people count
  const peopleCount = chatData ? Object.keys(chatData.messageCount).length : 0;

  return (
    <ThemeProvider>
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Toaster position="top-center" />
      
      <main className="container px-4 py-8">
        {!chatData ? (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 animate-fade-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <h1 className="text-4xl font-bold mb-4">
                Chat<span className="text-primary">Lens</span>
              </h1>
              <p className="text-xl mb-6 text-muted-foreground">
                Analyze your WhatsApp conversations with beautiful visualizations
              </p>
            </div>
            
            <div className="animate-fade-up opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              <FileUpload onFileSelected={handleFileSelected} isLoading={isLoading} />
            </div>
            
            <div className="mt-6 text-center animate-fade-up opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              <Button variant="outline" onClick={loadSampleData} disabled={isLoading}>
                {isLoading ? "Loading..." : "Try with Sample Data"}
              </Button>
              <div className="mt-3">
                <ExportInstructions />
              </div>
            </div>
            
            <div className="mt-12 text-center animate-fade-up opacity-0" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
              <h2 className="text-2xl font-semibold mb-4">How it works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-accent/50 rounded-lg">
                  <div className="p-2 text-primary mb-3 inline-block">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-2">Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Export your WhatsApp chat and upload the .txt file
                  </p>
                </div>
                
                <div className="p-4 bg-accent/50 rounded-lg">
                  <div className="p-2 text-primary mb-3 inline-block">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-2">Analyze</h3>
                  <p className="text-sm text-muted-foreground">
                    ChatLens processes your conversation history
                  </p>
                </div>
                
                <div className="p-4 bg-accent/50 rounded-lg">
                  <div className="p-2 text-primary mb-3 inline-block">
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                  <h3 className="font-medium mb-2">Visualize</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore insights with beautiful interactive charts
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center text-sm text-muted-foreground animate-fade-up opacity-0" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
              <p className="mb-1">Your data stays private - all processing happens in your browser</p>
              <p>No chat data is ever sent to any server</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8" ref={analysisSectionRef}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-fade-in">
              <div>
                <h1 className="text-3xl font-bold mb-1">Chat Analysis</h1>
                <p className="text-muted-foreground">
                  {usingSample ? "Sample Data" : formatDateRange(chatData.firstDate, chatData.lastDate)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={resetData}>
                  Upload Another Chat
                </Button>
                <ExportButton targetRef={analysisSectionRef} filename="chat-analysis" />
              </div>
            </div>
            
            {/* <StatsCounter peopleCount={peopleCount} /> */}
            
            <nav className="py-2 mb-2 border-y overflow-x-auto whitespace-nowrap animate-fade-in">
              <div className="inline-flex gap-4">
                <button 
                  onClick={() => scrollToSection("summary")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Summary
                </button>
                <button 
                  onClick={() => scrollToSection("ai-insights")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  AI Insights
                </button>
                <button 
                  onClick={() => scrollToSection("messages-per-day")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Daily Activity
                </button>
                <button 
                  onClick={() => scrollToSection("interaction-patterns")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Interactions
                </button>
                <button 
                  onClick={() => scrollToSection("word-analysis")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Words & Emojis
                </button>
                <button 
                  onClick={() => scrollToSection("timeline-analysis")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Timeline
                </button>
                <button 
                  onClick={() => scrollToSection("message-length")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Message Length
                </button>
                <button 
                  onClick={() => scrollToSection("time-patterns")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Time Patterns
                </button>
                <button 
                  onClick={() => scrollToSection("sentiment-analysis")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Sentiment
                </button>
                <button 
                  onClick={() => scrollToSection("topic-analysis")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Topics
                </button>
                <button 
                  onClick={() => scrollToSection("topic-word-analysis")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Topic Words
                </button>
                <button 
                  onClick={() => scrollToSection("vocabulary-analysis")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Vocabulary
                </button>
                <button 
                  onClick={() => scrollToSection("link-analysis")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Links
                </button>
                <button 
                  onClick={() => scrollToSection("chat-health")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Chat Health
                </button>
                <button 
                  onClick={() => scrollToSection("personality")} 
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Personalities
                </button>
              </div>
            </nav>
            
            <section id="summary" className="analysis-section animate-fade-in">
              <h2 className="section-title">Chat Summary</h2>
              <SummaryCards data={chatData} />
            </section>
            
            <section id="ai-insights" className="analysis-section animate-fade-in">
              <h2 className="section-title">AI-Generated Insights</h2>
              <AIInsights data={chatData} />
            </section>
            
            <section id="messages-per-day" className="analysis-section animate-fade-in">
              <h2 className="section-title">Activity Analysis</h2>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <ExpandableMessagesPerDay data={chatData} />
                <ExpandableActiveHoursHeatmap data={chatData} />
              </div>
            </section>
            
            <section className="analysis-section animate-fade-in">
              <h2 className="section-title">Message Analysis</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableMessagesByPerson data={chatData} />
              </div>
            </section>
            
            <section id="interaction-patterns" className="analysis-section animate-fade-in">
              <h2 className="section-title">Interaction Analysis</h2>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <ExpandableInteractionPatterns data={chatData} />
                <ExpandableConversationStarter data={chatData} />
              </div>
            </section>
            
            <section id="timeline-analysis" className="analysis-section animate-fade-in">
              <h2 className="section-title">Conversation Timeline</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableConversationTimeline data={chatData} />
              </div>
            </section>
            
            <section id="message-length" className="analysis-section animate-fade-in">
              <h2 className="section-title">Message Length Analysis</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableMessageLengthAnalysis data={chatData} />
              </div>
            </section>
            
            <section id="time-patterns" className="analysis-section animate-fade-in">
              <h2 className="section-title">Message Time Patterns</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableMessageTimePatterns data={chatData} />
              </div>
            </section>
            
            <section id="word-analysis" className="analysis-section animate-fade-in">
              <h2 className="section-title">Word & Emoji Analysis</h2>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <ExpandableWordCloud data={chatData} />
                <ExpandableEmojiAnalysis data={chatData} />
              </div>
            </section>
            
            <section id="topic-analysis" className="analysis-section animate-fade-in">
              <h2 className="section-title">Topic Analysis</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableTopicAnalysis data={chatData} />
              </div>
            </section>
            
            <section id="topic-word-analysis" className="analysis-section animate-fade-in">
              <h2 className="section-title">Topic Word Analysis</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableDetailedTopicWordAnalysis data={chatData} />
              </div>
            </section>
            
            <section id="vocabulary-analysis" className="analysis-section animate-fade-in">
              <h2 className="section-title">Vocabulary Analysis</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableVocabularyRichness data={chatData} />
              </div>
            </section>
            
            <section id="sentiment-analysis" className="analysis-section animate-fade-in">
              <h2 className="section-title">Sentiment Analysis</h2>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <ExpandableSentimentAnalysis data={chatData} />
                <ExpandableSpecialWordsAnalysis data={chatData} />
              </div>
            </section>
            
            <section id="response-times" className="analysis-section animate-fade-in">
              <h2 className="section-title">Response Time Analysis</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableResponseTimeAnalysis data={chatData} />
              </div>
            </section>
            
            <section id="link-analysis" className="analysis-section animate-fade-in">
              <h2 className="section-title">Link Analysis</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableLinkAnalysis data={chatData} />
              </div>
            </section>
            
            <section id="chat-health" className="analysis-section animate-fade-in">
              <h2 className="section-title">Chat Health Score</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandableChatHealthScore data={chatData} />
              </div>
            </section>
            
            <section id="personality" className="analysis-section animate-fade-in">
              <h2 className="section-title">Chat Personality Analysis</h2>
              <div className="grid gap-6 grid-cols-1">
                <ExpandablePersonalityAnalysis data={chatData} />
              </div>
            </section>
          </div>
        )}
      </main>
      
      <footer className="border-t py-12 mt-16 bg-muted/40">
  <div className="container px-6 md:px-12 text-center md:text-left grid md:grid-cols-2 gap-8">
    
    {/* Left Side - Branding */}
    <div className="space-y-3">
      <h2 className="text-2xl font-bold text-primary">ChatLens</h2>
      <p className="text-muted-foreground max-w-md">
        Privacy-First WhatsApp Chat Analytics.  
        Simple. Secure. Insightful.
      </p>
      <p className="text-sm text-muted-foreground">
         ChatLens.
      </p>
    </div>

    {/* Right Side - Appreciation + CTA */}
    <div className="flex flex-col items-center md:items-end justify-center space-y-4">
      <p className="text-base text-muted-foreground">
        💡 Want to appreciate the developer or share feedback?
      </p>
      <a
        href="https://aryan-singh16.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-md"
      >
        Visit Portfolio 🚀
      </a>
    </div>

  </div>
</footer>

    </div>
    </ThemeProvider>
  );
};

// Create expandable versions of all chart components
const ExpandableMessagesPerDay = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Messages Per Day">
      <MessagesPerDay data={data} />
    </ChartWrapper>
  );
};

const ExpandableActiveHoursHeatmap = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Active Hours Heatmap">
      <ActiveHoursHeatmap data={data} />
    </ChartWrapper>
  );
};

const ExpandableMessagesByPerson = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Messages by Person">
      <MessagesByPerson data={data} />
    </ChartWrapper>
  );
};

const ExpandableWordCloud = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Word Cloud">
      <WordCloud data={data} />
    </ChartWrapper>
  );
};

const ExpandableEmojiAnalysis = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Emoji Analysis">
      <EmojiAnalysis data={data} />
    </ChartWrapper>
  );
};

const ExpandableSentimentAnalysis = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Sentiment Analysis">
      <SentimentAnalysis data={data} />
    </ChartWrapper>
  );
};

const ExpandableResponseTimeAnalysis = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Response Time Analysis">
      <ResponseTimeAnalysis data={data} />
    </ChartWrapper>
  );
};

const ExpandableSpecialWordsAnalysis = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Special Words Analysis">
      <SpecialWordsAnalysis data={data} />
    </ChartWrapper>
  );
};

const ExpandableConversationTimeline = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Conversation Timeline">
      <ConversationTimeline data={data} />
    </ChartWrapper>
  );
};

const ExpandableMessageLengthAnalysis = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Message Length Analysis">
      <MessageLengthAnalysis data={data} />
    </ChartWrapper>
  );
};

const ExpandableMessageTimePatterns = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Message Time Patterns">
      <MessageTimePatterns data={data} />
    </ChartWrapper>
  );
};

const ExpandableInteractionPatterns = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Interaction Patterns">
      <InteractionPatterns data={data} />
    </ChartWrapper>
  );
};

const ExpandableConversationStarter = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Conversation Starter Analysis">
      <ConversationStarter data={data} />
    </ChartWrapper>
  );
};

const ExpandableVocabularyRichness = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Vocabulary Richness">
      <VocabularyRichness data={data} />
    </ChartWrapper>
  );
};

const ExpandableTopicAnalysis = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Topic Analysis">
      <TopicAnalysis data={data} />
    </ChartWrapper>
  );
};

const ExpandableDetailedTopicWordAnalysis = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Detailed Topic Word Analysis">
      <DetailedTopicWordAnalysis data={data} />
    </ChartWrapper>
  );
};

// Add new expandable components
const ExpandableLinkAnalysis = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Link Analysis">
      <LinkAnalysis data={data} />
    </ChartWrapper>
  );
};

const ExpandableChatHealthScore = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Chat Health Score">
      <ChatHealthScore data={data} />
    </ChartWrapper>
  );
};

const ExpandablePersonalityAnalysis = ({ data }: { data: ChatStats }) => {
  const { ChartWrapper } = useExpandableChart();
  return (
    <ChartWrapper title="Personality Analysis">
      <PersonalityAnalysis data={data} />
    </ChartWrapper>
  );
};

export default Index;
