const DAILY_QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Motivation is what gets you started. Habit is what keeps you going. — Jim Ryun",
  "First we make our habits, then our habits make us. — Charles C. Noble",
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Small daily improvements over time lead to stunning results. — Robin Sharma",
  "Be the change that you wish to see in the world. — Mahatma Gandhi",
  "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
];

export function getDailyQuote(): string {
  const today = new Date().getDate();
  return DAILY_QUOTES[today % DAILY_QUOTES.length];
}
