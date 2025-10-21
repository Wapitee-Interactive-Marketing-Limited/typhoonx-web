"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name || '');

  return (
    <nav
      className={cn(
        "fixed top-5 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto",
        className,
      )}
      style={{ willChange: 'transform' }}
    >
      <div className="flex items-center gap-2 bg-white/95 dark:bg-zinc-900/95 border-2 border-black/20 dark:border-white/20 backdrop-blur-xl py-2 px-3 rounded-full shadow-2xl">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-all duration-200",
                isActive 
                  ? "bg-black text-white dark:bg-white dark:text-black" 
                  : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5",
              )}
            >
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


