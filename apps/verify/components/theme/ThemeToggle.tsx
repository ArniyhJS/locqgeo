"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";

function useIsMounted() {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors opacity-70 ${className}`}
        disabled
      >
        <span className="w-4 h-4 block" />
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Current theme: ${theme}. Click to switch theme.`}
      title={`Theme: ${theme || "system"} (Click to cycle)`}
      className={`relative p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all active:scale-[0.95] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none cursor-pointer ${className}`}
    >
      {theme === "light" && <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200" />}
      {theme === "dark" && <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-200" />}
      {(theme === "system" || !theme) && <Laptop className="w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200" />}
    </button>
  );
}
