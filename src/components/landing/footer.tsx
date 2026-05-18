import { Sparkles } from "lucide-react";
import Link from "next/link";

const linkColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Community", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "GDPR", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
                HabitForge
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Build better habits with AI-powered coaching, tracking, and
              gamification. Forge your best self.
            </p>
          </div>

          {linkColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-gray-200 mb-4">
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} HabitForge. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Made with 💪 for habit builders everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
