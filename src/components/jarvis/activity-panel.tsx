import { useState } from "react";

import { HudPanel } from "@/components/jarvis/hud-panel";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { clearLog, logStore } from "@/lib/jarvis/logger";
import type { LogLevel, LogSource } from "@/lib/jarvis/types";
import { cn } from "@/lib/utils";

const LEVELS: { id: LogLevel | "all"; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "info", label: "اطلاع" },
  { id: "success", label: "موفق" },
  { id: "warning", label: "هشدار" },
  { id: "error", label: "خطا" },
];

const SOURCE_LABEL: Record<LogSource, string> = {
  system: "سیستم",
  voice: "صدا",
  command: "فرمان",
  ai: "هوش مصنوعی",
  memory: "حافظه",
};

const LEVEL_CLASS: Record<LogLevel, string> = {
  info: "text-steel",
  success: "text-primary",
  warning: "text-warning",
  error: "text-destructive",
};

export function ActivityPanel() {
  const { entries } = useStore(logStore);
  const [level, setLevel] = useState<LogLevel | "all">("all");

  const visible = entries.filter((e) => level === "all" || e.level === level);

  return (
    <HudPanel
      title="گزارش رویدادها"
      subtitle={`${entries.length} رویداد ثبت شده`}
      bodyClassName="space-y-3"
      actions={
        <Button variant="ghost" size="sm" onClick={clearLog} disabled={!entries.length}>
          پاک کردن
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLevel(l.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              level === l.id
                ? "border-primary/50 bg-primary/12 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>

      <ul className="max-h-[58vh] space-y-1.5 overflow-y-auto font-mono text-xs">
        {visible.length === 0 && (
          <li className="py-8 text-center font-sans text-sm text-muted-foreground">
            رویدادی ثبت نشده است.
          </li>
        )}
        {visible.map((e) => (
          <li
            key={e.id}
            className="flex items-start gap-2 rounded border border-border/50 bg-background/40 px-2.5 py-1.5"
          >
            <span className="tabular-nums text-muted-foreground" suppressHydrationWarning>
              {new Date(e.at).toLocaleTimeString("fa-IR")}
            </span>
            <span className={cn("shrink-0", LEVEL_CLASS[e.level])}>[{SOURCE_LABEL[e.source]}]</span>
            <span className="min-w-0 flex-1 font-sans break-words">{e.message}</span>
          </li>
        ))}
      </ul>
    </HudPanel>
  );
}
