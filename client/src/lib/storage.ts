/**
 * Резолвер хранилища.
 *
 * VITE_USE_MOCK_STORAGE=true  → in-memory mockStorage (seed-данные, без VK Bridge)
 * VITE_USE_MOCK_STORAGE=false → vkStorage через VK Bridge
 *                                 DEV  → vk-bridge-mock (симуляция)
 *                                 PROD → настоящий vk-bridge
 *
 * Оба хранилища реализуют одинаковый интерфейс ITaskStorage.
 */

import { mockStorage, type Task, type StorageData } from './mockStorage';
import { vkStorage } from './vkStorage';

export type { Task, StorageData };

export interface ITaskStorage {
  getAll(): Promise<StorageData>;
  loadKey(key: string): Promise<Task[]>;
  getAllKeys(): Promise<string[]>;
  getFullSnapshot(): Promise<{ keys: string[]; data: StorageData }>;
  clearKey(key: string): Promise<void>;
  addTask(key: string, text: string, color?: string): Promise<Task>;
  moveTask(taskId: string, fromKey: string, toKey: string, newText?: string, newColor?: string): Promise<void>;
  deleteTask(taskId: string, key: string): Promise<void>;
  completeEverydayTask(taskId: string): Promise<void>;
}

/**
 * VITE_USE_MOCK_STORAGE=true  → mockStorage (in-memory с seed-данными)
 * иначе                       → vkStorage   (VK Bridge: мок в dev, реальный в prod)
 */
const useMockStorage = import.meta.env.VITE_USE_MOCK_STORAGE === 'true';

export const storage: ITaskStorage = useMockStorage ? mockStorage : vkStorage;
