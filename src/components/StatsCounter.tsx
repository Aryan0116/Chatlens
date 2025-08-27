
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Laugh, Pizza } from "lucide-react";

interface StatsCounterProps {
  peopleCount: number;
}

const StatsCounter = ({ peopleCount }: StatsCounterProps) => {
  const [visits, setVisits] = useState(0);
  const [funnyFact, setFunnyFact] = useState("");
  
  useEffect(() => {
    // Get current visits from local storage or start at 1
    const currentVisits = parseInt(localStorage.getItem("chatLensVisits") || "0");
    const newVisits = currentVisits + 1;
    
    // Save to local storage
    localStorage.setItem("chatLensVisits", newVisits.toString());
    setVisits(newVisits);
    
    // Set a funny fact
    const funnyFacts = [
      "You've analyzed enough messages to fill a small library",
      "Your dedication to chat analysis is truly impressive",
      "You could probably write a PhD on WhatsApp dynamics by now",
      "If chat analysis were a sport, you'd be Olympic-level",
      "You're in the top 0.001% of WhatsApp analyzers worldwide",
      "You've uncovered more chat secrets than most detectives",
      "A Nobel Prize in 'Conversational Analytics' awaits you",
      "Your WhatsApp knowledge could fill several encyclopedias",
      "You're basically the Sherlock Holmes of chat analysis",
      "This is more attention than most chats ever receive"
    ];
    
    setFunnyFact(funnyFacts[newVisits % funnyFacts.length]);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Page Visits</p>
            <p className="text-2xl font-bold">{visits}</p>
            <p className="text-xs text-muted-foreground mt-1 italic">{funnyFact}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Laugh className="text-primary" size={24} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">People Analyzed</p>
            <p className="text-2xl font-bold">{peopleCount}</p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              {peopleCount === 0 ? "No one yet... 👻" : 
               peopleCount === 1 ? "Flying solo! 🧑‍✈️" : 
               peopleCount === 2 ? "Dynamic duo! 🦸‍♂️🦸‍♀️" : 
               peopleCount <= 4 ? "Small but mighty squad! 🤟" : 
               "Full party mode! 🎉"}
            </p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Pizza className="text-primary" size={24} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCounter;
