import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-400 hover:underline mb-8 inline-block">&larr; Back to Home</Link>
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: May 2026</p>
        <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
          <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email address, and profile picture when you create an account. We collect usage data including habits logged, completions, streaks, and XP to provide our service. Payment information is processed by Stripe and never stored on our servers.</p>

          <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Your Data</h2>
          <p>We use your data to operate HabitForge, provide AI coaching, send service emails (welcome, password reset, subscription receipts), and improve our product. We do not sell your personal data to third parties.</p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Data Processing & Third Parties</h2>
          <p>We use Stripe for payment processing (your card data goes directly to Stripe, never to us). We use OpenAI for AI coaching features (anonymized habit data is sent for analysis). We use Resend for transactional email delivery. We use Neon (PostgreSQL) for database hosting. All data is encrypted in transit and at rest.</p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You can request data export or account deletion at any time. AI chat history is automatically deleted after 30 days. Audit logs are retained for 90 days.</p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Your Rights (GDPR)</h2>
          <p>If you are in the EU/EEA, you have the right to access, rectify, port, and erase your data. You can manage most of this from your account settings. For deletion requests, contact support@habitforge.app. We will respond within 30 days.</p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Cookies</h2>
          <p>We use essential cookies for authentication (next-auth session tokens) and basic functionality. No tracking cookies or third-party marketing cookies are used.</p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Security</h2>
          <p>We implement industry-standard security: bcrypt password hashing, HTTP-only cookies, CSP headers, rate limiting, and encrypted database connections. Despite these measures, no online service is 100% secure.</p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Contact</h2>
          <p>For privacy questions: privacy@habitforge.app. For support: support@habitforge.app. Our physical address is available upon request.</p>

          <h2 className="text-xl font-semibold text-white mt-8">9. Changes</h2>
          <p>We will notify users of material privacy policy changes via email. Continued use after changes constitutes acceptance.</p>
        </div>
      </div>
    </div>
  );
}
