
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

// export interface Message {
//   date: Date;
//   time: string;
//   sender: string;
//   content: string;
//   emojis: string[];
//   words: string[];
//   affectionateWords: string[];
//   profanityWords: string[];
//   sentimentScore: number;
// }

// export interface ChatStats {
//   messages: Message[];
//   messageCount: { [sender: string]: number };
//   wordCount: { [sender: string]: number };
//   topWords: { [sender: string]: { [word: string]: number } };
//   topEmojis: { [sender: string]: { [emoji: string]: number } };
//   sentimentScores: { [sender: string]: number[] };
//   avgSentimentScores: { [sender: string]: number };
//   messagesByDay: { [date: string]: number };
//   messagesByHour: { [hour: number]: number };
//   averageResponseTime: { [sender: string]: number };
//   responseTimeHistory: { date: string, sender: string, time: number }[];
//   affectionateWordsCount: { [sender: string]: number };
//   profanityCount: { [sender: string]: number };
//   firstDate: Date;
//   lastDate: Date;
//   conversationStarters: { [sender: string]: number };
//   vocabularyRichness: { [sender: string]: number };
//   aiInsights: string[];
//   messageLengthOverTime: { date: string, sender: string, length: number }[];
//   topTopics: { topic: string, count: number }[];
// }

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
    "sex", "nude", "nudes", "boobs", "breasts", "ass", "penis", "vagina", "dick", "pussy",
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
    "item", "maal", "patane", "setting", "tharki", "flirt", "line maarna", "dirty talk", "romance", "lust",
    "raat bhar", "bedroom", "kamasutra", "makeout", "thighs", "cleavage", "hot photo", "send hot", "dirty pic",
    "bhabhi", "aunty", "sexy ladki", "naughty", "chat me aaja", "voice message bhej", "kya pehna hai", "underwear", "bra"
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

  // Initialize response time tracking per sender pair
  const responseTimesBySenderPair: { [key: string]: number[] } = {};
  const responseCountsBySenderPair: { [key: string]: number } = {};

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

    // Ensure valid date components
    if (isNaN(day) || isNaN(month) || isNaN(year)) continue;
    
    // Create date object with time components
    const timeParts = timeStr.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    
    const messageDate = new Date(year, month, day, hours, minutes);
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
      sentimentScore,
      timestamp: messageTime // Add timestamp for easier calculations
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
    responseTimesBySenderPair: {},
    responseRates: {},
    responseTimeHistory: [],
    affectionateWordsCount: {},
    profanityCount: {},
    firstDate: messages.length > 0 ? messages[0].date : new Date(),
    lastDate: messages.length > 0 ? messages[messages.length - 1].date : new Date(),
    conversationStarters: {},
    vocabularyRichness: {},
    aiInsights: [],
    messageLengthOverTime: [],
    topTopics: [],
    messagesByWeekday: {},
    questionCount: {},
    responseGaps: {},
    messagesByMonth: {},
    messagesSentiment: {},
    chattinessByHour: {},
    conversationPatterns: {},
    engagementStats: {}
  };

  // Track all participants
  const participants = new Set<string>();

  // Initialize message counters
  const messagesPerDay: { [key: string]: { [sender: string]: number } } = {};
  const messagesByWeekday: { [key: number]: number } = {};
  const questionsByUser: { [key: string]: number } = {};
  const messagesByMonth: { [key: string]: number } = {};
  const sentimentByDay: { [key: string]: number[] } = {};

  // Process messages to compute statistics
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const { sender, date, words, emojis, affectionateWords, profanityWords, sentimentScore, content, timestamp } = message;
    const hour = parseInt(message.time.split(':')[0]);
    
    // Add sender to participants
    participants.add(sender);

    // Update first and last date
    if (date < result.firstDate) result.firstDate = new Date(date);
    if (date > result.lastDate) result.lastDate = new Date(date);

    // Update message count per sender
    result.messageCount[sender] = (result.messageCount[sender] || 0) + 1;

    // Update word count per sender
    result.wordCount[sender] = (result.wordCount[sender] || 0) + words.length;

    // Format date for key
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Update messages by month
    result.messagesByMonth[monthKey] = (result.messagesByMonth[monthKey] || 0) + 1;
    messagesByMonth[monthKey] = (messagesByMonth[monthKey] || 0) + 1;

    // Track weekday stats
    const weekday = date.getDay(); // 0-6, where 0 is Sunday
    result.messagesByWeekday[weekday] = (result.messagesByWeekday[weekday] || 0) + 1;
    messagesByWeekday[weekday] = (messagesByWeekday[weekday] || 0) + 1;

    // Track message length over time
    result.messageLengthOverTime.push({
      date: dateKey,
      sender,
      length: content.length
    });

    // Initialize daily tracker if needed
    if (!messagesPerDay[dateKey]) {
      messagesPerDay[dateKey] = {};
    }
    messagesPerDay[dateKey][sender] = (messagesPerDay[dateKey][sender] || 0) + 1;

    // Track sentiment by day
    if (!sentimentByDay[dateKey]) {
      sentimentByDay[dateKey] = [];
    }
    sentimentByDay[dateKey].push(sentimentScore);

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
    
    // Track chattiness by hour for each sender
    if (!result.chattinessByHour[sender]) {
      result.chattinessByHour[sender] = {};
    }
    result.chattinessByHour[sender][hour] = (result.chattinessByHour[sender][hour] || 0) + 1;

    // Detect conversation starters
    if (i === 0 || (timestamp - lastMessageTime) > CONVERSATION_GAP_MS) {
      result.conversationStarters[sender] = (result.conversationStarters[sender] || 0) + 1;
    }
    lastMessageTime = timestamp;

    // Calculate response time (if not the first message)
    if (i > 0) {
      const prevMessage = messages[i - 1];
      if (prevMessage.sender !== sender) {
        const prevSender = prevMessage.sender;
        const prevTimestamp = prevMessage.date.getTime();
        const responseTime = timestamp - prevTimestamp;
        
        // Create a key for this sender pair
        const senderPairKey = `${prevSender}->${sender}`;
        
        // Only count reasonably quick responses (less than 6 hours)
        if (responseTime > 0 && responseTime < 6 * 60 * 60 * 1000) {
          // Initialize if needed
          if (!responseTimesBySenderPair[senderPairKey]) {
            responseTimesBySenderPair[senderPairKey] = [];
          }
          
          // Store this response time
          responseTimesBySenderPair[senderPairKey].push(responseTime);
          
          // Track response time history
          result.responseTimeHistory.push({
            date: dateKey,
            sender,
            respondingTo: prevSender,
            time: responseTime
          });

          // Update average response time for this sender
          if (!result.averageResponseTime[sender]) {
            result.averageResponseTime[sender] = responseTime;
            result.responseRates[sender] = 1;
          } else {
            // Use weighted average for better accuracy
            const currentCount = responseCountsBySenderPair[senderPairKey] || 0;
            const newCount = currentCount + 1;
            responseCountsBySenderPair[senderPairKey] = newCount;
            
            result.averageResponseTime[sender] = 
              (result.averageResponseTime[sender] * result.responseRates[sender] + responseTime) / 
              (result.responseRates[sender] + 1);
            result.responseRates[sender]++;
          }
        } else if (responseTime > 6 * 60 * 60 * 1000) {
          // Track long response gaps
          if (!result.responseGaps[sender]) {
            result.responseGaps[sender] = [];
          }
          result.responseGaps[sender].push({
            date: dateKey,
            respondingTo: prevSender,
            gapTime: responseTime
          });
        }
      }
    }

    // Count questions (simple heuristic: contains ? mark)
    if (content.includes('?')) {
      questionsByUser[sender] = (questionsByUser[sender] || 0) + 1;
      result.questionCount[sender] = (result.questionCount[sender] || 0) + 1;
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

  // Calculate daily sentiment
  for (const dateKey in sentimentByDay) {
    const dailyScores = sentimentByDay[dateKey];
    result.messagesSentiment[dateKey] = dailyScores.reduce((a, b) => a + b, 0) / dailyScores.length;
  }

  // Calculate average response time by sender pair
  for (const [senderPair, times] of Object.entries(responseTimesBySenderPair)) {
    if (times.length > 0) {
      result.responseTimesBySenderPair[senderPair] = times.reduce((a, b) => a + b, 0) / times.length;
    }
  }

  // Calculate engagement stats
  const totalDays = Math.ceil((result.lastDate.getTime() - result.firstDate.getTime()) / (24 * 60 * 60 * 1000));
  
  // For each participant
  for (const sender of participants) {
    const messageCount = result.messageCount[sender] || 0;
    const daysActive = Object.keys(messagesPerDay).filter(day => messagesPerDay[day][sender]).length;
    
    result.engagementStats[sender] = {
      totalMessages: messageCount,
      daysActive,
      activeRatio: daysActive / totalDays,
      averageMessagesPerActiveDay: messageCount / (daysActive || 1)
    };
  }

  // Calculate conversation patterns
  calculateConversationPatterns(messages, result);

  // Generate top topics
  result.topTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Generate AI insights
  generateAIInsights(result);

  return result;
}

function calculateConversationPatterns(messages: Message[], result: ChatStats): void {
  const CONVERSATION_GAP_MS = 12 * 60 * 60 * 1000; // 12 hours
  let conversationStartIndex = 0;
  const conversations: { startTime: number, endTime: number, messages: number, participants: string[] }[] = [];
  
  for (let i = 1; i < messages.length; i++) {
    const currentTimestamp = messages[i].timestamp;
    const prevTimestamp = messages[i-1].timestamp;
    
    // If there's a significant gap, end the current conversation and start a new one
    if (currentTimestamp - prevTimestamp > CONVERSATION_GAP_MS) {
      // Record the completed conversation
      const participantsSet = new Set<string>();
      for (let j = conversationStartIndex; j < i; j++) {
        participantsSet.add(messages[j].sender);
      }
      
      conversations.push({
        startTime: messages[conversationStartIndex].timestamp,
        endTime: messages[i-1].timestamp,
        messages: i - conversationStartIndex,
        participants: Array.from(participantsSet)
      });
      
      // Start a new conversation
      conversationStartIndex = i;
    }
  }
  
  // Add the final conversation
  if (conversationStartIndex < messages.length) {
    const participantsSet = new Set<string>();
    for (let j = conversationStartIndex; j < messages.length; j++) {
      participantsSet.add(messages[j].sender);
    }
    
    conversations.push({
      startTime: messages[conversationStartIndex].timestamp,
      endTime: messages[messages.length - 1].timestamp,
      messages: messages.length - conversationStartIndex,
      participants: Array.from(participantsSet)
    });
  }
  
  // Calculate conversation metrics
  result.conversationPatterns = {
    totalConversations: conversations.length,
    averageLength: conversations.reduce((sum, conv) => sum + conv.messages, 0) / conversations.length,
    averageDuration: conversations.reduce((sum, conv) => sum + (conv.endTime - conv.startTime), 0) / conversations.length,
    multiParticipantRatio: conversations.filter(conv => conv.participants.length > 1).length / conversations.length,
    conversations: conversations
  };
}

function generateAIInsights(data: ChatStats): void {
  const insights: string[] = [];
  
  // Most active person
  const mostActivePerson = Object.entries(data.messageCount)
    .sort((a, b) => b[1] - a[1])[0];
  if (mostActivePerson) {
    insights.push(`${mostActivePerson[0]} is the most active, with ${mostActivePerson[1]} messages.`);
  }
  
  // Response time analysis
  const quickestResponder = Object.entries(data.averageResponseTime)
    .sort((a, b) => a[1] - b[1])[0];
  if (quickestResponder) {
    insights.push(`${quickestResponder[0]} responds the quickest, averaging ${msToReadableTime(quickestResponder[1])}.`);
  }
  
  // Response pair analysis
  if (Object.keys(data.responseTimesBySenderPair).length > 0) {
    const fastestPair = Object.entries(data.responseTimesBySenderPair)
      .sort((a, b) => a[1] - b[1])[0];
    
    if (fastestPair) {
      const [senderPair, time] = fastestPair;
      const [sender1, sender2] = senderPair.split('->');
      insights.push(`${sender2} responds fastest to ${sender1}, averaging ${msToReadableTime(time)}.`);
    }
  }
  
  // Conversation starter
  const mainStarter = Object.entries(data.conversationStarters)
    .sort((a, b) => b[1] - a[1])[0];
  if (mainStarter) {
    insights.push(`${mainStarter[0]} starts most conversations (${mainStarter[1]} times).`);
  }
  
  // Sentiment analysis
  const happiest = Object.entries(data.avgSentimentScores)
    .sort((a, b) => b[1] - a[1])[0];
  if (happiest && happiest[1] > 0.3) {
    insights.push(`${happiest[0]} tends to use more positive language in messages.`);
  }
  
  // Most questions asked
  const mostInquisitive = Object.entries(data.questionCount || {})
    .sort((a, b) => b[1] - a[1])[0];
  if (mostInquisitive && mostInquisitive[1] > 5) {
    insights.push(`${mostInquisitive[0]} asks the most questions (${mostInquisitive[1]} questions).`);
  }
  
  // Vocabulary richness
  const mostEloquent = Object.entries(data.vocabularyRichness)
    .sort((a, b) => b[1] - a[1])[0];
  if (mostEloquent && mostEloquent[1] > 0.3) {
    insights.push(`${mostEloquent[0]} uses the most diverse vocabulary.`);
  }
  
  // Emoji usage
  let maxEmojiCount = 0;
  let emojiLover = "";
  for (const sender in data.topEmojis) {
    const emojiCount = Object.values(data.topEmojis[sender]).reduce((sum, count) => sum + count, 0);
    if (emojiCount > maxEmojiCount) {
      maxEmojiCount = emojiCount;
      emojiLover = sender;
    }
  }
  if (emojiLover && maxEmojiCount > 10) {
    insights.push(`${emojiLover} uses emojis the most frequently (${maxEmojiCount} total).`);
  }
  
  // Identify favorite emojis
  for (const sender in data.topEmojis) {
    const topEmoji = Object.entries(data.topEmojis[sender])
      .sort((a, b) => b[1] - a[1])[0];
    if (topEmoji && topEmoji[1] > 5) {
      insights.push(`${sender}'s favorite emoji is ${topEmoji[0]} (used ${topEmoji[1]} times).`);
    }
  }
  
  // Top topics
  if (data.topTopics.length > 0) {
    insights.push(`The most discussed topic is "${data.topTopics[0].topic}" with ${data.topTopics[0].count} mentions.`);
  }
  
  // Find the day of week with most activity
  const busiest = Object.entries(data.messagesByWeekday)
    .sort((a, b) => b[1] - a[1])[0];
  if (busiest) {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    insights.push(`The chat is most active on ${weekdays[parseInt(busiest[0])]} with ${busiest[1]} messages.`);
  }
  
  // Find peak hours for each sender
  const peakHours: { [sender: string]: number } = {};
  for (const sender in data.chattinessByHour) {
    let maxCount = 0;
    let peakHour = -1;
    
    for (const hour in data.chattinessByHour[sender]) {
      const count = data.chattinessByHour[sender][parseInt(hour)];
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
    } else if (hour >= 20 || hour < 5) {
      insights.push(`${sender} appears to be a night owl, most active around ${hour}:00.`);
    }
  }
  
  // Engagement stats
  for (const sender in data.engagementStats) {
    const stats = data.engagementStats[sender];
    if (stats.activeRatio > 0.7) {
      insights.push(`${sender} is highly engaged, active on ${Math.round(stats.activeRatio * 100)}% of days.`);
    } else if (stats.activeRatio < 0.3 && stats.totalMessages > 50) {
      insights.push(`${sender} is sporadic but intense, sending ${Math.round(stats.averageMessagesPerActiveDay)} messages on active days.`);
    }
  }
  
  // Conversation patterns
  if (data.conversationPatterns && data.conversationPatterns.totalConversations > 0) {
    const avgLength = Math.round(data.conversationPatterns.averageLength);
    const avgDuration = msToReadableTime(data.conversationPatterns.averageDuration);
    insights.push(`Conversations typically last ${avgDuration} with an average of ${avgLength} messages.`);
  }
  
  // Response gap analysis
  for (const sender in data.responseGaps) {
    if (data.responseGaps[sender].length > 0) {
      const totalGaps = data.responseGaps[sender].length;
      const avgGapTime = data.responseGaps[sender].reduce((sum, gap) => sum + gap.gapTime, 0) / totalGaps;
      if (totalGaps > 5) {
        insights.push(`${sender} has ${totalGaps} notable response gaps, averaging ${msToReadableTime(avgGapTime)}.`);
      }
    }
  }
  
  data.aiInsights = insights;
}

// Helper function to convert milliseconds to readable time format
function msToReadableTime(ms: number): string {
  if (ms < 60000) { // Less than a minute
    return `${Math.round(ms / 1000)} seconds`;
  } else if (ms < 3600000) { // Less than an hour
    return `${Math.round(ms / 60000)} minutes`;
  } else if (ms < 86400000) { // Less than a day
    return `${Math.round(ms / 3600000)} hours`;
  } else {
    return `${Math.round(ms / 86400000)} days`;
  }
}

// Type definitions for reference
interface Message {
  date: Date;
  time: string;
  sender: string;
  content: string;
  emojis: string[];
  words: string[];
  affectionateWords: string[];
  profanityWords: string[];
  sentimentScore: number;
  timestamp: number; // Added for easier calculations
}

interface ChatStats {
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
  responseTimesBySenderPair: { [senderPair: string]: number };
  responseRates: { [sender: string]: number };
  responseTimeHistory: { date: string; sender: string; respondingTo?: string; time: number }[];
  affectionateWordsCount: { [sender: string]: number };
  profanityCount: { [sender: string]: number };
  firstDate: Date;
  lastDate: Date;
  conversationStarters: { [sender: string]: number };
  vocabularyRichness: { [sender: string]: number };
  aiInsights: string[];
  messageLengthOverTime: { date: string; sender: string; length: number }[];
  topTopics: { topic: string; count: number }[];
  messagesByWeekday: { [day: number]: number };
  questionCount: { [sender: string]: number };
  responseGaps: { [sender: string]: { date: string; respondingTo: string; gapTime: number }[] };
  messagesByMonth: { [month: string]: number };
  messagesSentiment: { [date: string]: number };
  chattinessByHour: { [sender: string]: { [hour: number]: number } };
  conversationPatterns: {
    totalConversations: number;
    averageLength: number;
    averageDuration: number;
    multiParticipantRatio: number;
    conversations: { startTime: number; endTime: number; messages: number; participants: string[] }[];
  };
  engagementStats: { 
    [sender: string]: {
      totalMessages: number;
      daysActive: number;
      activeRatio: number;
      averageMessagesPerActiveDay: number;
    }
  };
}
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
