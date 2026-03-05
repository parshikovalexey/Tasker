import { useTasks } from "@/hooks/use-tasks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DayGroup } from "@/components/DayGroup";
import { isPastDay, formatDateKey } from "@/lib/dateUtils";
import { addDays, parse } from "date-fns";
import { CheckSquare } from "lucide-react";
import { Link } from "wouter";

export default function Main() {
  const { data: storage, isLoading } = useTasks();

  if (isLoading || !storage) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const todayDate = new Date();
  const todayKey = formatDateKey(todayDate);

  // 1. Get Past Days from existing keys
  const pastKeys = Object.keys(storage)
    .filter(key => isPastDay(key) && storage[key].length > 0)
    .sort(); // yyyy-MM-dd sorts chronologically naturally

  // 2. Compose Today (Goals -> Everyday -> Today)
  const todayTasks = [
    ...(storage['goals'] || []).map(t => ({ ...t, originalKey: 'goals' })),
    ...(storage['everyday'] || []).map(t => ({ ...t, originalKey: 'everyday' })),
    ...(storage[todayKey] || [])
  ];

  // 3. Generate Next 7 Days (even if empty, so user can add tasks)
  const futureKeys = Array.from({ length: 7 }).map((_, i) => formatDateKey(addDays(todayDate, i + 1)));

  return (
    <div className="mobile-container flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold">Планнер</h1>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
        
        {/* Past Days (Red, Collapsed by default) */}
        {pastKeys.length > 0 && (
          <div className="mb-8">
            {pastKeys.map(key => (
              <DayGroup 
                key={key} 
                dayKey={key} 
                tasks={storage[key]} 
                isOverdue={true} 
                defaultOpen={false} 
              />
            ))}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-6 opacity-50" />
          </div>
        )}

        {/* Today */}
        <DayGroup 
          dayKey={todayKey} 
          tasks={todayTasks} 
          defaultOpen={true} 
          titleOverride="Сегодня"
        />

        {/* Future Days */}
        <div className="mt-8">
          {futureKeys.map(key => (
            <DayGroup 
              key={key} 
              dayKey={key} 
              tasks={storage[key] || []} 
              defaultOpen={true} 
            />
          ))}
        </div>

        {/* Bottom padding for mobile scrolling comfort */}
        <div className="h-24"></div>
      </main>
    </div>
  );
}
