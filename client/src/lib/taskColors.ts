export type TaskColor = {
  id: string;
  label: string;
  swatch: string;
  storageKey: string | null;
  card: string;
  badge: string;
};

export const TASK_COLORS: TaskColor[] = [
  {
    id: 'goal',
    label: 'Goal',
    swatch: '#8b5cf6',
    storageKey: 'goals',
    card: 'bg-violet-50 border-violet-200 dark:bg-violet-950/25 dark:border-violet-700/40',
    badge: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700/40',
  },
  {
    id: 'everyday',
    label: 'Everyday',
    swatch: '#f97316',
    storageKey: 'everyday',
    card: 'bg-orange-50 border-orange-200 dark:bg-orange-950/25 dark:border-orange-700/40',
    badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700/40',
  },
  {
    id: 'critical',
    label: 'Critical',
    swatch: '#f59e0b',
    storageKey: null,
    card: 'bg-amber-50 border-amber-300 dark:bg-amber-950/25 dark:border-amber-600/40',
    badge: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-600/40',
  },
  {
    id: 'blue',
    label: '',
    swatch: '#3b82f6',
    storageKey: null,
    card: 'bg-blue-50 border-blue-200 dark:bg-blue-950/25 dark:border-blue-700/40',
    badge: '',
  },
  {
    id: 'green',
    label: '',
    swatch: '#10b981',
    storageKey: null,
    card: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/25 dark:border-emerald-700/40',
    badge: '',
  },
  {
    id: 'rose',
    label: '',
    swatch: '#ec4899',
    storageKey: null,
    card: 'bg-pink-50 border-pink-200 dark:bg-pink-950/25 dark:border-pink-700/40',
    badge: '',
  },
  {
    id: 'teal',
    label: '',
    swatch: '#14b8a6',
    storageKey: null,
    card: 'bg-teal-50 border-teal-200 dark:bg-teal-950/25 dark:border-teal-700/40',
    badge: '',
  },
];

export function getColorById(id?: string): TaskColor | undefined {
  if (!id) return undefined;
  return TASK_COLORS.find((c) => c.id === id);
}

export function getColorByStorageKey(key: string): TaskColor | undefined {
  return TASK_COLORS.find((c) => c.storageKey === key);
}
