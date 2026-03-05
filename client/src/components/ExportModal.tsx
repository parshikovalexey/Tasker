import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Trash2, AlertCircle } from "lucide-react";
import { storage, type StorageData, type Task } from "@/lib/storage";
import { exportDoneTasks, exportAllTasks } from "@/lib/csvExport";
import { ServiceModal } from "./ServiceModal";
import { cn } from "@/lib/utils";

// VK Storage per-key limit in bytes
const VK_KEY_MAX_BYTES = 4096;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  loadedStorage: StorageData;
}

export function ExportModal({ isOpen, onClose, loadedStorage }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<"current" | "done">("current");
  const [exportOption, setExportOption] = useState<"loaded" | "all">("loaded");
  const [currentLoading, setCurrentLoading] = useState(false);

  const [doneLoading, setDoneLoading] = useState(false);
  const [doneTasks, setDoneTasks] = useState<Task[] | null>(null);
  const [doneSize, setDoneSize] = useState(0);
  const [doneExported, setDoneExported] = useState(false);
  const [doneClearing, setDoneClearing] = useState(false);
  const [doneCleared, setDoneCleared] = useState(false);

  // Secret: 3 быстрых клика на заголовке → сервисный модал
  const secretClickTimesRef = useRef<number[]>([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  const handleTitleClick = () => {
    const now = Date.now();
    const times = [...secretClickTimesRef.current, now].filter((t) => now - t < 1500);
    secretClickTimesRef.current = times;
    if (times.length >= 3) {
      secretClickTimesRef.current = [];
      setServiceModalOpen(true);
    }
  };

  // Загружаем done при переключении на вкладку
  useEffect(() => {
    if (!isOpen || activeTab !== "done" || doneTasks !== null) return;
    setDoneLoading(true);
    storage
      .loadKey("done")
      .then((tasks) => {
        setDoneTasks(tasks);
        const jsonStr = JSON.stringify(tasks);
        setDoneSize(new Blob([jsonStr]).size);
      })
      .finally(() => setDoneLoading(false));
  }, [isOpen, activeTab, doneTasks]);

  // Сброс состояния при открытии
  useEffect(() => {
    if (isOpen) {
      setActiveTab("current");
      setExportOption("loaded");
      setDoneTasks(null);
      setDoneSize(0);
      setDoneExported(false);
      setDoneCleared(false);
    }
  }, [isOpen]);

  async function handleExportCurrent() {
    setCurrentLoading(true);
    try {
      if (exportOption === "loaded") {
        exportAllTasks(loadedStorage);
      } else {
        const { data } = await storage.getFullSnapshot();
        exportAllTasks(data);
      }
    } finally {
      setCurrentLoading(false);
    }
  }

  function handleExportDone() {
    if (!doneTasks) return;
    exportDoneTasks(doneTasks);
    setDoneExported(true);
  }

  async function handleClearDone() {
    setDoneClearing(true);
    try {
      await storage.clearKey("done");
      setDoneCleared(true);
      setDoneTasks([]);
      setDoneSize(0);
      setDoneExported(false);
    } finally {
      setDoneClearing(false);
    }
  }

  const doneFillPercent = Math.min(100, Math.round((doneSize / VK_KEY_MAX_BYTES) * 100));
  const doneFillColor =
    doneFillPercent >= 80
      ? "text-destructive"
      : doneFillPercent >= 50
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle
              className="text-xl font-display cursor-default select-none"
              onClick={handleTitleClick}
            >
              Экспорт данных
            </DialogTitle>
          </DialogHeader>

          {/* Информация об ограничениях */}
          <div className="flex gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground leading-relaxed">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-500" />
            <p>
              Хранилище ВКонтакте ограничено: до&nbsp;<b>1000 ключей</b> и до&nbsp;
              <b>4096 байт</b> на ключ. Периодически выгружайте и очищайте выполненные
              задачи, а также сохраняйте резервную копию текущих — на случай если
              что-то пойдёт не так.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "current" | "done")}>
            <TabsList className="w-full rounded-xl">
              <TabsTrigger value="current" className="flex-1 rounded-lg">
                Текущие задачи
              </TabsTrigger>
              <TabsTrigger value="done" className="flex-1 rounded-lg">
                Завершённые
              </TabsTrigger>
            </TabsList>

            {/* ── Вкладка: Текущие задачи ── */}
            <TabsContent value="current" className="mt-4 space-y-4">
              <RadioGroup
                value={exportOption}
                onValueChange={(v) => setExportOption(v as "loaded" | "all")}
                className="space-y-2"
              >
                <div className="flex items-start gap-3 rounded-xl border border-border/50 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExportOption("loaded")}>
                  <RadioGroupItem value="loaded" id="opt-loaded" className="mt-0.5" />
                  <Label htmlFor="opt-loaded" className="cursor-pointer leading-snug">
                    <span className="font-medium text-sm">Загруженные задачи</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Только те, что сейчас отображаются в приложении
                    </span>
                  </Label>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border/50 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExportOption("all")}>
                  <RadioGroupItem value="all" id="opt-all" className="mt-0.5" />
                  <Label htmlFor="opt-all" className="cursor-pointer leading-snug">
                    <span className="font-medium text-sm">Все задачи из хранилища</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Перебирает все ключи — включая старые и скрытые
                    </span>
                  </Label>
                </div>
              </RadioGroup>

              <Button
                onClick={handleExportCurrent}
                disabled={currentLoading}
                data-testid="button-export-current"
                className="w-full rounded-xl"
              >
                {currentLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Загрузка...</>
                ) : (
                  <><Download className="h-4 w-4 mr-2" />Выгрузить CSV</>
                )}
              </Button>
            </TabsContent>

            {/* ── Вкладка: Завершённые задачи ── */}
            <TabsContent value="done" className="mt-4 space-y-4">
              {doneLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : doneTasks !== null ? (
                <>
                  {doneCleared ? (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Хранилище очищено
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ключ «done» успешно сброшен
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Прогресс заполнения */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Заполненность ключа «done»</span>
                          <span className={cn("font-semibold", doneFillColor)}>
                            {doneFillPercent}%
                          </span>
                        </div>
                        <Progress value={doneFillPercent} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {doneTasks.length} задач · ~{doneSize} / {VK_KEY_MAX_BYTES} байт
                        </p>
                      </div>

                      {doneTasks.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          Список выполненных задач пуст
                        </p>
                      ) : (
                        <>
                          <Button
                            onClick={handleExportDone}
                            data-testid="button-export-done"
                            className="w-full rounded-xl"
                            variant={doneExported ? "outline" : "default"}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {doneExported ? "Выгрузить повторно" : "Выгрузить CSV"}
                          </Button>

                          {doneExported && (
                            <Button
                              onClick={handleClearDone}
                              disabled={doneClearing}
                              data-testid="button-clear-done"
                              variant="destructive"
                              className="w-full rounded-xl"
                            >
                              {doneClearing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Очистка...</>
                              ) : (
                                <><Trash2 className="h-4 w-4 mr-2" />Очистить хранилище done</>
                              )}
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              ) : null}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ServiceModal isOpen={serviceModalOpen} onClose={() => setServiceModalOpen(false)} />
    </>
  );
}
