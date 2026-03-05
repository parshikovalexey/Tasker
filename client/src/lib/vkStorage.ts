/**
 * VK Storage — реализация хранилища через VK Bridge API.
 *
 * Ключи:
 *   - yyyy-MM-dd  — задачи на конкретный день
 *   - goals       — цели
 *   - everyday    — ежедневные задачи
 *
 * Данные каждого ключа — JSON-массив задач: Task[]
 */

import { v4 as uuidv4 } from 'uuid';
import { bridge } from './vkBridge';

export type Task = {
  id: string;
  text: string;
  color?: string;
};

export type StorageData = Record<string, Task[]>;

// ─── Низкоуровневые вспомогательные функции ──────────────────────────────────

async function storageGetKeys(): Promise<string[]> {
  const res = await bridge.send('VKWebAppStorageGetKeys', { count: 1000, offset: 0 });
  return res.keys ?? [];
}

async function storageGet(keys: string[]): Promise<Record<string, Task[]>> {
  if (keys.length === 0) return {};
  const res = await bridge.send('VKWebAppStorageGet', { keys });
  const result: Record<string, Task[]> = {};
  for (const item of res.keys) {
    try {
      result[item.key] = item.value ? (JSON.parse(item.value) as Task[]) : [];
    } catch {
      result[item.key] = [];
    }
  }
  return result;
}

async function storageSet(key: string, tasks: Task[]): Promise<void> {
  await bridge.send('VKWebAppStorageSet', { key, value: JSON.stringify(tasks) });
}

async function getTasksForKey(key: string): Promise<Task[]> {
  const data = await storageGet([key]);
  return data[key] ?? [];
}

// ─── Утилиты для работы с датами ─────────────────────────────────────────────

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Генерирует ключи с сегодняшнего дня на N дней вперёд (включая сегодня). */
function futureDateKeys(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n + 1 }, (_, i) => toDateKey(addDays(today, i)));
}

// ─── Публичный интерфейс хранилища ───────────────────────────────────────────

export const vkStorage = {
  /**
   * Загружает данные из VK Storage и возвращает полный объект StorageData.
   *
   * Стратегия формирования набора ключей:
   *   1. Служебные ключи: goals, everyday (всегда присутствуют).
   *   2. Прошлые дни: все ключи формата yyyy-MM-dd из VK Storage,
   *      которые ≤ сегодня (уже сохранённые дни пользователя).
   *   3. Будущие дни: сегодня + 7 дней вперёд (гарантируем наличие слотов).
   */
  async getAll(): Promise<StorageData> {
    const ALWAYS_KEYS = ['goals', 'everyday'];
    const todayKey = toDateKey(new Date());

    // Получаем все ключи из хранилища
    const storedKeys = await storageGetKeys();

    // Оставляем только прошлые/сегодняшние дни из уже сохранённых ключей
    const pastDayKeys = storedKeys.filter(
      (k) => DATE_KEY_RE.test(k) && k <= todayKey,
    );

    // Следующие 7 дней (включая сегодня)
    const nextSevenDayKeys = futureDateKeys(7);

    const keysToFetch = Array.from(
      new Set([...ALWAYS_KEYS, ...pastDayKeys, ...nextSevenDayKeys]),
    );

    const data = await storageGet(keysToFetch);

    // Гарантируем наличие всех запрошенных ключей в результате
    for (const k of keysToFetch) {
      if (!data[k]) data[k] = [];
    }
    return data;
  },

  /**
   * Добавляет новую задачу в указанный ключ.
   */
  async addTask(key: string, text: string, color?: string): Promise<Task> {
    const tasks = await getTasksForKey(key);
    const newTask: Task = { id: uuidv4(), text, ...(color ? { color } : {}) };
    tasks.push(newTask);
    await storageSet(key, tasks);
    return newTask;
  },

  /**
   * Перемещает задачу из одного ключа в другой.
   * Опционально обновляет текст и/или цвет задачи.
   */
  async moveTask(
    taskId: string,
    fromKey: string,
    toKey: string,
    newText?: string,
    newColor?: string,
  ): Promise<void> {
    // Получаем оба ключа за один запрос, если они разные
    const keys = fromKey === toKey ? [fromKey] : [fromKey, toKey];
    const data = await storageGet(keys);

    const fromTasks = data[fromKey] ?? [];
    const toTasks = fromKey === toKey ? fromTasks : (data[toKey] ?? []);

    const taskIndex = fromTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const [task] = fromTasks.splice(taskIndex, 1);
    if (newText !== undefined) task.text = newText;
    if (newColor !== undefined) task.color = newColor;

    toTasks.push(task);

    // Сохраняем изменения
    if (fromKey === toKey) {
      await storageSet(fromKey, fromTasks);
    } else {
      await Promise.all([storageSet(fromKey, fromTasks), storageSet(toKey, toTasks)]);
    }
  },

  /**
   * Удаляет задачу из ключа.
   */
  async deleteTask(taskId: string, key: string): Promise<void> {
    const tasks = await getTasksForKey(key);
    const filtered = tasks.filter((t) => t.id !== taskId);
    await storageSet(key, filtered);
  },

  /**
   * Загружает задачи конкретного ключа из VK Storage.
   */
  async loadKey(key: string): Promise<Task[]> {
    return getTasksForKey(key);
  },
};
