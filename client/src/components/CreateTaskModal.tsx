import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddTask } from "@/hooks/use-tasks";
import { formatFriendlyDate, parseDateKey } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayKey: string;
}

export function CreateTaskModal({ isOpen, onClose, dayKey }: CreateTaskModalProps) {
  const [text, setText] = useState("");
  const addTask = useAddTask();

  const handleSave = () => {
    if (!text.trim()) return;
    addTask.mutate(
      { key: dayKey, text: text.trim() },
      { onSuccess: () => { setText(""); onClose(); } }
    );
  };

  const title = ['goals', 'everyday', 'done'].includes(dayKey) 
    ? dayKey.toUpperCase() 
    : formatFriendlyDate(parseDateKey(dayKey));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 border-0 shadow-2xl bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            Новая задача 
            <Badge variant="secondary" className="font-normal opacity-70 bg-muted">{title}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          placeholder="Что нужно сделать?"
          className="min-h-[120px] resize-none border-border/50 focus-visible:ring-primary/20 rounded-xl bg-muted/30 text-base"
          autoFocus
        />

        <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <Button variant="ghost" onClick={onClose} className="rounded-xl flex-1 sm:flex-none">Отмена</Button>
          <Button 
            onClick={handleSave} 
            disabled={addTask.isPending || !text.trim()}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex-1 sm:flex-none transition-all"
          >
            {addTask.isPending ? "Создание..." : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
