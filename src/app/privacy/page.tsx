import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-400 hover:underline mb-8 inline-block">&larr; Back to Home</Link>
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
          <p>Your privacy is important to us. This policy outlines how HabitForge collects and handles your data.</p>
          <h2 className="text-xl font-semibold text-white mt-8">1. Data We Collect</h2>
          <p>We collect information you provide when creating an account, such as your name, email address, and profile picture.</p>
          <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Data</h2>
          <p>We use your data to provide, maintain, and improve our services, including habit tracking, AI coaching, and personalized recommendations.</p>
          <h2 className="text-xl font-semibold text-white mt-8">3. Data Sharing</h2>
          <p>We do not sell your personal data. We may share data with third-party services (e.g., Stripe for payments) as necessary to provide our service.</p>
          <h2 className="text-xl font-semibold text-white mt-8">4. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data.</p>
          <h2 className="text-xl font-semibold text-white mt-8">5. Contact</h2>
          <p>For privacy-related inquiries, contact us at privacy@habitforge.app.</p>
        </div>
      </div>
    </div>
  );
}
