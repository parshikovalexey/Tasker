export type TaskColor = {
  id: string;
  label: string;
  swatch: string;
  storageKey: string | null;
  card: string;
};

export const TASK_COLORS: TaskColor[] = [
  {
    id: 'goal',
    label: 'Goal',
    swatch: '#8b5cf6',
    storageKey: 'goals',
    // violet — насыщенный в обеих темах
    card: 'bg-violet-200 border-violet-400 dark:bg-violet-900/50 dark:border-violet-500/70',
  },
  {
    id: 'everyday',
    label: 'Everyday',
    swatch: '#06b6d4',
    storageKey: 'everyday',
    // cyan — бирюзово-голубой, явно отличается от violet и orange
    card: 'bg-cyan-100 border-cyan-300 dark:bg-cyan-900/50 dark:border-cyan-500/70',
  },
  {
    id: 'critical',
    label: 'Critical',
    swatch: '#f97316',
    storageKey: null,
    // orange — ярко-оранжевый, явно отличается от violet и cyan, не конфликтует с красным
    card: 'bg-orange-100 border-orange-300 dark:bg-orange-900/50 dark:border-orange-500/70',
  },
  {
    id: 'blue',
    label: '',
    swatch: '#3b82f6',
    storageKey: null,
    card: 'bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-500/70',
  },
  {
    id: 'rose',
    label: '',
    swatch: '#f43f5e',
    storageKey: null,
    card: 'bg-rose-100 border-rose-300 dark:bg-rose-900/50 dark:border-rose-500/70',
  },
  {
    id: 'slate',
    label: '',
    swatch: '#64748b',
    storageKey: null,
    card: 'bg-slate-100 border-slate-300 dark:bg-slate-800/60 dark:border-slate-500/70',
  },
];

export function getColorById(id?: string): TaskColor | undefined {
  if (!id) return undefined;
  return TASK_COLORS.find((c) => c.id === id);
}

export function getColorByStorageKey(key: string): TaskColor | undefined {
  return TASK_COLORS.find((c) => c.storageKey === key);
}
