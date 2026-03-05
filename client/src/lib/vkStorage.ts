/**
 * VK Storage — реализация хранилища через VK Bridge API.
 *
 * Ключи:
 *   - yyyy-MM-dd  — задачи на конкретный день
 *   - goals       — цели
 *   - everyday    — ежедневные задачи
 *   - done        — выполненные задачи
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

// ─── Публичный интерфейс хранилища ───────────────────────────────────────────

export const vkStorage = {
  /**
   * Загружает все ключи из VK Storage и возвращает полный объект StorageData.
   * Служебные ключи (goals, everyday, done) всегда включаются в результат.
   */
  async getAll(): Promise<StorageData> {
    const ALWAYS_KEYS = ['goals', 'everyday', 'done'];
    const allKeys = await storageGetKeys();
    // Дедупликация: объединяем реальные ключи со служебными
    const keysToFetch = Array.from(new Set([...allKeys, ...ALWAYS_KEYS]));
    const data = await storageGet(keysToFetch);
    // Гарантируем, что служебные ключи всегда есть в результате
    for (const k of ALWAYS_KEYS) {
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
};
