import type { Task, StorageData } from './storage';

/** Экранирует строку для CSV: оборачивает в кавычки, если содержит спецсимволы */
function escapeCell(value: string): string {
  const needsQuoting = value.includes(',') || value.includes('"') || value.includes('\n');
  if (!needsQuoting) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCell).join(',')).join('\n');
}

function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Выгружает задачи из ключа 'done' */
export function exportDoneTasks(tasks: Task[]): void {
  const header = ['Текст', 'Цвет'];
  const rows = tasks.map((t) => [t.text, t.color ?? '']);
  const csv = buildCsv([header, ...rows]);
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`done_tasks_${date}.csv`, csv);
}

/** Выгружает все загруженные задачи по всем ключам */
export function exportAllTasks(storage: StorageData): void {
  const header = ['Ключ', 'Текст', 'Цвет'];
  const rows: string[][] = [];

  const sortedKeys = Object.keys(storage).sort((a, b) => {
    // Сначала специальные ключи, потом даты
    const order = ['goals', 'everyday'];
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  for (const key of sortedKeys) {
    for (const task of storage[key]) {
      rows.push([key, task.text, task.color ?? '']);
    }
  }

  const csv = buildCsv([header, ...rows]);
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`all_tasks_${date}.csv`, csv);
}
