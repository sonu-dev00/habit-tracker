const DAILY_QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "[System] Motivation is what gets you started. Habit is what keeps you going. — Jim Ryun",
  "[System] First we make our habits, then our habits make us. — Charles C. Noble",
  "[System] Daily Quest: Become stronger than yesterday. Reward: XP + ∞",
  "[System] Small daily improvements over time lead to stunning results. — Robin Sharma",
  "[System] Another day, another level. The grind never stops, Player.",
  "[System] You have been training. I can see your stats rising. Keep going.",
  "[System] The best time to start was yesterday. The second best time is NOW. Execute.",
];

export function getDailyQuote(): string {
  const today = new Date().getDate();
  return DAILY_QUOTES[today % DAILY_QUOTES.length];
}
