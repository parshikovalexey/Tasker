import { useState } from "react";
import { LinkifyText } from "./LinkifyText";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMoveTask } from "@/hooks/use-tasks";
import { RescheduleModal } from "./RescheduleModal";
import { calculateDate, parseDateKey } from "@/lib/dateUtils";
import { getColorById } from "@/lib/taskColors";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: string;
  text: string;
  color?: string;
  dayKey: string;
  isActionable: boolean;
  isOverdue: boolean;
  badgeLabel?: string;
}

const ACTION_BUTTONS = [
  "Завтра", "Через день", "Через неделю", "Через месяц", "Через год",
  "Пн/Ср", "Вт/Чт", "Вых", "Custom",
];

function getInitialDateForKey(dayKey: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) return parseDateKey(dayKey);
  return new Date();
}

export function TaskCard({ id, text, color, dayKey, isActionable, isOverdue, badgeLabel }: TaskCardProps) {
  const moveTask = useMoveTask();

  // Reschedule quick-action modal
  const [rescheduleState, setRescheduleState] = useState<{ isOpen: boolean; date: Date }>({
    isOpen: false,
    date: new Date(),
  });

  // Edit modal (pencil button)
  const [editOpen, setEditOpen] = useState(false);

  // Confirm "done" dialog
  const [confirmOpen, setConfirmOpen] = useState(false);

  const taskColor = getColorById(color);

  const handleDoneConfirmed = () => {
    moveTask.mutate({ id, from: dayKey, to: "done" });
    setConfirmOpen(false);
  };

  const handleAction = (action: string) => {
    const targetDate = calculateDate(action, new Date());
    setRescheduleState({ isOpen: true, date: targetDate });
  };

  const cardBase = isOverdue
    ? "bg-destructive/5 border-destructive/20"
    : taskColor
    ? taskColor.card
    : "bg-card border-border/40";

  const showColorBadge = taskColor?.label && !badgeLabel;

  // goals/everyday: !isActionable + badgeLabel
  const isGoalOrEveryday = !isActionable && !!badgeLabel;

  return (
    <>
      <div
        className={cn(
          "group relative rounded-2xl p-4 mb-3 border transition-all duration-200 shadow-sm hover:shadow-md",
          cardBase
        )}
      >
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            {badgeLabel && (
              <Badge
                variant="secondary"
                className="mb-2 text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary"
              >
                {badgeLabel}
              </Badge>
            )}

            {showColorBadge && (
              <Badge
                variant="outline"
                className="mb-2 text-[10px] uppercase tracking-wider font-semibold border-0 text-white"
                style={{ backgroundColor: taskColor!.swatch }}
              >
                {taskColor!.label}
              </Badge>
            )}

            <div className={cn("text-sm md:text-base", isOverdue ? "text-destructive" : "text-foreground/90")}>
              <LinkifyText text={text} />
            </div>
          </div>

          <div className="flex flex-col gap-1 items-center mt-1 flex-shrink-0">
            {/* Кнопка "Выполнено" — открывает подтверждение */}
            {isActionable && (
              <button
                onClick={() => setConfirmOpen(true)}
                data-testid={`button-done-${id}`}
                className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-transparent hover:border-primary hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                aria-label="Выполнено"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
            )}

            {/* Кнопка редактирования — для обычных и goals/everyday задач */}
            <button
              onClick={() => setEditOpen(true)}
              data-testid={`button-edit-${id}`}
              className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all active:scale-95 opacity-0 group-hover:opacity-100"
              aria-label="Редактировать"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Быстрые кнопки переноса */}
        {isActionable && (
          <div className="mt-4 flex flex-wrap gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            {ACTION_BUTTONS.map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                className={cn(
                  "text-[10px] px-2.5 py-1 rounded-md font-medium transition-colors",
                  isOverdue
                    ? "bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Confirm done */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Отметить как выполненное?</AlertDialogTitle>
            <AlertDialogDescription className="line-clamp-3">
              «{text}»
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDoneConfirmed}
              className="rounded-xl"
            >
              Выполнено
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule modal (quick-action buttons) */}
      {isActionable && (
        <RescheduleModal
          isOpen={rescheduleState.isOpen}
          onClose={() => setRescheduleState((prev) => ({ ...prev, isOpen: false }))}
          taskId={id}
          initialText={text}
          initialColor={color}
          fromKey={dayKey}
          initialDate={rescheduleState.date}
        />
      )}

      {/* Edit modal (pencil button — для всех задач) */}
      <RescheduleModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        taskId={id}
        initialText={text}
        initialColor={color}
        fromKey={dayKey}
        initialDate={isGoalOrEveryday ? new Date() : getInitialDateForKey(dayKey)}
      />
    </>
  );
}
