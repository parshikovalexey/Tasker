import { v4 as uuidv4 } from 'uuid';
import { format, subDays, addDays } from 'date-fns';

export type Task = {
  id: string;
  text: string;
  color?: string;
  nextDate?: string; // для everyday: следующая дата появления (yyyy-MM-dd)
};

export type StorageData = Record<string, Task[]>;

const today = new Date();
const todayKey = format(today, 'yyyy-MM-dd');
const yesterdayKey = format(subDays(today, 1), 'yyyy-MM-dd');
const twoDaysAgoKey = format(subDays(today, 2), 'yyyy-MM-dd');
const tomorrowKey = format(addDays(today, 1), 'yyyy-MM-dd');
const in3DaysKey = format(addDays(today, 3), 'yyyy-MM-dd');

let memoryStorage: StorageData = {
  goals: [
    { id: uuidv4(), text: 'Выучить React полностью и сдать проект', color: 'goal' },
    { id: uuidv4(), text: 'Прочитать 12 книг за год', color: 'goal' },
  ],
  everyday: [
    { id: uuidv4(), text: 'Зарядка 15 минут', color: 'everyday' },
    { id: uuidv4(), text: 'Выпить 2 литра воды', color: 'everyday' },
    { id: uuidv4(), text: 'Медитация 10 минут', color: 'everyday', nextDate: tomorrowKey },
  ],
  [twoDaysAgoKey]: [
    { id: uuidv4(), text: 'Устаревший баг в проде — https://github.com/org/repo/issues/1234', color: 'critical' },
  ],
  [yesterdayKey]: [
    { id: uuidv4(), text: 'Забытая задача с длинной ссылкой https://vk.com/feed?w=wall-123456_789' },
    { id: uuidv4(), text: 'Подготовить отчет за прошлую неделю', color: 'blue' },
  ],
  [todayKey]: [
    { id: uuidv4(), text: 'Сделать тестовое задание для VK', color: 'critical' },
    { id: uuidv4(), text: 'Купить продукты (молоко, хлеб, овощи)' },
    { id: uuidv4(), text: 'Позвонить в банк' },
  ],
  [tomorrowKey]: [
    { id: uuidv4(), text: 'Встреча с командой в 10:00', color: 'blue' },
    { id: uuidv4(), text: 'Код-ревью PR #42', color: 'slate' },
  ],
  [in3DaysKey]: [
    { id: uuidv4(), text: 'Дедлайн по проекту', color: 'critical' },
  ],
  done: [
    { id: uuidv4(), text: 'Done: Настроить CI/CD пайплайн' },
  ],
};

function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export const mockStorage = {
  async getAll(): Promise<StorageData> {
    await delay(100);
    return JSON.parse(JSON.stringify(memoryStorage));
  },

  async addTask(key: string, text: string, color?: string): Promise<Task> {
    await delay(100);
    const newTask: Task = { id: uuidv4(), text, color };
    if (!memoryStorage[key]) memoryStorage[key] = [];
    memoryStorage[key].push(newTask);
    return newTask;
  },

  async moveTask(taskId: string, fromKey: string, toKey: string, newText?: string, newColor?: string): Promise<void> {
    await delay(100);
    const fromList = memoryStorage[fromKey] || [];
    const taskIndex = fromList.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;
    const [task] = fromList.splice(taskIndex, 1);
    if (newText !== undefined) task.text = newText;
    if (newColor !== undefined) task.color = newColor;
    if (!memoryStorage[toKey]) memoryStorage[toKey] = [];
    memoryStorage[toKey].push(task);
  },

  async deleteTask(taskId: string, key: string): Promise<void> {
    await delay(100);
    if (!memoryStorage[key]) return;
    memoryStorage[key] = memoryStorage[key].filter((t) => t.id !== taskId);
  },

  async loadKey(key: string): Promise<Task[]> {
    await delay(50);
    return JSON.parse(JSON.stringify(memoryStorage[key] || []));
  },

  async getAllKeys(): Promise<string[]> {
    await delay(50);
    return Object.keys(memoryStorage);
  },

  async getFullSnapshot(): Promise<{ keys: string[]; data: StorageData }> {
    await delay(100);
    const data: StorageData = JSON.parse(JSON.stringify(memoryStorage));
    return { keys: Object.keys(data), data };
  },

  async clearKey(key: string): Promise<void> {
    await delay(50);
    memoryStorage[key] = [];
  },

  async completeEverydayTask(taskId: string): Promise<void> {
    await delay(100);
    const tasks = memoryStorage['everyday'] || [];
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    task.nextDate = toDateKey(addDays(new Date(), 1));
  },
};
