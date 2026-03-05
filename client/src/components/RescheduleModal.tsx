import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Minus, CalendarIcon } from "lucide-react";
import { formatFriendlyDate, formatDateKey } from "@/lib/dateUtils";
import { addDays, subDays } from "date-fns";
import { useMoveTask, useAddTask } from "@/hooks/use-tasks";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
  taskId?: string;
  initialText?: string;
  fromKey?: string;
}

export function RescheduleModal({
  isOpen,
  onClose,
  initialDate,
  taskId,
  initialText = "",
  fromKey,
}: RescheduleModalProps) {
  const [date, setDate] = useState<Date>(initialDate);
  const [text, setText] = useState(initialText);
  const moveTask = useMoveTask();
  const addTask = useAddTask();

  const isCreateMode = !taskId;

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate);
      setText(initialText);
    }
  }, [isOpen, initialDate, initialText]);

  const handleSave = () => {
    if (!text.trim()) return;
    const toKey = formatDateKey(date);
    if (isCreateMode) {
      addTask.mutate({ key: toKey, text: text.trim() }, { onSuccess: onClose });
    } else {
      moveTask.mutate({ id: taskId!, from: fromKey!, to: toKey, text }, { onSuccess: onClose });
    }
  };

  const isPending = isCreateMode ? addTask.isPending : moveTask.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 border-0 shadow-2xl bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-display">
            {isCreateMode ? "Новая задача" : "Перенос задачи"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isCreateMode ? "Что нужно сделать?" : undefined}
            className="min-h-[100px] resize-none border-border/50 focus-visible:ring-primary/20 rounded-xl bg-muted/30"
            autoFocus={isCreateMode}
          />

          <div className="flex flex-col items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-border/50 bg-background font-medium text-base transition-all"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {formatFriendlyDate(date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl border-border/50 shadow-xl" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                data-testid="button-date-minus"
                className="flex-1 rounded-xl h-10 bg-muted/50"
                onClick={() => setDate((d) => subDays(d, 1))}
              >
                <Minus className="h-4 w-4" />
                1 день
              </Button>
              <Button
                variant="secondary"
                data-testid="button-date-plus"
                className="flex-1 rounded-xl h-10 bg-muted/50"
                onClick={() => setDate((d) => addDays(d, 1))}
              >
                <Plus className="h-4 w-4" />
                1 день
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <Button variant="ghost" onClick={onClose} className="rounded-xl flex-1 sm:flex-none">
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !text.trim()}
            className="rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 flex-1 sm:flex-none"
          >
            {isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
