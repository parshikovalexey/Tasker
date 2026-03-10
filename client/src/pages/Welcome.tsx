import { ArrowRight, CheckSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useVKUser } from "@/hooks/use-vk-user";
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export default function Welcome() {
  const userState = useVKUser();
  const navigator = useRouteNavigator();

  const handleStart = () => {
    navigator.push('/main');
  };

  const firstName =
    userState.status === "success" ? userState.user.first_name : null;

  const avatarUrl =
    userState.status === "success" ? userState.user.photo_200 : null;

  return (
    <div className="mobile-container flex flex-col justify-center px-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-sm mx-auto w-full text-center">

        {/* Аватар / иконка */}
        {avatarUrl ? (
          <div className="relative">
            <img
              src={avatarUrl}
              alt={firstName ?? ""}
              data-testid="img-avatar"
              className="w-24 h-24 rounded-3xl object-cover shadow-2xl shadow-primary/20"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 rotate-12 hover:rotate-0 transition-all duration-500">
            <CheckSquare className="w-12 h-12 text-white -rotate-12 hover:rotate-0 transition-transform duration-500" />
          </div>
        )}

        {/* Приветствие */}
        <div className="space-y-3">
          {userState.status === "loading" ? (
            <div className="space-y-2">
              <div
                data-testid="skeleton-name"
                className="h-10 w-48 mx-auto bg-muted animate-pulse rounded-xl"
              />
              <div className="h-5 w-64 mx-auto bg-muted animate-pulse rounded-lg opacity-60" />
            </div>
          ) : (
            <>
              <h1
                data-testid="text-greeting"
                className="text-4xl font-display font-bold text-foreground"
              >
                {firstName ? `Привет, ${firstName}! 👋` : "Привет! 👋"}
              </h1>
              <p className="text-lg text-muted-foreground">
                Готов продуктивно провести день? Твой минималистичный планнер ждёт.
              </p>
            </>
          )}
        </div>

        {/* Кнопка перехода */}
        <button
          onClick={handleStart}
          data-testid="link-start"
          className="mt-8 w-full group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-primary px-8 font-medium text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98]"
        >
          <span className="mr-2 text-lg">Погнали</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
        </button>

      </div>

      <div className="py-8 text-center text-sm text-muted-foreground opacity-60">
        VK Mini App
      </div>
    </div>
  );
}
