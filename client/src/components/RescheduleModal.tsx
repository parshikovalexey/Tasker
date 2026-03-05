import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Minus, CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { formatFriendlyDate, formatDateKey } from "@/lib/dateUtils";
import { addDays, subDays, startOfMonth, format } from "date-fns";
import { ru } from "date-fns/locale";
import { useMoveTask, useAddTask } from "@/hooks/use-tasks";
import { useNavigation, type CaptionProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TASK_COLORS, getColorById } from "@/lib/taskColors";

function CalendarCaption({ displayMonth }: CaptionProps, onGoToday: () => void) {
  const { goToMonth, previousMonth, nextMonth } = useNavigation();
  return (
    <div className="flex flex-col gap-1 px-1 pt-1">
      <div className="text-sm font-medium text-center capitalize">
        {format(displayMonth, "LLLL yyyy", { locale: ru })}
      </div>
      <div className="flex items-center justify-between">
        <button
          aria-label="Предыдущий месяц"
          onClick={() => previousMonth && goToMonth(previousMonth)}
          disabled={!previousMonth}
          className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <Button variant="outline" size="sm" className="h-7 px-3 text-xs rounded-md" onClick={onGoToday}>
          Сегодня
        </Button>
        <button
          aria-label="Следующий месяц"
          onClick={() => nextMonth && goToMonth(nextMonth)}
          disabled={!nextMonth}
          className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100")}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date;
  taskId?: string;
  initialText?: string;
  initialColor?: string;
  fromKey?: string;
}

export function RescheduleModal({
  isOpen,
  onClose,
  initialDate,
  taskId,
  initialText = "",
  initialColor,
  fromKey,
}: RescheduleModalProps) {
  const [date, setDate] = useState<Date>(initialDate);
  const [calendarMonth, setCalendarMonth] = useState<Date>(startOfMonth(initialDate));
  const [text, setText] = useState(initialText);
  const [colorId, setColorId] = useState<string | undefined>(initialColor);
  const moveTask = useMoveTask();
  const addTask = useAddTask();

  const isCreateMode = !taskId;
  const selectedColor = getColorById(colorId);
  const isSpecialCategory = !!selectedColor?.storageKey;
  const dateDisabled = isSpecialCategory;

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate);
      setCalendarMonth(startOfMonth(initialDate));
      setText(initialText);
      setColorId(initialColor);
    }
  }, [isOpen, initialDate, initialText, initialColor]);

  const handleSelectDate = (d: Date | undefined) => {
    if (!d) return;
    setDate(d);
    setCalendarMonth(startOfMonth(d));
  };

  const handleAdjustDate = (delta: number) => {
    setDate((d) => {
      const next = delta > 0 ? addDays(d, 1) : subDays(d, 1);
      setCalendarMonth(startOfMonth(next));
      return next;
    });
  };

  const handleGoToday = () => setCalendarMonth(startOfMonth(new Date()));

  const handleSave = () => {
    if (!text.trim()) return;
    const toKey = selectedColor?.storageKey ?? formatDateKey(date);
    if (isCreateMode) {
      addTask.mutate({ key: toKey, text: text.trim(), color: colorId }, { onSuccess: onClose });
    } else {
      moveTask.mutate({ id: taskId!, from: fromKey!, to: toKey, text, color: colorId }, { onSuccess: onClose });
    }
  };

  const isPending = isCreateMode ? addTask.isPending : moveTask.isPending;
  const CustomCaption = (props: CaptionProps) => CalendarCaption(props, handleGoToday);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 border-0 shadow-2xl bg-card">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-display">
            {isCreateMode ? "Новая задача" : "Перенос задачи"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Color picker */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* No color option */}
            <button
              data-testid="color-none"
              onClick={() => setColorId(undefined)}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center bg-muted",
                !colorId
                  ? "border-foreground/50 scale-110"
                  : "border-border hover:border-foreground/30"
              )}
              title="Без цвета"
            >
              {!colorId && <Check className="h-3.5 w-3.5 text-foreground/60" />}
            </button>

            {TASK_COLORS.map((c) => (
              <button
                key={c.id}
                data-testid={`color-${c.id}`}
                onClick={() => setColorId(c.id)}
                title={c.label || c.id}
                className={cn(
                  "h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center",
                  colorId === c.id
                    ? "border-foreground/60 scale-110 shadow-sm"
                    : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: c.swatch }}
              >
                {colorId === c.id && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
              </button>
            ))}

            {selectedColor?.label && (
              <span className="text-xs text-muted-foreground ml-1 font-medium">
                {selectedColor.label}
              </span>
            )}
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isCreateMode ? "Что нужно сделать?" : undefined}
            className="min-h-[100px] resize-none border-border/50 focus-visible:ring-primary/20 rounded-xl bg-muted/30"
            autoFocus={isCreateMode}
          />

          {/* Date controls — disabled for goal/everyday */}
          <div className={cn("flex flex-col items-center gap-3", dateDisabled && "opacity-40 pointer-events-none")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  data-testid="button-open-calendar"
                  className="w-full h-12 rounded-xl border-border/50 bg-background font-medium text-base transition-all"
                  disabled={dateDisabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {dateDisabled
                    ? `Сохраняется в "${selectedColor!.label}"`
                    : formatFriendlyDate(date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl border-border/50 shadow-xl" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleSelectDate}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  components={{ Caption: CustomCaption }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex gap-2 w-full">
              <Button
                variant="secondary"
                data-testid="button-date-minus"
                className="flex-1 rounded-xl h-10 bg-muted/50"
                disabled={dateDisabled}
                onClick={() => handleAdjustDate(-1)}
              >
                <Minus className="h-4 w-4" />
                1 день
              </Button>
              <Button
                variant="secondary"
                data-testid="button-date-plus"
                className="flex-1 rounded-xl h-10 bg-muted/50"
                disabled={dateDisabled}
                onClick={() => handleAdjustDate(1)}
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
