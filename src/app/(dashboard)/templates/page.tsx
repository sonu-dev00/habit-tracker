"use client";

import { createElement } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCreateHabit } from "@/lib/hooks/use-habits";
import { Sparkles, Heart, Brain, Dumbbell, Briefcase, BookOpen, Users, DollarSign, Palette, Star, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { HabitCategory, HabitPriority, HabitFrequency } from "@/types";

interface Template {
  name: string;
  description: string;
  category: HabitCategory;
  priority: HabitPriority;
  frequency: HabitFrequency;
}

const CATEGORY_ICONS: Record<string, any> = {
  HEALTH: Heart,
  FITNESS: Dumbbell,
  MIND: Brain,
  WORK: Briefcase,
  LEARNING: BookOpen,
  SOCIAL: Users,
  FINANCE: DollarSign,
  CREATIVE: Palette,
  SPIRITUAL: Star,
  OTHER: Sparkles,
};

const TEMPLATES: Template[] = [
  { name: "Morning Meditation", description: "10 minutes of mindfulness to start the day", category: "MIND", priority: "IMPORTANT", frequency: "DAILY" },
  { name: "30 Min Workout", description: "Exercise for at least 30 minutes", category: "FITNESS", priority: "IMPORTANT", frequency: "DAILY" },
  { name: "Read 20 Pages", description: "Read at least 20 pages of a book", category: "LEARNING", priority: "NORMAL", frequency: "DAILY" },
  { name: "Drink 8 Glasses of Water", description: "Stay hydrated throughout the day", category: "HEALTH", priority: "ESSENTIAL", frequency: "DAILY" },
  { name: "Plan Tomorrow", description: "Spend 5 minutes planning the next day", category: "WORK", priority: "NORMAL", frequency: "DAILY" },
  { name: "Gratitude Journal", description: "Write 3 things you're grateful for", category: "SPIRITUAL", priority: "NORMAL", frequency: "DAILY" },
  { name: "No Social Media Morning", description: "Don't check social media until after lunch", category: "MIND", priority: "NORMAL", frequency: "DAILY" },
  { name: "Call a Friend", description: "Catch up with a friend or family member", category: "SOCIAL", priority: "NORMAL", frequency: "WEEKLY" },
  { name: "Save $10", description: "Put $10 into savings", category: "FINANCE", priority: "IMPORTANT", frequency: "DAILY" },
  { name: "Stretch Break", description: "5 minutes of stretching", category: "FITNESS", priority: "NORMAL", frequency: "DAILY" },
  { name: "Write 500 Words", description: "Creative or journal writing", category: "CREATIVE", priority: "NORMAL", frequency: "DAILY" },
  { name: "Learn Something New", description: "Spend 15 minutes learning a new skill", category: "LEARNING", priority: "IMPORTANT", frequency: "DAILY" },
  { name: "Meal Prep", description: "Prepare healthy meals for the day", category: "HEALTH", priority: "NORMAL", frequency: "DAILY" },
  { name: "Review Goals", description: "Review your weekly and monthly goals", category: "WORK", priority: "IMPORTANT", frequency: "WEEKLY" },
  { name: "Digital Declutter", description: "Organize files and clean up your inbox", category: "WORK", priority: "BONUS", frequency: "WEEKLY" },
  { name: "Practice Instrument", description: "Practice for at least 20 minutes", category: "CREATIVE", priority: "NORMAL", frequency: "DAILY" },
  { name: "Evening Walk", description: "15 minute walk after dinner", category: "FITNESS", priority: "NORMAL", frequency: "DAILY" },
  { name: "Affirmations", description: "Read your daily affirmations", category: "SPIRITUAL", priority: "NORMAL", frequency: "DAILY" },
];

const CATEGORY_ORDER: HabitCategory[] = ["HEALTH", "FITNESS", "MIND", "WORK", "LEARNING", "SOCIAL", "FINANCE", "CREATIVE", "SPIRITUAL", "OTHER"];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.04 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  },
};

export default function TemplatesPage() {
  const router = useRouter();
  const createHabit = useCreateHabit();
  const { toast } = useToast();

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: cat.charAt(0) + cat.slice(1).toLowerCase(),
    templates: TEMPLATES.filter((t) => t.category === cat),
  })).filter((g) => g.templates.length > 0);

  const handleUseTemplate = (template: Template) => {
    createHabit.mutate(
      {
        name: template.name,
        description: template.description,
        category: template.category,
        priority: template.priority,
        frequency: template.frequency,
      },
      {
        onSuccess: () => {
          toast({ title: `"${template.name}" added!`, type: "success" });
          router.push("/habits");
        },
      }
    );
  };

  return (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold text-gray-100">Habit Templates</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Choose from proven templates to get started quickly
        </p>
      </motion.div>

      {grouped.map((group) => (
        <motion.div key={group.category} variants={stagger.item}>
          <div className="flex items-center gap-2 mb-3">
            {createElement(CATEGORY_ICONS[group.category] || Sparkles, { className: "h-4 w-4 text-gray-400" })}
            <h2 className="text-sm font-semibold text-gray-300">{group.label}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.templates.map((template) => {
              const Icon = CATEGORY_ICONS[template.category] || Sparkles;
              return (
                <GlassCard key={template.name} className="p-4 group hover:border-white/20 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <Icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-200 truncate">{template.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="default" size="sm">{template.frequency}</Badge>
                        <Badge variant={template.priority === "ESSENTIAL" ? "brand" : template.priority === "IMPORTANT" ? "info" : "default"} size="sm">{template.priority}</Badge>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 py-2 text-xs font-medium transition-all"
                  >
                    <Plus className="h-3 w-3" /> Use Template
                  </button>
                </GlassCard>
              );
            })}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
