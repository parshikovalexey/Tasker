import { v4 as uuidv4 } from 'uuid';
import { format, subDays, addDays } from 'date-fns';

export type Task = {
  id: string;
  text: string;
  color?: string;
};

export type StorageData = Record<string, Task[]>;

const today = new Date();
const todayKey = format(today, 'yyyy-MM-dd');
const yesterdayKey = format(subDays(today, 1), 'yyyy-MM-dd');
const tomorrowKey = format(addDays(today, 1), 'yyyy-MM-dd');

let memoryStorage: StorageData = {
  'goals': [
    { id: uuidv4(), text: 'Выучить React полностью', color: 'blue' }
  ],
  'everyday': [
    { id: uuidv4(), text: 'Зарядка 15 минут' },
    { id: uuidv4(), text: 'Выпить 2л воды' }
  ],
  [yesterdayKey]: [
    { id: uuidv4(), text: 'Забытая задача с длинной ссылкой https://vk.com/feed?w=wall-123456_789' }
  ],
  [todayKey]: [
    { id: uuidv4(), text: 'Сделать тестовое задание для VK' },
    { id: uuidv4(), text: 'Купить продукты' }
  ],
  [tomorrowKey]: [
    { id: uuidv4(), text: 'Встреча с командой' }
  ],
  'done': []
};

// Simulate async delay for realistic feel
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockStorage = {
  async getAll(): Promise<StorageData> {
    await delay(100);
    return JSON.parse(JSON.stringify(memoryStorage));
  },

  async addTask(key: string, text: string, color?: string): Promise<Task> {
    await delay(100);
    const newTask = { id: uuidv4(), text, color };
    if (!memoryStorage[key]) memoryStorage[key] = [];
    memoryStorage[key].push(newTask);
    return newTask;
  },

  async moveTask(taskId: string, fromKey: string, toKey: string, newText?: string): Promise<void> {
    await delay(100);
    const fromList = memoryStorage[fromKey] || [];
    const taskIndex = fromList.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    const [task] = fromList.splice(taskIndex, 1);
    if (newText) task.text = newText;
    
    if (!memoryStorage[toKey]) memoryStorage[toKey] = [];
    memoryStorage[toKey].push(task);
  },

  async deleteTask(taskId: string, key: string): Promise<void> {
    await delay(100);
    if (!memoryStorage[key]) return;
    memoryStorage[key] = memoryStorage[key].filter(t => t.id !== taskId);
  }
};
