import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Sparkles, Heart, Dumbbell, Brain, Briefcase, BookOpen, Users, DollarSign, Palette, Star } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  HEALTH: Heart, FITNESS: Dumbbell, MIND: Brain, WORK: Briefcase,
  LEARNING: BookOpen, SOCIAL: Users, FINANCE: DollarSign, CREATIVE: Palette, SPIRITUAL: Star, OTHER: Sparkles,
};

export default async function SharedHabitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const habit = await prisma.habit.findFirst({
    where: { shareToken: token },
    select: { name: true, description: true, category: true, priority: true, frequency: true, user: { select: { name: true } } },
  });

  if (!habit) notFound();

  const Icon = CATEGORY_ICONS[habit.category] || Sparkles;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-xl p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-100 mb-2">{habit.name}</h1>
        {habit.description && <p className="text-sm text-gray-400 mb-4">{habit.description}</p>}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{habit.frequency}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{habit.priority}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{habit.category}</span>
        </div>
        {habit.user?.name && (
          <p className="text-xs text-gray-500">Shared by <span className="text-gray-400 font-medium">{habit.user.name}</span></p>
        )}
      </div>
    </div>
  );
}
