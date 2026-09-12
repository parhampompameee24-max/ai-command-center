import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { HudPanel } from "@/components/jarvis/hud-panel";
import { Button } from "@/components/ui/button";
import { androidBridge, windowsBridge } from "@/lib/jarvis/bridges";
import { bridgeRows, readBrowserStats, type SystemRow } from "@/lib/jarvis/system";
import { cn } from "@/lib/utils";

function Row({ row }: { row: SystemRow }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{row.label}</span>
      <span className={cn("font-mono text-xs", row.available ? "text-primary" : "text-steel")}>
        {row.value}
      </span>
    </div>
  );
}

export function SystemPanel() {
  const [rows, setRows] = useState<SystemRow[]>([]);

  const refresh = useCallback(() => {
    void readBrowserStats().then(setRows);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <HudPanel
        title="خوانده‌شده از مرورگر"
        subtitle="مقادیر واقعی و زنده"
        actions={
          <Button variant="ghost" size="icon" onClick={refresh} aria-label="بازخوانی">
            <RefreshCw className="size-4" />
          </Button>
        }
        bodyClassName="p-4 pt-1"
      >
        {rows.map((r) => (
          <Row key={r.label} row={r} />
        ))}
      </HudPanel>

      <div className="space-y-4">
        <HudPanel
          title="سطح سیستم‌عامل"
          subtitle="بدون برنامهٔ کمکی قابل خواندن نیست"
          bodyClassName="p-4 pt-1"
        >
          {bridgeRows.map((r) => (
            <Row key={r.label} row={r} />
          ))}
        </HudPanel>

        <HudPanel title="پل‌های دستگاه" bodyClassName="space-y-3">
          {[
            { name: "پل ویندوز", ok: windowsBridge.isAvailable() },
            { name: "پل اندروید", ok: androidBridge.isAvailable() },
          ].map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
            >
              <span className="text-sm">{b.name}</span>
              <span className={cn("text-xs", b.ok ? "text-primary" : "text-steel")}>
                {b.ok ? "متصل" : "متصل نیست"}
              </span>
            </div>
          ))}
          <p className="text-[11px] leading-5 text-muted-foreground">
            مرورگر اجازهٔ خواندن پردازنده، رم یا فایل‌های دستگاه را نمی‌دهد. این بخش‌ها هیچ عدد
            ساختگی نشان نمی‌دهند و تنها با نصب یک برنامهٔ کمکی روی ویندوز یا اندروید فعال می‌شوند.
          </p>
        </HudPanel>
      </div>
    </div>
  );
}
