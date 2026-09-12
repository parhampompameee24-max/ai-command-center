import {
  Activity,
  Brain,
  Cpu,
  MessageSquare,
  Settings as SettingsIcon,
  TerminalSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type ViewId = "core" | "console" | "system" | "memory" | "activity" | "settings";

export const NAV_ITEMS: {
  id: ViewId;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "core", label: "هسته", hint: "گفت‌وگو و صدا", icon: MessageSquare },
  { id: "console", label: "کنسول", hint: "فرمان‌های متنی", icon: TerminalSquare },
  { id: "system", label: "سیستم", hint: "وضعیت دستگاه", icon: Cpu },
  { id: "memory", label: "حافظه", hint: "یادداشت و دانسته", icon: Brain },
  { id: "activity", label: "رویدادها", hint: "گزارش لحظه‌ای", icon: Activity },
  { id: "settings", label: "تنظیمات", hint: "پیکربندی", icon: SettingsIcon },
];

export function SideNav({ active, onSelect }: { active: ViewId; onSelect: (id: ViewId) => void }) {
  return (
    <nav className="flex flex-col gap-1.5" aria-label="بخش‌های اصلی">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-md border px-3 py-2.5 text-start transition-colors",
              isActive
                ? "border-primary/45 bg-primary/12 text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/40 hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block truncate text-[11px] opacity-70">{item.hint}</span>
            </span>
            <span
              className={cn(
                "h-6 w-0.5 rounded-full transition-colors",
                isActive ? "bg-primary" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
