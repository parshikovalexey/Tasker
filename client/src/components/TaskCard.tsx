import { useState } from "react";
import { LinkifyText } from "./LinkifyText";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useMoveTask } from "@/hooks/use-tasks";
import { RescheduleModal } from "./RescheduleModal";
import { calculateDate, formatDateKey } from "@/lib/dateUtils";

interface TaskCardProps {
  id: string;
  text: string;
  dayKey: string;
  isActionable: boolean;
  isOverdue: boolean;
  badgeLabel?: string;
}

const ACTION_BUTTONS = ["Завтра", "Через день", "Через неделю", "Через месяц", "Через год", "Пн/Ср", "Вт/Чт", "Вых", "Custom"];

export function TaskCard({ id, text, dayKey, isActionable, isOverdue, badgeLabel }: TaskCardProps) {
  const moveTask = useMoveTask();
  const [modalState, setModalState] = useState<{isOpen: boolean, date: Date}>({ isOpen: false, date: new Date() });

  const handleDone = () => {
    moveTask.mutate({ id, from: dayKey, to: "done" });
  };

  const handleAction = (action: string) => {
    const targetDate = calculateDate(action, new Date());
    setModalState({ isOpen: true, date: targetDate });
  };

  return (
    <>
      <div className={`
        group relative rounded-2xl p-4 mb-3 transition-all duration-300
        ${isOverdue 
          ? 'bg-destructive/5 border border-destructive/20 shadow-sm' 
          : 'bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-border'}
      `}>
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            {badgeLabel && (
              <Badge variant="secondary" className="mb-2 text-[10px] uppercase tracking-wider font-semibold opacity-70 bg-primary/10 text-primary hover:bg-primary/20">
                {badgeLabel}
              </Badge>
            )}
            <div className={`text-sm md:text-base ${isOverdue ? 'text-destructive' : 'text-foreground/90'}`}>
              <LinkifyText text={text} />
            </div>
          </div>
          
          {isActionable && (
            <button 
              onClick={handleDone}
              className="mt-1 flex-shrink-0 h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-transparent hover:border-primary hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
              aria-label="Mark as done"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {isActionable && (
          <div className="mt-4 flex flex-wrap gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            {ACTION_BUTTONS.map(action => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                className={`
                  text-[10px] px-2.5 py-1 rounded-md font-medium transition-colors
                  ${isOverdue 
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive text-destructive-foreground' 
                    : 'bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground'}
                `}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      <RescheduleModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({...prev, isOpen: false}))}
        taskId={id}
        initialText={text}
        fromKey={dayKey}
        initialDate={modalState.date}
      />
    </>
  );
}
