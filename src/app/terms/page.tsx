import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-400 hover:underline mb-8 inline-block">&larr; Back to Home</Link>
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: May 2026</p>
        <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
          <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using HabitForge (the &quot;Service&quot;), you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Description of Service</h2>
          <p>HabitForge is a habit tracking and AI coaching platform. We provide tools to track habits, analyze patterns, receive AI-powered motivation, manage focus sessions, and optionally process subscription payments through Stripe.</p>

          <h2 className="text-xl font-semibold text-white mt-8">3. User Accounts</h2>
          <p>You must be 13 years or older to use the Service. You are responsible for your account credentials and all activity under your account. You must provide accurate information. We may suspend or terminate accounts that violate these terms.</p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Subscriptions & Payments</h2>
          <p>Free accounts have limited features. Pro and Teams plans require payment processed by Stripe. Subscriptions auto-renew unless canceled. You can cancel anytime from your account settings; access continues until the billing period ends. Refunds are handled per Stripe&apos;s policies. Prices may change with 30 days notice.</p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Acceptable Use</h2>
          <p>You agree not to: abuse the AI system with excessive requests, attempt to bypass rate limits, scrape user data, use the Service for illegal purposes, interfere with operations, or create multiple accounts to circumvent limits. AI coaching is for motivation and suggestions only — not medical or professional advice.</p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Intellectual Property</h2>
          <p>Your habit data belongs to you. HabitForge&apos;s code, branding, and design are our property. We grant you a limited license to use the Service for personal or team habit tracking.</p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Limitation of Liability</h2>
          <p>The Service is provided &quot;as is&quot; without warranties. We are not liable for damages from service interruptions, data loss, or AI coaching suggestions. Our total liability is limited to the amount you paid in the last 12 months.</p>

          <h2 className="text-xl font-semibold text-white mt-8">8. Termination</h2>
          <p>You can delete your account anytime from Settings. We may suspend accounts for ToS violations. Upon termination, your data is deleted within 30 days.</p>

          <h2 className="text-xl font-semibold text-white mt-8">9. Governing Law</h2>
          <p>These terms are governed by the laws of the State of Delaware, USA. Disputes will be resolved in Delaware courts.</p>

          <h2 className="text-xl font-semibold text-white mt-8">10. Changes</h2>
          <p>We may update these terms. Material changes are communicated via email. Continued use after changes takes effect constitutes acceptance.</p>

          <h2 className="text-xl font-semibold text-white mt-8">11. Contact</h2>
          <p>For legal inquiries: support@habitforge.app</p>
        </div>
      </div>
    </div>
  );
}
