
import emojiRegex from 'emoji-regex';
import Sentiment from 'sentiment';

// Regex patterns for parsing WhatsApp messages
const DATE_PATTERN = /\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),? (\d{1,2}:\d{2}(?::\d{2})?(?: [AP]M)?)\]?/;
const SENDER_PATTERN = /[^\:]+\: /;

// Stopwords for word cloud
const STOPWORDS = new Set([
  // English stopwords
  "the","media","omitted","to", "and", "a", "in", "it", "is", "i", "that", "had", "on", "for", "were", "was", 
  "they", "but", "be", "this", "have", "from", "or", "one", "by", "word", "you", "me", 
  "of", "so", "what", "at", "he", "she", "we", "do", "did", "done", "their", "there", "with",
  "up", "my", "its", "his", "her", "our", "your", "has", "him", "them", "these", "those", "am",
  "are", "if", "then", "than", "been", "who", "will", "more", "no", "when", "also", "would",
  "about", "can", "said", "just", "should", "could", "an", "may", "any", "like", "now", "some",
  "such", "only", "other", "how", "well", "even", "want", "because", "never", "too", "most", "us",

  // Informal English
  "haha", "lol", "yeah", "ok", "okay", "yes", "no", "not", "yo", "bro", "hey", "hi", "hello", "hmm", "uhh",
  "hahaha", "huh", "hmmm", "yup", "nope", "haina", "hm", "hmm", "k", "kk", "oh", "ohh", "uh", "umm", "oops",

  // Contractions and variations
  "don't", "don", "didn't", "didn", "doesn't", "doesn", "isn't", "isn", "aren't", "aren", "can't", "cant", 
  "cannot", "won't", "wont", "wouldn't", "wouldnt", "shouldn't", "shouldnt", "couldn't", "couldnt", 
  "mustn't", "mustnt", "shan't", "shant", "let's", "lets", "that's", "thats", "who's", "whos", "what's", 
  "whats", "here's", "heres", "there's", "theres", "when's", "whens", "why's", "whys", "how's", "hows",

  // Hinglish / Hindi common fillers
  "ha", "haan", "nahi", "nhi", "kyu", "kya", "kaise", "ka", "ki", "ko", "se", "mein", "mera", "meri", 
  "mere", "tum", "tera", "teri", "tere", "sab", "ab", "bas", "bhai", "bhaiya", "yaar", "arey", "arre", 
  "acha", "accha", "theek", "thik", "okey", "koi", "bhi", "chal", "chalo", "lo", "dekh", "le", "ho", "hoon",
  "gaya", "gayi", "ho gaya", "kar", "karo", "kiya", "hua", "hota", "hoti", "hoye", "mil", "milna", "jaa", 
  "jao", "gaye", "raha", "rahi", "rha", "rhi", "re", "reh", "toh", "fir", "phir", "waise", "lekin", "par",
  "kyunki", "kyon", "mat", "chahiye", "hona", "nahi", "nahiin", "bohot", "bahut", "thoda", "zyaada", "zyada",
  "mast", "sahi", "bilkul", "waah", "wah", "ya", "to", "tak", "ke", "na", "ky", "achha", "acha", "kuch",

  // Slang & casual
  "omg", "uff", "arre", "re", "oho", "are", "lolz", "hehe", "bcz", "lmao", "bruh", "dude", "man", "madam",
  "sir", "mam", "pls", "plz", "please", "thank", "thanks", "ty", "welcome", "bye", "gn", "gm", "night", 
  "morning", "evening", "afternoon"
]);


// Affectionate words
const AFFECTIONATE_WORDS = new Set([
  // English affectionate words
  "love", "loved", "loving", "lover",
  "miss", "missed", "missing",
  "kiss", "kisses", "kissed", "kissing",
  "hug", "hugs", "hugged", "hugging",
  "baby", "babe", "sweetheart", "darling",
  "honey", "dear", "sweetie",
  "heart", "hearts",
  "adorable", "adore", "adoring",
  "cherish", "cherished", "cherishing",
  "precious", "beautiful", "handsome",
  "lovely", "sweet", "sweetest",
  "amazing", "awesome", "wonderful",
  "xoxo", "😘", "😍", "❤️", "💕", "💗", "💓", "💖", "💘", "💝", "💞", "💟", "❣️", "🥰",

  // Common Indian affectionate terms
  "jaan", "jaanu", "shona", "shonu", "sona", "babyji", "meri jaan", "meri shona",
  "cutie", "cutu", "cutiepie", "janu", "jaaneman", "loveu", "luv", "luv u", "miss u",
  "missyou", "loveyou", "iloveyou", "ilu", "ily", "pyar", "pyaar", "pyaari", "pyari",
  "mylove", "meri jaan", "meri life", "meri duniya", "meri zindagi", "zindagi", 
  "my jaan", "meri cutie", "sweetu", "jaanlewa", "laddu", "motu", "golu", "chotu",

  // Hinglish romantic phrases
  "tum meri ho", "tu hi re", "main tera", "mera pyaar", "tera pyaar", "tere bina",
  "tu hi meri zindagi", "meri duniya", "meri jaan hai tu", "tu meri jaan hai",
  "teri smile", "teri yaad", "teri aankhon", "tere bina", "tumhe dekh ke",
  "tere liye kuch bhi", "meri kasam", "dil se", "dil mera", "mera dil", "mera sab kuch",

  // Slang / stylized texting
  "luv", "luvya", "muah", "mwah", "mwuaa", "muaaah", "muuuaaah", "hugzz", "kissu", "kissie",
  "hugs n kisses", "xoxoxo", "cutu", "chu", "chooo", "chummeshwari", "jhappi", "tight hug",

  // Emoji additions
  "🥺", "🤗", "😘😘", "😍😍", "❤️❤️", "💋", "💑", "👩‍❤️‍👨", "👨‍❤️‍👨", "👩‍❤️‍👩", "💏", "💌", "🌹", "🌺", "🌸"
]);


// Profanity words (basic set, can be expanded)
const PROFANITY_WORDS = new Set([
  // Common English profanity
  "fuck", "shit", "damn", "bitch", "crap", "ass", "asshole", "bastard",
  "bullshit", "cunt", "dick", "douche", "douchebag", "fag", "faggot",
  "fucker", "fucking", "motherfucker", "piss", "pussy", "slut",
  "whore", "jerk", "cock", "tit", "tits", "boobs", "boob", "sex", "horny", 
  "nude", "nudes", "naked", "suck", "blowjob", "bj", "handjob", "hentai",
  "porn", "porno", "sexy", "dildo", "cum", "milf", "bdsm", "69", "threesome",

  // Commonly used Hinglish/Hindi slang typed in Latin script
  "lund", "chutiya", "chutia", "chut", "chutiyapa", "choda", "chod", "chudai",
  "gaand", "gand", "bhosdi", "bhosdike", "bhosdika", "madarchod", "behenchod",
  "mc", "bc", "randi", "haraami", "kutti", "kutte", "kamina", "kamini",
  "chikni", "maal", "rakhail", "tharak", "tharki", "nanga", "nangi", "tharakpan",
  "gaand mara", "chodna", "chod do", "teri maa", "teri behen",

  // Sexting-specific and suggestive Hindi-English combo
  "sext", "sexting", "hot chat", "sexy pic", "send nudes", "video call sexy", 
  "nangi photo", "teri photo sexy", "nangi", "nanga", "teri body", "horny af",
  "kamaal ki body", "sambhog", "ling", "yoni", "sharirik", "vasna", "kamvasna",

  // Coded / obfuscated / short forms used commonly
  "b*c", "m*c", "bsdk", "mcbc", "bkl", "loda", "ch*tiya", "ch*d", "g*d", "g***d",
  "b***i", "bh***i", "b***ch", "p***y", "d***", "f***", "s***", "a**", "c***"
]);

export interface Message {
  date: Date;
  time: string;
  sender: string;
  content: string;
  emojis: string[];
  words: string[];
  affectionateWords: string[];
  profanityWords: string[];
  sentimentScore: number;
}

export interface ChatStats {
  messages: Message[];
  messageCount: { [sender: string]: number };
  wordCount: { [sender: string]: number };
  topWords: { [sender: string]: { [word: string]: number } };
  topEmojis: { [sender: string]: { [emoji: string]: number } };
  sentimentScores: { [sender: string]: number[] };
  avgSentimentScores: { [sender: string]: number };
  messagesByDay: { [date: string]: number };
  messagesByHour: { [hour: number]: number };
  averageResponseTime: { [sender: string]: number };
  responseTimeHistory: { date: string, sender: string, time: number }[];
  affectionateWordsCount: { [sender: string]: number };
  profanityCount: { [sender: string]: number };
  firstDate: Date;
  lastDate: Date;
  conversationStarters: { [sender: string]: number };
  vocabularyRichness: { [sender: string]: number };
  aiInsights: string[];
  messageLengthOverTime: { date: string, sender: string, length: number }[];
  topTopics: { topic: string, count: number }[];
}

// Simple topic detection using keyword clustering
const TOPIC_KEYWORDS: { [topic: string]: string[] } = {
  "Work": [
    "work", "job", "project", "meeting", "deadline", "boss", "client", "office", "email", "business",
    "kaam", "naukri", "rozgaar", "target", "promotion", "office gaya", "office aaya", "workload"
  ],

  "Family": [
    "family", "mom", "dad", "mother", "father", "bhai", "behen", "bhaiya", "didi", "son", "daughter",
    "grandma", "grandpa", "papa", "maa", "mommy", "daddy", "ghar wale", "ghar par"
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

  "Plans": [
    "plan", "meet", "tomorrow", "weekend", "tonight", "later", "schedule", "soon", "next", "date",
    "kal milte", "aaj mil", "shaam ko", "plan banate", "let's go", "movie chale", "nightout", "dinner plan"
  ],

  "Shopping": [
    "buy", "shop", "store", "price", "cost", "purchase", "sale", "bought", "spending", "ordered",
    "shopping", "cart", "amazon", "flipkart", "order kiya", "online manga", "bill", "checkout", "discount", "EMI"
  ],

  "Relationships": [
    "love", "bf", "gf", "boyfriend", "girlfriend", "breakup", "patchup", "proposal", "date", "crush",
    "pyar", "ishq", "mohabbat", "meri wali", "uska bf", "meri gf", "feeling", "ex", "emotional", "soulmate"
  ],

  "Social Media": [
    "instagram", "whatsapp", "facebook", "snapchat", "twitter", "threads", "reels", "story", "post", "dp",
    "followers", "like", "comment", "viral", "status", "online", "msg", "ping", "bio", "meme"
  ],

  "Finance": [
    "money", "salary", "payment", "upi", "bank", "transaction", "wallet", "loan", "emi", "debit",
    "credit", "paisa", "udhaar", "paytm", "gpay", "savings", "salary aayi", "broke", "income", "bonus"
  ],

  "Education": [
    "study", "homework", "exam", "class", "school", "college", "teacher", "test", "marks", "assignment",
    "padhaai", "lecture", "project", "internship", "bunk", "online class", "attendance", "fail", "pass", "subject"
  ],

  "Events & Festivals": [
    "birthday", "party", "wedding", "shaadi", "anniversary", "festival", "diwali", "eid", "holi", "navratri",
    "celebration", "cake", "gift", "invite", "baarat", "mehndi", "dance", "function", "new year", "event"
  ],

  "Emotions": [
    "happy", "sad", "angry", "upset", "excited", "tension", "depressed", "cry", "laugh", "mood",
    "feeling", "emotional", "gussa", "khush", "dukhi", "stress", "relaxed", "shocked", "love you", "missing you"
  ],
  "Politics": [
    "modi", "rahul", "bjp", "congress", "election", "vote", "govt", "government", "politics", "leader",
    "pradhanmantri", "mantri", "rajneeti", "pm", "cm", "loksabha", "vidhansabha", "mla", "mp", "aap"
  ],

  "Cricket": [
    "cricket", "match", "ipl", "t20", "odi", "wc", "worldcup", "team india", "kohli", "rohit",
    "wicket", "batting", "bowling", "six", "run", "out", "dhoni", "rcb", "csk", "mumbai indians"
  ],

  "Bollywood": [
    "bollywood", "movie", "actor", "actress", "film", "release", "trailer", "song", "hero", "heroine",
    "salman", "srk", "shahrukh", "deepika", "alia", "ranbir", "box office", "filmy", "masala movie", "dialogue"
  ],

  "Finance & Crypto": [
    "crypto", "bitcoin", "stock", "market", "share", "mutual fund", "nifty", "sensex", "investment", "trading",
    "paisay", "bazar", "crypto mein invest", "crypto gira", "ipo", "wallet", "portfolio", "demat", "nivesh"
  ],

  "Religion & Spirituality": [
    "mandir", "temple", "bhagwan", "god", "prayer", "puja", "aarti", "havan", "namaz", "masjid",
    "church", "guru", "shlok", "om", "allah", "jesus", "krishna", "shiv", "ganesh", "diya", "ram"
  ],

  "Weather & Nature": [
    "weather", "rain", "summer", "monsoon", "heat", "cold", "fog", "barish", "garmi", "thand",
    "climate", "pollution", "nature", "storm", "sun", "cloud", "humidity", "flood", "drought", "smog"
  ],

  "Trending & Memes": [
    "meme", "viral", "reels", "trending", "funny", "cringe", "roast", "burn", "clip", "laugh",
    "cringe post", "ye kya tha", "savage", "legendary", "sasta", "reel trend", "influencer", "omg", "relatable"
  ],

  "Weddings & Shaadi": [
    "shaadi", "wedding", "marriage", "engagement", "rishta", "bride", "groom", "baraat", "mehendi", "haldi",
    "sangeet", "shaadi ka card", "invite", "married", "shaadi pakki", "kundali", "pandit", "shaadi kab hai"
  ],

  "College Life": [
    "college", "campus", "hostel", "exam", "assignment", "fresher", "ragging", "semester", "unit test", "practical",
    "attendance", "bunk", "professor", "friend group", "canteen", "placement", "intern", "engineering", "btech", "mba"
  ],

  "Friendship & Bonding": [
    "yaar", "dost", "bestie", "friend", "buddy", "gang", "group chat", "add me", "bro", "bhai",
    "sis", "yaari", "yaarana", "masti", "lifeline", "school friends", "college buddy", "gang hangout"
  ],

  "Current Affairs & News": [
    "breaking news", "headline", "trending news", "case", "court", "crime", "murder", "accident", "incident", "scam",
    "andhkaar", "drama", "media", "interview", "arrest", "debate", "tv news", "live news", "viral video"
  ],

  "Social Issues": [
    "corruption", "unemployment", "education", "poverty", "farmer", "strike", "reservation", "protest", "justice", "equality",
    "rights", "crime", "rape", "women safety", "dalit", "sc/st", "youth", "student protest", "fees", "caa nrc"
  ],
  "Sexting & Sexual": [
    "sex","sexy", "nude", "nudes", "boobs", "breasts", "ass", "penis", "vagina", "dick", "pussy",
    "horny", "fuck", "fucking", "sucking", "69", "condom", "xxx", "porn", "adult", "sexy",
    "ling", "yoni", "sambhog", "sambandh", "chikna", "chikni", "tharak", "nangi", "maal", "garmi chadhi",
    "mujhe chahiye", "send pic", "nangi photo", "show me", "baby i’m hard", "video call karo", "bistar mein aa jao"
  ],

  "Abusive Language (Gālī)": [
    "bhenchod", "bhosdike", "madarchod", "gandu", "chutiya", "kutte", "harami", "randi", "chod", "lund",
    "chodu", "gaand", "tatti", "mc", "bc", "chodna", "chudai", "chod diya", "gaand mara", "gand fat gayi",
    "jhant", "jhatu", "suar", "behen ke laude", "randi ka bacha", "bkl", "bkl saala", "chakka", "kutta sala"
  ],

  "Suggestive Slang & Hinglish Dirty Talk": [
     "maal", "patane", "setting", "tharki", "flirt", "line maarna", "dirty talk", "romance", "lust",
    "raat bhar", "bedroom", "kamasutra", "makeout", "thighs", "cleavage", "hot photo", "send hot", "dirty pic",
     "sexy ladki", "naughty", "chat me aaja", "voice message bhej", "kya pehna hai", "underwear", "bra"
  ]
};

export function parseWhatsAppChat(chatText: string): ChatStats {
  const lines = chatText.split("\n");
  const messages: Message[] = [];
  const sentiment = new Sentiment();
  const regex = emojiRegex();

  const topicCounts: { [topic: string]: number } = {};
  const CONVERSATION_GAP_MS = 12 * 60 * 60 * 1000; // 12 hours
  let lastMessageTime = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") continue;

    // Skip media messages
    if (/media omitted|image omitted|video omitted/i.test(line)) continue;

    // Extract date and time
    const dateMatch = line.match(DATE_PATTERN);
    if (!dateMatch) {
      // Continuation of previous message
      if (messages.length > 0) {
        messages[messages.length - 1].content += "\n" + line;
      }
      continue;
    }

    const dateStr = dateMatch[1];
    const timeStr = dateMatch[2];
    const remainder = line.substring(dateMatch[0].length).trim();

    // Extract sender name
    const senderMatch = remainder.match(SENDER_PATTERN);
    if (!senderMatch) continue; // Skip system messages or malformed lines

    const sender = senderMatch[0].slice(0, -2).trim();
    const content = remainder.substring(senderMatch[0].length);

    // Extract emojis
    const emojis = content.match(regex) || [];

    // Extract words (lowercase, no punctuation)
    const words = content
      .toLowerCase()
      .replace(/\b(?:\+91[-\s]?|0)?[6-9]\d{9}\b|(?:\(?\d{3}\)?[-\s]?)?\d{3}[-\s]?\d{4}/g, ' ') // Remove phone numbers
      .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Remove non-letter/number characters
      .split(/\s+/)
      .filter(word => word.length > 1 && !STOPWORDS.has(word));

    // Extract affectionate words and profanity
    const affectionateWords = words.filter(word => AFFECTIONATE_WORDS.has(word));
    const profanityWords = words.filter(word => PROFANITY_WORDS.has(word));

    // Get sentiment score
    const sentimentScore = sentiment.analyze(content).score;

    // Parse date parts (DD/MM/YYYY or DD/MM/YY)
    const dateParts = dateStr.split('/');
    let day = parseInt(dateParts[0]);
    let month = parseInt(dateParts[1]) - 1; // Months are 0-based in JS
    let year = parseInt(dateParts[2]);
    if (year < 100) year += 2000;

    const messageDate = new Date(year, month, day);
    const messageTime = messageDate.getTime();

    // Create message object
    const message: Message = {
      date: messageDate,
      time: timeStr,
      sender,
      content,
      emojis,
      words,
      affectionateWords,
      profanityWords,
      sentimentScore
    };

    messages.push(message);
  }

  // Compile statistics
  const result: ChatStats = {
    messages,
    messageCount: {},
    wordCount: {},
    topWords: {},
    topEmojis: {},
    sentimentScores: {},
    avgSentimentScores: {},
    messagesByDay: {},
    messagesByHour: {},
    averageResponseTime: {},
    responseTimeHistory: [],
    affectionateWordsCount: {},
    profanityCount: {},
    firstDate: messages.length > 0 ? messages[0].date : new Date(),
    lastDate: messages.length > 0 ? messages[0].date : new Date(),
    conversationStarters: {},
    vocabularyRichness: {},
    aiInsights: [],
    messageLengthOverTime: [],
    topTopics: []
  };

  // Process messages to compute statistics
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const { sender, date, words, emojis, affectionateWords, profanityWords, sentimentScore, content } = message;
    const messageTime = date.getTime();
    const hour = parseInt(message.time.split(':')[0]);

    // Update first and last date
    if (date < result.firstDate) result.firstDate = new Date(date);
    if (date > result.lastDate) result.lastDate = new Date(date);

    // Update message count per sender
    result.messageCount[sender] = (result.messageCount[sender] || 0) + 1;

    // Update word count per sender
    result.wordCount[sender] = (result.wordCount[sender] || 0) + words.length;

    // Track message length over time
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    result.messageLengthOverTime.push({
      date: dateKey,
      sender,
      length: content.length
    });

    // Update top words per sender
    if (!result.topWords[sender]) result.topWords[sender] = {};
    words.forEach(word => {
      result.topWords[sender][word] = (result.topWords[sender][word] || 0) + 1;
    });

    // Update top emojis per sender
    if (!result.topEmojis[sender]) result.topEmojis[sender] = {};
    emojis.forEach(emoji => {
      result.topEmojis[sender][emoji] = (result.topEmojis[sender][emoji] || 0) + 1;
    });

    // Update sentiment scores
    if (!result.sentimentScores[sender]) result.sentimentScores[sender] = [];
    result.sentimentScores[sender].push(sentimentScore);

    // Update messages by day
    result.messagesByDay[dateKey] = (result.messagesByDay[dateKey] || 0) + 1;

    // Update messages by hour
    result.messagesByHour[hour] = (result.messagesByHour[hour] || 0) + 1;

    // Detect conversation starters
    if (i === 0 || (messageTime - lastMessageTime) > CONVERSATION_GAP_MS) {
      result.conversationStarters[sender] = (result.conversationStarters[sender] || 0) + 1;
    }
    lastMessageTime = messageTime;

    // Calculate response time (if not the first message)
    if (i > 0) {
  const prevMessage = messages[i - 1];
  if (prevMessage.sender !== sender) {
    const responseTime = messageTime - new Date(prevMessage.date).getTime() - (parseInt(prevMessage.time.split(':')[0]) * 3600000 + parseInt(prevMessage.time.split(':')[1]) * 60000);
    // Only count reasonably quick responses (less than 3 hours)
    if (responseTime > 0 && responseTime < 3 * 60 * 60 * 1000) {
      // Track response time history
      result.responseTimeHistory.push({
        date: dateKey,
        sender,
        time: responseTime
      });
      
      if (!result.averageResponseTime[sender]) {
        result.averageResponseTime[sender] = responseTime;
      } else {
        // Running average
        const prevCount = result.messageCount[sender] - 1;
        result.averageResponseTime[sender] = 
          (result.averageResponseTime[sender] * prevCount + responseTime) / result.messageCount[sender];
      }
    }
  }
}

    // Update affectionate words count
    result.affectionateWordsCount[sender] = (result.affectionateWordsCount[sender] || 0) + affectionateWords.length;

    // Update profanity count
    result.profanityCount[sender] = (result.profanityCount[sender] || 0) + profanityWords.length;

    // Topic detection
    const matchedTopics = new Set<string>();
    words.forEach(word => {
      for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.includes(word)) {
          matchedTopics.add(topic);
        }
      }
    });
    matchedTopics.forEach(topic => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  }

  // Calculate average sentiment scores
  for (const sender in result.sentimentScores) {
    const scores = result.sentimentScores[sender];
    result.avgSentimentScores[sender] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Calculate vocabulary richness (unique words / total words ratio)
  for (const sender in result.topWords) {
    const uniqueWords = Object.keys(result.topWords[sender]).length;
    const totalWords = result.wordCount[sender] || 1; // Avoid division by zero
    result.vocabularyRichness[sender] = uniqueWords / totalWords;
  }

  // Generate top topics
  result.topTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Generate AI insights
  generateAIInsights(result);

  return result;
}


function generateAIInsights(data: ChatStats): void {
  const insights: string[] = [];
  
  // BASIC METRICS AND PATTERNS
  
  // Most active person
  const mostActivePerson = Object.entries(data.messageCount)
    .sort((a, b) => b[1] - a[1])[0];
  if (mostActivePerson) {
    const totalMessages = Object.values(data.messageCount).reduce((sum, count) => sum + count, 0);
    const percentage = ((mostActivePerson[1] / totalMessages) * 100).toFixed(1);
    insights.push(`${mostActivePerson[0]} is the most active participant, sending ${mostActivePerson[1]} messages (${percentage}% of all messages).`);
  }
  
  // Message frequency analysis
  if (data.messages.length > 10) {
    const daysDifference = Math.ceil((data.lastDate.getTime() - data.firstDate.getTime()) / (1000 * 60 * 60 * 24));
    const messagesPerDay = data.messages.length / (daysDifference || 1); // Avoid division by zero
    
    if (daysDifference > 30) {
      const monthCount = daysDifference / 30;
      insights.push(`Over ${monthCount.toFixed(1)} months, an average of ${messagesPerDay.toFixed(1)} messages were exchanged daily.`);
    } else {
      insights.push(`Over ${daysDifference} days, an average of ${messagesPerDay.toFixed(1)} messages were exchanged daily.`);
    }
  }
  
  // Response time analysis
  const responseTimes = Object.entries(data.averageResponseTime);
  if (responseTimes.length > 0) {
    const quickestResponder = responseTimes.sort((a, b) => a[1] - b[1])[0];
    const slowestResponder = responseTimes.sort((a, b) => b[1] - a[1])[0];
    
    if (quickestResponder) {
      insights.push(`${quickestResponder[0]} responds the quickest, with an average response time of ${msToReadableTime(quickestResponder[1])}.`);
    }
    
    if (slowestResponder && slowestResponder[0] !== quickestResponder[0]) {
      insights.push(`${slowestResponder[0]} takes longer to respond, averaging ${msToReadableTime(slowestResponder[1])}.`);
    }
    
    // Response time trends
    if (data.responseTimeHistory.length > 10) {
      // Group response times by month
      const monthlyResponseTimes: {[key: string]: {[sender: string]: number[]}} = {};
      
      data.responseTimeHistory.forEach(item => {
        const month = item.date.substring(0, 7); // YYYY-MM
        if (!monthlyResponseTimes[month]) monthlyResponseTimes[month] = {};
        if (!monthlyResponseTimes[month][item.sender]) monthlyResponseTimes[month][item.sender] = [];
        monthlyResponseTimes[month][item.sender].push(item.time);
      });
      
      // Calculate monthly averages
      const senderTrends: {[sender: string]: {improving: boolean, percentage: number}} = {};
      
      Object.keys(data.averageResponseTime).forEach(sender => {
        const months = Object.keys(monthlyResponseTimes).sort();
        if (months.length > 1) {
          const firstMonthAvg = monthlyResponseTimes[months[0]][sender]?.reduce((a, b) => a + b, 0) / 
            (monthlyResponseTimes[months[0]][sender]?.length || 1);
          const lastMonthAvg = monthlyResponseTimes[months[months.length - 1]][sender]?.reduce((a, b) => a + b, 0) / 
            (monthlyResponseTimes[months[months.length - 1]][sender]?.length || 1);
          
          if (firstMonthAvg && lastMonthAvg) {
            const improving = lastMonthAvg < firstMonthAvg;
            const percentage = Math.abs(((lastMonthAvg - firstMonthAvg) / firstMonthAvg) * 100);
            
            if (percentage > 15) { // Only report significant changes
              senderTrends[sender] = { improving, percentage };
            }
          }
        }
      });
      
      // Report response time trends
      Object.entries(senderTrends).forEach(([sender, { improving, percentage }]) => {
        if (improving) {
          insights.push(`${sender}'s response time has improved by ${percentage.toFixed(0)}% since the conversation began.`);
        } else {
          insights.push(`${sender}'s response time has slowed by ${percentage.toFixed(0)}% since the conversation began.`);
        }
      });
    }
  }
  
  // CONVERSATION DYNAMICS
  
  // Conversation starter analysis
  const conversationStarters = Object.entries(data.conversationStarters);
  if (conversationStarters.length > 0) {
    const mainStarter = conversationStarters.sort((a, b) => b[1] - a[1])[0];
    const totalStarts = conversationStarters.reduce((sum, [_, count]) => sum + count, 0);
    
    if (mainStarter) {
      const percentage = ((mainStarter[1] / totalStarts) * 100).toFixed(1);
      insights.push(`${mainStarter[0]} initiates most conversations (${mainStarter[1]} times, ${percentage}% of all conversation starts).`);
    }
    
    // Analyze who starts conversations after long breaks
    const LONG_BREAK = 24 * 60 * 60 * 1000; // 24 hours
    const longBreakStarters: {[sender: string]: number} = {};
    
    let lastMessageTime = data.messages[0].date.getTime();
    for (let i = 1; i < data.messages.length; i++) {
      const currentTime = data.messages[i].date.getTime();
      if (currentTime - lastMessageTime > LONG_BREAK) {
        const sender = data.messages[i].sender;
        longBreakStarters[sender] = (longBreakStarters[sender] || 0) + 1;
      }
      lastMessageTime = currentTime;
    }
    
    const mainLongBreakStarter = Object.entries(longBreakStarters)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (mainLongBreakStarter && mainLongBreakStarter[1] > 3) {
      insights.push(`${mainLongBreakStarter[0]} often reconnects after long breaks (${mainLongBreakStarter[1]} times after 24+ hour gaps).`);
    }
  }
  
  // SENTIMENT AND EMOTIONAL ANALYSIS
  
  // Sentiment analysis
  const sentimentScores = Object.entries(data.avgSentimentScores);
  if (sentimentScores.length > 0) {
    const happiest = sentimentScores.sort((a, b) => b[1] - a[1])[0];
    const leastHappy = sentimentScores.sort((a, b) => a[1] - b[1])[0];
    
    if (happiest && happiest[1] > 0.2) {
      insights.push(`${happiest[0]} uses more positive language overall, with sentiment score of ${happiest[1].toFixed(2)}.`);
    } else if (happiest) {
      insights.push(`The conversation has a neutral to slightly ${happiest[1] > 0 ? 'positive' : 'negative'} tone overall.`);
    }
    
    if (leastHappy && leastHappy[0] !== happiest[0] && Math.abs(leastHappy[1]) > 0.2) {
      const tone = leastHappy[1] < 0 ? 'negative' : 'less positive';
      insights.push(`${leastHappy[0]} tends to use more ${tone} language, with sentiment score of ${leastHappy[1].toFixed(2)}.`);
    }
    
    // Sentiment over time analysis
    if (data.messages.length > 20) {
      // Group messages by month
      const monthlySentiment: {[key: string]: {[sender: string]: number[]}} = {};
      
      data.messages.forEach(message => {
        const month = `${message.date.getFullYear()}-${(message.date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthlySentiment[month]) monthlySentiment[month] = {};
        if (!monthlySentiment[month][message.sender]) monthlySentiment[month][message.sender] = [];
        monthlySentiment[month][message.sender].push(message.sentimentScore);
      });
      
      // Calculate monthly average sentiment
      const monthlyAvgSentiment: {[key: string]: {[sender: string]: number}} = {};
      
      Object.entries(monthlySentiment).forEach(([month, senders]) => {
        monthlyAvgSentiment[month] = {};
        Object.entries(senders).forEach(([sender, scores]) => {
          monthlyAvgSentiment[month][sender] = scores.reduce((a, b) => a + b, 0) / scores.length;
        });
      });
      
      // Find significant sentiment changes
      const months = Object.keys(monthlyAvgSentiment).sort();
      if (months.length > 1) {
        Object.keys(data.avgSentimentScores).forEach(sender => {
          let minSentiment = Infinity;
          let maxSentiment = -Infinity;
          let minMonth = '';
          let maxMonth = '';
          
          months.forEach(month => {
            if (monthlyAvgSentiment[month][sender] !== undefined) {
              if (monthlyAvgSentiment[month][sender] < minSentiment) {
                minSentiment = monthlyAvgSentiment[month][sender];
                minMonth = month;
              }
              if (monthlyAvgSentiment[month][sender] > maxSentiment) {
                maxSentiment = monthlyAvgSentiment[month][sender];
                maxMonth = month;
              }
            }
          });
          
          if (maxSentiment - minSentiment > 0.5) {
            const sentimentImproved = months.indexOf(maxMonth) > months.indexOf(minMonth);
            
            if (sentimentImproved) {
              insights.push(`${sender}'s messages have become more positive over time, peaking in ${formatMonthYear(maxMonth)}.`);
            } else {
              insights.push(`${sender}'s messages were most positive in ${formatMonthYear(maxMonth)} and least positive in ${formatMonthYear(minMonth)}.`);
            }
          }
        });
      }
    }
  }
  
  // Emotional expression analysis
  const affectionateUsers = Object.entries(data.affectionateWordsCount);
  if (affectionateUsers.length > 0) {
    const mostAffectionate = affectionateUsers.sort((a, b) => b[1] - a[1])[0];
    
    if (mostAffectionate && mostAffectionate[1] > 5) {
      const affectionRatio = mostAffectionate[1] / (data.wordCount[mostAffectionate[0]] || 1);
      insights.push(`${mostAffectionate[0]} expresses affection more frequently, using ${mostAffectionate[1]} affectionate terms (${(affectionRatio * 100).toFixed(2)}% of their words).`);
    }
  }
  
  // Profanity analysis
  const profanityUsers = Object.entries(data.profanityCount);
  if (profanityUsers.length > 0) {
    const mostProfane = profanityUsers.sort((a, b) => b[1] - a[1])[0];
    
    if (mostProfane && mostProfane[1] > 5) {
      const profanityRatio = mostProfane[1] / (data.messageCount[mostProfane[0]] || 1);
      insights.push(`${mostProfane[0]} uses more casual language with ${mostProfane[1]} instances of profanity (${(profanityRatio * 100).toFixed(2)}% of their messages).`);
    }
  }
  
  // COMMUNICATION STYLE ANALYSIS
  
  // Vocabulary richness
  const vocabRichness = Object.entries(data.vocabularyRichness);
  if (vocabRichness.length > 0) {
    const mostDiverse = vocabRichness.sort((a, b) => b[1] - a[1])[0];
    const leastDiverse = vocabRichness.sort((a, b) => a[1] - b[1])[0];
    
    if (mostDiverse && mostDiverse[1] > 0.3) {
      const uniqueWords = Object.keys(data.topWords[mostDiverse[0]]).length;
      insights.push(`${mostDiverse[0]} uses the most diverse vocabulary with ${uniqueWords} unique words (${(mostDiverse[1] * 100).toFixed(1)}% vocabulary richness).`);
    }
    
    if (leastDiverse && leastDiverse[0] !== mostDiverse[0] && mostDiverse[1] - leastDiverse[1] > 0.1) {
      insights.push(`${leastDiverse[0]} tends to use a more focused vocabulary (${(leastDiverse[1] * 100).toFixed(1)}% vocabulary richness).`);
    }
  }
  
  // Message length analysis
  const avgMessageLength: {[sender: string]: number} = {};
  
  // Calculate average message length per sender
  Object.keys(data.messageCount).forEach(sender => {
    const senderMessages = data.messages.filter(msg => msg.sender === sender);
    const totalLength = senderMessages.reduce((sum, msg) => sum + msg.content.length, 0);
    avgMessageLength[sender] = totalLength / (data.messageCount[sender] || 1);
  });
  
  const longMessageSender = Object.entries(avgMessageLength).sort((a, b) => b[1] - a[1])[0];
  const shortMessageSender = Object.entries(avgMessageLength).sort((a, b) => a[1] - b[1])[0];
  
  if (longMessageSender && shortMessageSender && longMessageSender[0] !== shortMessageSender[0]) {
    if (longMessageSender[1] > 50 && longMessageSender[1] / shortMessageSender[1] > 1.5) {
      insights.push(`${longMessageSender[0]} typically sends longer messages (avg ${Math.round(longMessageSender[1])} chars), while ${shortMessageSender[0]} is more concise (avg ${Math.round(shortMessageSender[1])} chars).`);
    }
  } else if (longMessageSender && longMessageSender[1] > 80) {
    insights.push(`${longMessageSender[0]} tends to write detailed messages, averaging ${Math.round(longMessageSender[1])} characters.`);
  } else if (shortMessageSender && shortMessageSender[1] < 25) {
    insights.push(`${shortMessageSender[0]} typically sends brief messages, averaging just ${Math.round(shortMessageSender[1])} characters.`);
  }
  
  // Message length trends over time
  if (data.messageLengthOverTime.length > 20) {
    // Group by month and sender
    const monthlyAvgLength: {[key: string]: {[sender: string]: number[]}} = {};
    
    data.messageLengthOverTime.forEach(item => {
      const month = item.date.substring(0, 7); // YYYY-MM
      if (!monthlyAvgLength[month]) monthlyAvgLength[month] = {};
      if (!monthlyAvgLength[month][item.sender]) monthlyAvgLength[month][item.sender] = [];
      monthlyAvgLength[month][item.sender].push(item.length);
    });
    
    // Calculate monthly averages
    const senderAvgByMonth: {[sender: string]: {[month: string]: number}} = {};
    
    Object.entries(monthlyAvgLength).forEach(([month, senders]) => {
      Object.entries(senders).forEach(([sender, lengths]) => {
        if (!senderAvgByMonth[sender]) senderAvgByMonth[sender] = {};
        senderAvgByMonth[sender][month] = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      });
    });
    
    // Analyze trends
    Object.entries(senderAvgByMonth).forEach(([sender, monthData]) => {
      const months = Object.keys(monthData).sort();
      if (months.length > 2) {
        const firstMonthAvg = monthData[months[0]];
        const lastMonthAvg = monthData[months[months.length - 1]];
        const percentChange = ((lastMonthAvg - firstMonthAvg) / firstMonthAvg) * 100;
        
        if (Math.abs(percentChange) > 30) {
          if (percentChange > 0) {
            insights.push(`${sender}'s messages have grown ${percentChange.toFixed(0)}% longer since the conversation began.`);
          } else {
            insights.push(`${sender}'s messages have become ${Math.abs(percentChange).toFixed(0)}% shorter since the conversation began.`);
          }
        }
      }
    });
  }
  
  // Emoji usage
  let maxEmojiCount = 0;
  let maxEmojiCountPerMessage = 0;
  let emojiLover = "";
  let emojiIntensiveUser = "";
  
  for (const sender in data.topEmojis) {
    const emojiCount = Object.values(data.topEmojis[sender]).reduce((sum, count) => sum + count, 0);
    const emojiPerMessage = emojiCount / (data.messageCount[sender] || 1);
    
    if (emojiCount > maxEmojiCount) {
      maxEmojiCount = emojiCount;
      emojiLover = sender;
    }
    
    if (emojiPerMessage > maxEmojiCountPerMessage) {
      maxEmojiCountPerMessage = emojiPerMessage;
      emojiIntensiveUser = sender;
    }
  }
  
  if (emojiLover && maxEmojiCount > 10) {
    insights.push(`${emojiLover} uses emojis the most frequently, with a total of ${maxEmojiCount} emojis.`);
    
    // Top 3 favorite emojis
    const favoriteEmojis = Object.entries(data.topEmojis[emojiLover])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emoji, count]) => emoji)
      .join(', ');
    
    if (favoriteEmojis) {
      insights.push(`${emojiLover}'s favorite emojis are: ${favoriteEmojis}`);
    }
  }
  
  if (emojiIntensiveUser && emojiIntensiveUser !== emojiLover && maxEmojiCountPerMessage > 1.5) {
    insights.push(`${emojiIntensiveUser} uses the most emojis per message (${maxEmojiCountPerMessage.toFixed(1)} on average).`);
  }
  
  // CONTENT AND TOPICS
  
  // Top topics
  if (data.topTopics.length > 0) {
    const topTopic = data.topTopics[0];
    insights.push(`The most discussed topic is "${topTopic.topic}" with ${topTopic.count} mentions.`);
    
    // Topic interests by person
    const topicsByPerson: {[sender: string]: {[topic: string]: number}} = {};
    
    data.messages.forEach(message => {
      const sender = message.sender;
      const content = message.content.toLowerCase();
      
      if (!topicsByPerson[sender]) topicsByPerson[sender] = {};
      
      Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
          topicsByPerson[sender][topic] = (topicsByPerson[sender][topic] || 0) + 1;
        }
      });
    });
    
    // Find distinctive topics for each person
    Object.entries(topicsByPerson).forEach(([sender, topics]) => {
      const topicCounts = Object.entries(topics).sort((a, b) => b[1] - a[1]);
      
      if (topicCounts.length > 0) {
        const distinctiveTopic = topicCounts[0];
        const otherSenders = Object.keys(topicsByPerson).filter(s => s !== sender);
        
        // Check if this topic is distinctively high for this sender
        let isDistinctive = true;
        for (const otherSender of otherSenders) {
          const otherCount = topicsByPerson[otherSender][distinctiveTopic[0]] || 0;
          if (otherCount >= distinctiveTopic[1] * 0.7) {
            isDistinctive = false;
            break;
          }
        }
        
        if (isDistinctive && distinctiveTopic[1] > 5) {
          insights.push(`${sender} shows particular interest in "${distinctiveTopic[0]}" with ${distinctiveTopic[1]} mentions.`);
        }
      }
    });
  }
  
  // TIME PATTERNS
  
  // Active hours analysis
  const hourCounts: { [hour: number]: { [sender: string]: number } } = {};
  data.messages.forEach(message => {
    const hourMatch = message.time.match(/(\d{1,2}):/);
    if (hourMatch) {
      const hour = parseInt(hourMatch[1], 10);
      const sender = message.sender;
      if (!hourCounts[hour]) hourCounts[hour] = {};
      hourCounts[hour][sender] = (hourCounts[hour][sender] || 0) + 1;
    }
  });
  
  // Find peak hours for each sender
  const peakHours: { [sender: string]: number } = {};
  for (const sender in data.messageCount) {
    let maxCount = 0;
    let peakHour = -1;
    for (const hour in hourCounts) {
      const count = hourCounts[parseInt(hour)][sender] || 0;
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    }
    if (peakHour >= 0) {
      peakHours[sender] = peakHour;
    }
  }
  
  // Classify as morning/night person
  for (const [sender, hour] of Object.entries(peakHours)) {
    if (hour >= 5 && hour < 12) {
      insights.push(`${sender} appears to be a morning person, most active around ${hour}:00.`);
    } else if (hour >= 22 || hour < 5) {
      insights.push(`${sender} appears to be a night owl, most active around ${hour}:00.`);
    } else if (hour >= 12 && hour < 17) {
      insights.push(`${sender} is most active during afternoon hours, peaking around ${hour}:00.`);
    } else if (hour >= 17 && hour < 22) {
      insights.push(`${sender} tends to be most active in the evening, around ${hour}:00.`);
    }
  }
  
  // Activity by day of week
  const dayOfWeekActivity: {[day: number]: {[sender: string]: number}} = {};
  
  data.messages.forEach(message => {
    const dayOfWeek = message.date.getDay(); // 0 = Sunday, 6 = Saturday
    const sender = message.sender;
    
    if (!dayOfWeekActivity[dayOfWeek]) dayOfWeekActivity[dayOfWeek] = {};
    dayOfWeekActivity[dayOfWeek][sender] = (dayOfWeekActivity[dayOfWeek][sender] || 0) + 1;
  });
  
  // Find most and least active days for each sender
  const weekdayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  
  for (const sender in data.messageCount) {
    let maxCount = 0;
    let minCount = Infinity;
    let mostActiveDay = -1;
    let leastActiveDay = -1;
    
    for (let day = 0; day < 7; day++) {
      const count = (dayOfWeekActivity[day] && dayOfWeekActivity[day][sender]) || 0;
      
      if (count > maxCount) {
        maxCount = count;
        mostActiveDay = day;
      }
      
      if (count < minCount && count > 0) {
        minCount = count;
        leastActiveDay = day;
      }
    }
    
    if (mostActiveDay >= 0 && maxCount > minCount * 1.5) {
      insights.push(`${sender} is most active on ${weekdayNames[mostActiveDay]} and least active on ${weekdayNames[leastActiveDay]}.`);
    }
  }
  
  // CONVERSATION HEALTH
  
  // Check for one-sided conversation
  const messageCounts = Object.values(data.messageCount);
  if (messageCounts.length > 1) {
    // Calculate standard deviation of message counts
    const avgCount = messageCounts.reduce((a, b) => a + b, 0) / messageCounts.length;
    const variance = messageCounts.reduce((a, b) => a + Math.pow(b - avgCount, 2), 0) / messageCounts.length;
    const stdDev = Math.sqrt(variance);
    
    // High standard deviation suggests imbalanced conversation
    if (stdDev / avgCount > 0.5) {
      const mostActive = Object.entries(data.messageCount).sort((a, b) => b[1] - a[1])[0];
      const leastActive = Object.entries(data.messageCount).sort((a, b) => a[1] - b[1])[0];
      
      if (mostActive[1] > leastActive[1] * 2) {
        insights.push(`The conversation appears somewhat one-sided, with ${mostActive[0]} sending ${(mostActive[1] / leastActive[1]).toFixed(1)}× more messages than ${leastActive[0]}.`);
      }
    }
  }
  
  // Sort insights for better presentation
  // Put the most general insights first, followed by specific details
  data.aiInsights = insights;
}

// Helper function to format milliseconds to readable time
export function msToReadableTime(ms: number): string {
  if (ms < 60000) {
    return `${Math.round(ms / 1000)} seconds`;
  } else if (ms < 3600000) {
    return `${Math.round(ms / 60000)} minutes`;
  } else {
    return `${(ms / 3600000).toFixed(1)} hours`;
  }
}

// Helper function to format month
function formatMonthYear(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}
// function generateAIInsights(data: ChatStats): void {
//   const insights: string[] = [];
  
//   // Most active person
//   const mostActivePerson = Object.entries(data.messageCount)
//     .sort((a, b) => b[1] - a[1])[0];
//   if (mostActivePerson) {
//     insights.push(`${mostActivePerson[0]} is the most active, with ${mostActivePerson[1]} messages.`);
//   }
  
//   // Response time analysis
//   const quickestResponder = Object.entries(data.averageResponseTime)
//     .sort((a, b) => a[1] - b[1])[0];
//   if (quickestResponder) {
//     insights.push(`${quickestResponder[0]} responds the quickest, averaging ${msToReadableTime(quickestResponder[1])}.`);
//   }
  
//   // Conversation starter
//   const mainStarter = Object.entries(data.conversationStarters)
//     .sort((a, b) => b[1] - a[1])[0];
//   if (mainStarter) {
//     insights.push(`${mainStarter[0]} starts most conversations (${mainStarter[1]} times).`);
//   }
  
//   // Sentiment analysis
//   const happiest = Object.entries(data.avgSentimentScores)
//     .sort((a, b) => b[1] - a[1])[0];
//   if (happiest && happiest[1] > 0.5) {
//     insights.push(`${happiest[0]} tends to use more positive language in messages.`);
//   }
  
//   // Vocabulary richness
//   const mostEloquent = Object.entries(data.vocabularyRichness)
//     .sort((a, b) => b[1] - a[1])[0];
//   if (mostEloquent && mostEloquent[1] > 0.3) {
//     insights.push(`${mostEloquent[0]} uses the most diverse vocabulary.`);
//   }
  
//   // Emoji usage
//   let maxEmojiCount = 0;
//   let emojiLover = "";
//   for (const sender in data.topEmojis) {
//     const emojiCount = Object.values(data.topEmojis[sender]).reduce((sum, count) => sum + count, 0);
//     if (emojiCount > maxEmojiCount) {
//       maxEmojiCount = emojiCount;
//       emojiLover = sender;
//     }
//   }
//   if (emojiLover && maxEmojiCount > 10) {
//     insights.push(`${emojiLover} uses emojis the most frequently.`);
//   }
  
//   // Top topics
//   if (data.topTopics.length > 0) {
//     insights.push(`The most discussed topic is "${data.topTopics[0].topic}" with ${data.topTopics[0].count} mentions.`);
//   }
  
//   // Time patterns
//   const hourCounts: { [hour: number]: { [sender: string]: number } } = {};
//   data.messages.forEach(message => {
//     const hourMatch = message.time.match(/(\d{1,2}):/);
//     if (hourMatch) {
//       const hour = parseInt(hourMatch[1], 10);
//       const sender = message.sender;
//       if (!hourCounts[hour]) hourCounts[hour] = {};
//       hourCounts[hour][sender] = (hourCounts[hour][sender] || 0) + 1;
//     }
//   });
  
//   // Find peak hours for each sender
//   const peakHours: { [sender: string]: number } = {};
//   for (const sender in data.messageCount) {
//     let maxCount = 0;
//     let peakHour = -1;
//     for (const hour in hourCounts) {
//       const count = hourCounts[parseInt(hour)][sender] || 0;
//       if (count > maxCount) {
//         maxCount = count;
//         peakHour = parseInt(hour);
//       }
//     }
//     if (peakHour >= 0) {
//       peakHours[sender] = peakHour;
//     }
//   }
  
//   // Classify as morning/night person
//   for (const [sender, hour] of Object.entries(peakHours)) {
//     if (hour >= 5 && hour < 12) {
//       insights.push(`${sender} appears to be a morning person, most active around ${hour}:00.`);
//     } else if (hour >= 20 || hour < 5) {
//       insights.push(`${sender} appears to be a night owl, most active around ${hour}:00.`);
//     }
//   }
  
//   data.aiInsights = insights;
// }

export function generateSampleData(): ChatStats {
  const sampleChat = `[5/12/2023, 9:30:12 AM] Alice: Good morning! How are you today? 😊
[5/12/2023, 9:31:45 AM] Bob: I'm doing well, thanks for asking! ☕ Had my morning coffee already.
[5/12/2023, 9:32:30 AM] Alice: That's great! I just woke up and feeling pretty good too. 💤
[5/12/2023, 9:35:10 AM] Bob: Any plans for today? I was thinking maybe we could go for lunch?
[5/12/2023, 10:15:45 AM] Alice: Lunch sounds perfect! Where do you want to go? 🍕
[5/12/2023, 10:17:22 AM] Bob: How about that new Italian place? I've heard they have amazing pasta!
[5/12/2023, 10:18:05 AM] Alice: Perfect! I love Italian food! What time works for you? ❤️
[5/12/2023, 10:20:30 AM] Bob: How about 1 PM? I have some work to finish before then.
[5/12/2023, 10:22:11 AM] Alice: 1 PM works for me too! See you there. Miss you!
[5/12/2023, 10:23:05 AM] Bob: Miss you too! Looking forward to it. 😘
[5/12/2023, 12:50:22 PM] Alice: Hey, I'm leaving soon, still on for 1pm?
[5/12/2023, 12:51:15 PM] Bob: Yes! Just about to head out. See you there!
[5/13/2023, 8:15:30 AM] Alice: Good morning! Thanks for lunch yesterday, I had a great time! 🌞
[5/13/2023, 8:30:45 AM] Bob: Morning! I had a great time too. The pasta was amazing!
[5/13/2023, 8:32:10 AM] Alice: Yes! We should go there again sometime. What are you up to today?
[5/13/2023, 8:35:22 AM] Bob: I'm planning to catch up on some reading and maybe go for a run. How about you?
[5/13/2023, 8:40:15 AM] Alice: I have to finish some work, but then I was thinking of watching that new movie we talked about.
[5/13/2023, 8:42:30 AM] Bob: Oh, that sounds fun! Would you like some company? I could come over after my run.
[5/13/2023, 8:45:10 AM] Alice: That would be lovely! ❤️ How about around 4pm?
[5/13/2023, 8:47:25 AM] Bob: 4pm works perfectly! I'll bring some snacks. See you then!
[5/14/2023, 10:20:15 AM] Alice: Hey! How's your morning going?
[5/14/2023, 10:25:30 AM] Bob: It's going well! Just had breakfast and now catching up on some news. How about you?
[5/14/2023, 10:28:45 AM] Alice: Pretty relaxed morning. I'm thinking about going to that farmers market later.
[5/14/2023, 10:30:22 AM] Bob: The one downtown? I've been wanting to check that out!
[5/14/2023, 10:32:10 AM] Alice: Yes, that one! Would you like to come along? We could go around noon.
[5/14/2023, 10:35:45 AM] Bob: I'd love to! Noon sounds perfect. I'll pick you up?
[5/14/2023, 10:37:30 AM] Alice: That would be great! See you at 12! 😊
[5/14/2023, 10:38:15 AM] Bob: Looking forward to it! 👍`;

  return parseWhatsAppChat(sampleChat);
}

export function getSentimentLabel(score: number): string {
  if (score > 3) return "Very Positive";
  if (score > 0) return "Positive";
  if (score === 0) return "Neutral";
  if (score > -3) return "Negative";
  return "Very Negative";
}

export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

// export function msToReadableTime(ms: number): string {
//   const seconds = Math.floor(ms / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const hours = Math.floor(minutes / 60);
  
//   if (hours > 0) {
//     return `${hours} hr ${minutes % 60} min`;
//   } else if (minutes > 0) {
//     return `${minutes} min ${seconds % 60} sec`;
//   } else {
//     return `${seconds} sec`;
//   }
// }

export function generateWordCloudData(topWords: { [word: string]: number }) {
  return Object.entries(topWords)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);
}
