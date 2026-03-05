/**
 * VK Bridge resolver.
 *
 * Выбор реализации bridge зависит исключительно от режима сборки Vite:
 *   DEV  → vk-bridge-mock  (симуляция VK API, без реального окружения ВКонтакте)
 *   PROD → настоящий vk-bridge
 *
 * Флаг VITE_USE_MOCK_STORAGE управляет только выбором хранилища (storage.ts),
 * но не выбором bridge.
 */

import realBridge from '@vkontakte/vk-bridge';
import mockBridge from '@vkontakte/vk-bridge-mock';

export const isMock = import.meta.env.DEV;
export const bridge = isMock ? mockBridge : realBridge;

// Инициализация моста (нужна для реального окружения VK)
bridge.send('VKWebAppInit', {}).catch(() => {
  // В мок-режиме или вне VK — ожидаемо, игнорируем
});
