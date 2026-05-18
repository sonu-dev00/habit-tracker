import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-400 hover:underline mb-8 inline-block">&larr; Back to Home</Link>
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
          <p>These Terms of Service govern your use of HabitForge. By using our service, you agree to these terms.</p>
          <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using HabitForge, you agree to be bound by these Terms. If you do not agree, do not use the service.</p>
          <h2 className="text-xl font-semibold text-white mt-8">2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
          <h2 className="text-xl font-semibold text-white mt-8">3. Acceptable Use</h2>
          <p>You agree not to misuse the service, interfere with its operation, or use it for any unlawful purpose.</p>
          <h2 className="text-xl font-semibold text-white mt-8">4. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
          <h2 className="text-xl font-semibold text-white mt-8">5. Changes</h2>
          <p>We may update these terms at any time. Continued use after changes constitutes acceptance.</p>
        </div>
      </div>
    </div>
  );
}
