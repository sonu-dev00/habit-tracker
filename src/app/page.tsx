import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 h-[300px] w-[600px] rounded-full bg-blue-500/5 blur-[150px]" />
        <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
              HabitForge
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started
              <Sparkles className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
