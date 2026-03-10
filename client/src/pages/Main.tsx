import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DayGroup } from "@/components/DayGroup";
import { ExportModal } from "@/components/ExportModal";
import { ServiceModal } from "@/components/ServiceModal";
import { isPastDay, formatDateKey } from "@/lib/dateUtils";
import { addDays } from "date-fns";
import { CheckSquare, Download, BarChart2 } from "lucide-react";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Task } from "@/lib/storage";

type TaskWithKey = Task & { originalKey?: string };

export default function Main() {
  const { data: storageData, isLoading } = useTasks();
  const [exportOpen, setExportOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  if (isLoading || !storageData) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const todayDate = new Date();
  const todayKey = formatDateKey(todayDate);

  const pastKeys = Object.keys(storageData)
    .filter(key => isPastDay(key) && storageData[key].length > 0)
    .sort();

  // Разделяем everyday задачи: на сегодня vs на будущее
  const everydayTasks = storageData['everyday'] || [];
  const everydayToday = everydayTasks.filter(
    (t) => !t.nextDate || t.nextDate <= todayKey,
  );
  const everydayFutureMap: Record<string, TaskWithKey[]> = {};
  for (const task of everydayTasks) {
    if (task.nextDate && task.nextDate > todayKey) {
      if (!everydayFutureMap[task.nextDate]) everydayFutureMap[task.nextDate] = [];
      everydayFutureMap[task.nextDate].push({ ...task, originalKey: 'everyday' });
    }
  }

  const todayTasks: TaskWithKey[] = [
    ...(storageData['goals'] || []).map(t => ({ ...t, originalKey: 'goals' })),
    ...everydayToday.map(t => ({ ...t, originalKey: 'everyday' })),
    ...(storageData[todayKey] || []),
  ];

  const futureKeys = Array.from({ length: 7 }).map((_, i) =>
    formatDateKey(addDays(todayDate, i + 1))
  );

  const getFutureTasks = (key: string): TaskWithKey[] => [
    ...(storageData[key] || []),
    ...(everydayFutureMap[key] || []),
  ];

  return (
    <div className="mobile-container flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold">Погнали</h1>
        </Link>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="button-open-service"
                onClick={() => setServiceOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Сервисная информация</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="button-open-export"
                onClick={() => setExportOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Экспорт данных</p>
            </TooltipContent>
          </Tooltip>

          <ThemeToggle />
        </div>
      </header>

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        loadedStorage={storageData}
      />

      <ServiceModal
        isOpen={serviceOpen}
        onClose={() => setServiceOpen(false)}
        loadedStorage={storageData}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">

        {pastKeys.length > 0 && (
          <div className="mb-8">
            {pastKeys.map(key => (
              <DayGroup
                key={key}
                dayKey={key}
                tasks={storageData[key]}
                isOverdue={true}
                defaultOpen={false}
              />
            ))}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-6 opacity-50" />
          </div>
        )}

        <DayGroup
          dayKey={todayKey}
          tasks={todayTasks}
          defaultOpen={true}
          titleOverride="Сегодня"
        />

        <div className="mt-8">
          {futureKeys.map(key => (
            <DayGroup
              key={key}
              dayKey={key}
              tasks={getFutureTasks(key)}
              defaultOpen={true}
            />
          ))}
        </div>

        <div className="h-24"></div>
      </main>
    </div>
  );
}
