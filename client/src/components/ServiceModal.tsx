import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart2, Info } from "lucide-react";
import { storage, type StorageData } from "@/lib/storage";
import { cn } from "@/lib/utils";

const VK_MAX_KEYS = 1000;
const VK_KEY_MAX_BYTES = 4096;

interface KeyInfo {
  key: string;
  taskCount: number;
  sizeBytes: number;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Если передан — компактный режим: показывает загруженные ключи + done */
  loadedStorage?: StorageData;
}

function buildKeyInfos(keys: string[], data: StorageData): KeyInfo[] {
  const uniqueKeys = [...new Set(keys)];
  const infos: KeyInfo[] = uniqueKeys.map((k) => {
    const tasks = data[k] ?? [];
    const jsonStr = tasks.length > 0 ? JSON.stringify(tasks) : "";
    const sizeBytes = new Blob([jsonStr]).size;
    return { key: k, taskCount: tasks.length, sizeBytes };
  });
  infos.sort((a, b) => {
    const special = ["goals", "everyday", "done"];
    const ai = special.indexOf(a.key);
    const bi = special.indexOf(b.key);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return b.taskCount - a.taskCount || a.key.localeCompare(b.key);
  });
  return infos;
}

export function ServiceModal({ isOpen, onClose, loadedStorage }: ServiceModalProps) {
  const isCompact = !!loadedStorage;
  const [loading, setLoading] = useState(false);
  const [keyInfos, setKeyInfos] = useState<KeyInfo[]>([]);
  const [totalKeys, setTotalKeys] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setKeyInfos([]);

    if (isCompact) {
      setLoading(true);
      const mergedData: StorageData = { ...loadedStorage };
      const baseKeys = Object.keys(loadedStorage);

      storage
        .loadKey("done")
        .then((doneTasks) => {
          if (!("done" in mergedData)) {
            mergedData["done"] = doneTasks;
          }
          const allKeys = [...new Set([...baseKeys, "done"])];
          setTotalKeys(allKeys.length);
          setKeyInfos(buildKeyInfos(allKeys, mergedData));
        })
        .finally(() => setLoading(false));
      return;
    }

    setLoading(true);
    storage
      .getFullSnapshot()
      .then(({ keys, data }) => {
        const uniqueKeys = [...new Set(keys)];
        setTotalKeys(uniqueKeys.length);
        setKeyInfos(buildKeyInfos(uniqueKeys, data));
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const usagePercent = Math.round((totalKeys / VK_MAX_KEYS) * 100);
  const remainingKeys = VK_MAX_KEYS - totalKeys;

  const keyUsageColor =
    usagePercent >= 80
      ? "text-destructive"
      : usagePercent >= 50
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 shadow-2xl bg-card max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-muted-foreground" />
            Сервисная информация
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Подсказка и лимиты */}
            <div className="rounded-xl bg-muted/50 p-3 space-y-3">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  {isCompact
                    ? "Показаны загруженные ключи и ключ «done»."
                    : "Все ключи хранилища."}{" "}
                  Лимиты VK Storage: <b>1000 ключей</b> максимум,{" "}
                  <b>4096 байт</b> на ключ.
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {isCompact ? "Загружено ключей" : "Ключей использовано"}
                  </span>
                  <span className={cn("font-semibold", isCompact ? "" : keyUsageColor)}>
                    {isCompact
                      ? totalKeys
                      : `${totalKeys} / ${VK_MAX_KEYS} (${usagePercent}%)`}
                  </span>
                </div>
                {!isCompact && (
                  <>
                    <Progress value={usagePercent} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      Осталось: <b>{remainingKeys}</b> свободных ключей
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Список ключей */}
            <div className="flex-1 overflow-y-auto min-h-0 rounded-xl border border-border/40">
              {keyInfos.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Хранилище пустое
                </p>
              ) : (
                <div className="divide-y divide-border/30">
                  {keyInfos.map((info) => {
                    const fillPct = Math.min(
                      100,
                      Math.round((info.sizeBytes / VK_KEY_MAX_BYTES) * 100),
                    );
                    const isSpecial = ["goals", "everyday", "done"].includes(info.key);
                    return (
                      <div key={info.key} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-foreground truncate">
                              {info.key}
                            </span>
                            {isSpecial && (
                              <Badge
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 h-4 shrink-0"
                              >
                                системный
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 bg-border/40 rounded-full h-1 overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  fillPct >= 80
                                    ? "bg-destructive"
                                    : fillPct >= 50
                                    ? "bg-yellow-500"
                                    : "bg-emerald-500",
                                )}
                                style={{ width: `${fillPct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {info.sizeBytes}б
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold text-foreground">
                            {info.taskCount}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            задач
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
