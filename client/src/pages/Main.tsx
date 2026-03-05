import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DayGroup } from "@/components/DayGroup";
import { isPastDay, formatDateKey } from "@/lib/dateUtils";
import { storage } from "@/lib/storage";
import { exportDoneTasks, exportAllTasks } from "@/lib/csvExport";
import { addDays } from "date-fns";
import { CheckSquare, CheckCheck, Sheet, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Main() {
  const { data: storageData, isLoading } = useTasks();
  const [exportingDone, setExportingDone] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

  async function handleExportDone() {
    setExportingDone(true);
    try {
      const tasks = await storage.loadKey('done');
      exportDoneTasks(tasks);
    } finally {
      setExportingDone(false);
    }
  }

  function handleExportAll() {
    if (!storageData) return;
    setExportingAll(true);
    try {
      exportAllTasks(storageData);
    } finally {
      setExportingAll(false);
    }
  }

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

  const todayTasks = [
    ...(storageData['goals'] || []).map(t => ({ ...t, originalKey: 'goals' })),
    ...(storageData['everyday'] || []).map(t => ({ ...t, originalKey: 'everyday' })),
    ...(storageData[todayKey] || []),
  ];

  const futureKeys = Array.from({ length: 7 }).map((_, i) =>
    formatDateKey(addDays(todayDate, i + 1))
  );

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

        <div className="flex items-center gap-1">
          {/* Экспорт выполненных задач */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="button-export-done"
                onClick={handleExportDone}
                disabled={exportingDone}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                {exportingDone
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCheck className="w-4 h-4" />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Выгрузить выполненные задачи (done)</p>
            </TooltipContent>
          </Tooltip>

          {/* Экспорт всех задач */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                data-testid="button-export-all"
                onClick={handleExportAll}
                disabled={exportingAll}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                {exportingAll
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Sheet className="w-4 h-4" />
                }
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Выгрузить все загруженные задачи</p>
            </TooltipContent>
          </Tooltip>

          <ThemeToggle />
        </div>
      </header>

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
              tasks={storageData[key] || []}
              defaultOpen={true}
            />
          ))}
        </div>

        <div className="h-24"></div>
      </main>
    </div>
  );
}
