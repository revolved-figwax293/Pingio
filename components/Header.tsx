"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

export function Header() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="sticky top-0 z-50 w-full bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[80px] flex items-center justify-between">
        {/* Left — Logo + Name */}
        <div className="flex items-center">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-[32px] h-[32px]">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <path
                d="M2 12h3.5l3-8 4 16 3-10 2 2H22"
                stroke="url(#logoGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="font-bold text-[28px] tracking-[-0.02em] bg-gradient-to-r from-[#10B981] to-[#3B82F6] bg-clip-text text-transparent">
            Pingio
          </h2>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1.5">
          {/* GitHub repo link */}
          <a
            href="https://github.com/rashidbuilds/Pingio"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
          >
            <svg viewBox="0 0 24 24" className="w-[24px] h-[24px]" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Portfolio link */}
          <a
            href="https://www.rashidbuilds.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Portfolio"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-[24px] h-[24px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          {/* Divider */}
          {/* <div className="w-px h-6 bg-border/60 mx-1.5" /> */}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150"
          >
            {theme === "dark" ? (
              <Sun className="w-[24px] h-[24px]" />
            ) : (
              <Moon className="w-[24px] h-[24px]" />
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
}