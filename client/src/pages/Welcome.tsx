import { Link } from "wouter";
import { ArrowRight, CheckSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Welcome() {
  const userName = "Иван"; // Hardcoded as per instructions for MVP

  return (
    <div className="mobile-container flex flex-col justify-center px-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-sm mx-auto w-full text-center">
        
        <div className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 rotate-12 hover:rotate-0 transition-all duration-500">
          <CheckSquare className="w-12 h-12 text-white -rotate-12 hover:rotate-0 transition-transform duration-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-display font-bold text-foreground">
            Привет, {userName}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Готов продуктивно провести день? Твой минималистичный планнер ждет.
          </p>
        </div>

        <Link 
          href="/main" 
          className="mt-8 w-full group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-2xl bg-primary px-8 font-medium text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98]"
        >
          <span className="mr-2 text-lg">Погнали</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
        </Link>

      </div>
      
      <div className="py-8 text-center text-sm text-muted-foreground opacity-60">
        VK Mini App Clone
      </div>
    </div>
  );
}
