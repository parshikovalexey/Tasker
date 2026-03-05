import { RouterProvider } from '@vkontakte/vk-mini-apps-router';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { router } from './routesConfig';
import { useActiveVkuiLocation, useGetPanelForView } from '@vkontakte/vk-mini-apps-router';
import Welcome from "@/pages/Welcome";
import Main from "@/pages/Main";

// Компонент с хуками роутера (должен быть внутри RouterProvider)
function AppContent() {
  const { view: activeView } = useActiveVkuiLocation();
  const activePanel = useGetPanelForView('main_view');

  // Ручная эмуляция Root/View, так как у вас нет VKUI
  // Просто рендерим нужный компонент на основе activePanel
  if (activePanel === 'welcome_panel') {
    return <Welcome />;
  }

  if (activePanel === 'main_panel') {
    return <Main />;
  }

  // Если ни один панель не активна — показываем 404 или редирект
  return <div>404 - Страница не найдена</div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router}>
          <div className="min-h-screen bg-muted/20 flex items-center justify-center">
            <AppContent />
          </div>
          <Toaster />
        </RouterProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;