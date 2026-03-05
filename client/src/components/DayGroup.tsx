import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { RescheduleModal } from "./RescheduleModal";
import { formatFriendlyDate, parseDateKey } from "@/lib/dateUtils";

interface Task {
  id: string;
  text: string;
  color?: string;
  originalKey?: string;
}

interface DayGroupProps {
  dayKey: string;
  tasks: Task[];
  isOverdue?: boolean;
  defaultOpen?: boolean;
  titleOverride?: string;
}

function getDateForKey(dayKey: string): Date {
  if (['goals', 'everyday', 'done'].includes(dayKey)) return new Date();
  return parseDateKey(dayKey);
}

export function DayGroup({ dayKey, tasks, isOverdue = false, defaultOpen = true, titleOverride }: DayGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const title = titleOverride || formatFriendlyDate(parseDateKey(dayKey));

  if (tasks.length === 0 && isOverdue) return null;

  return (
    <div className="mb-6 relative">
      <div className="flex items-center gap-3 mb-4 sticky top-0 bg-background/80 backdrop-blur-md py-2 z-10 -mx-4 px-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1">
          <CollapsibleTrigger asChild>
            <button
              data-testid={`button-toggle-day-${dayKey}`}
              className="flex items-center gap-2 group text-left hover:opacity-80 transition-opacity"
            >
              <Badge
                variant={isOverdue ? "destructive" : "outline"}
                className={`
                  text-sm px-3 py-1 rounded-lg border-2 transition-all
                  ${!isOverdue && 'border-primary/20 bg-primary/5 text-primary group-hover:bg-primary/10'}
                `}
              >
                {title}
              </Badge>
              {!isOpen && (
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {tasks.length}
                </span>
              )}
            </button>
          </CollapsibleTrigger>
        </Collapsible>

        <button
          data-testid={`button-add-task-${dayKey}`}
          onClick={() => setIsCreateOpen(true)}
          className={`
            h-8 w-8 rounded-full flex items-center justify-center transition-all
            ${isOverdue
              ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white'
              : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground shadow-sm'}
          `}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Collapsible open={isOpen}>
        <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
          <div className="space-y-3 pb-2">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                Нет задач на этот день
              </div>
            ) : (
              tasks.map(task => {
                const actualKey = task.originalKey || dayKey;
                const isGoalOrEveryday = ['goals', 'everyday'].includes(actualKey);

                return (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    text={task.text}
                    dayKey={actualKey}
                    isActionable={!isGoalOrEveryday && dayKey !== 'done'}
                    isOverdue={isOverdue}
                    badgeLabel={isGoalOrEveryday ? actualKey : undefined}
                  />
                );
              })
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <RescheduleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialDate={getDateForKey(dayKey)}
      />
    </div>
  );
}
