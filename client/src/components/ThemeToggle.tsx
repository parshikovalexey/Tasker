import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-foreground/70" />
      ) : (
        <Sun className="h-5 w-5 text-foreground/70" />
      )}
    </Button>
  );
}
