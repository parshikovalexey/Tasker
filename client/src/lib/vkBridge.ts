/**
 * VK Bridge resolver.
 *
 * Выбор реализации bridge:
 *   DEV  (VITE_USE_MOCK_STORAGE=true или режим разработки) → vk-bridge-mock
 *   PROD (VITE_USE_MOCK_STORAGE=false)                     → настоящий vk-bridge
 *
 * Чтобы принудительно использовать мок в любом режиме:
 *   добавьте VITE_USE_MOCK_STORAGE=true в .env
 * Чтобы принудительно использовать реальный bridge в dev:
 *   добавьте VITE_USE_MOCK_STORAGE=false в .env
 */

import realBridge from '@vkontakte/vk-bridge';
import mockBridge from '@vkontakte/vk-bridge-mock';

const envFlag = import.meta.env.VITE_USE_MOCK_STORAGE;
const useMock = envFlag !== undefined ? envFlag === 'true' : import.meta.env.DEV;

export const bridge = useMock ? mockBridge : realBridge;
export const isMock = useMock;

// Инициализация моста (нужна для реального окружения VK)
bridge.send('VKWebAppInit', {}).catch(() => {
  // В мок-режиме или вне VK — ожидаемо, игнорируем
});
