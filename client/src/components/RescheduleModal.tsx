import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Minus, CalendarIcon } from "lucide-react";
import { formatFriendlyDate, formatDateKey } from "@/lib/dateUtils";
import { addDays, subDays } from "date-fns";
import { useMoveTask } from "@/hooks/use-tasks";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  initialText: string;
  fromKey: string;
  initialDate: Date;
}

export function RescheduleModal({ isOpen, onClose, taskId, initialText, fromKey, initialDate }: RescheduleModalProps) {
  const [date, setDate] = useState<Date>(initialDate);
  const [text, setText] = useState(initialText);
  const moveTask = useMoveTask();

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate);
      setText(initialText);
    }
  }, [isOpen, initialDate, initialText]);

  const handleSave = () => {
    const toKey = formatDateKey(date);
    moveTask.mutate({ id: taskId, from: fromKey, to: toKey, text });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 border-0 shadow-2xl bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-display">Перенос задачи</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px] resize-none border-border/50 focus-visible:ring-primary/20 rounded-xl bg-muted/30"
          />

          <div className="flex flex-col items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12 rounded-xl border-border/50 bg-background hover:bg-muted/50 font-medium text-base transition-all">
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
                className="flex-1 rounded-xl h-10 bg-muted/50 hover:bg-muted"
                onClick={() => setDate(d => subDays(d, 1))}
              >
                <Minus className="h-4 w-4 mr-2 opacity-70" /> -1 день
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 rounded-xl h-10 bg-muted/50 hover:bg-muted"
                onClick={() => setDate(d => addDays(d, 1))}
              >
                <Plus className="h-4 w-4 mr-2 opacity-70" /> +1 день
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <Button variant="ghost" onClick={onClose} className="rounded-xl flex-1 sm:flex-none">Отмена</Button>
          <Button 
            onClick={handleSave} 
            disabled={moveTask.isPending}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex-1 sm:flex-none"
          >
            {moveTask.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
