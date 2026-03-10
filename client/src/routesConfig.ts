import { createHashRouter } from '@vkontakte/vk-mini-apps-router';

export const ROUTES = {
  WELCOME: '/',
  MAIN: '/main'
} as const;

export const router = createHashRouter([
  {
    path: ROUTES.WELCOME,
    panel: 'welcome_panel',
    view: 'main_view',
  },
  {
    path: ROUTES.MAIN,
    panel: 'main_panel',
    view: 'main_view',
  }
]);
