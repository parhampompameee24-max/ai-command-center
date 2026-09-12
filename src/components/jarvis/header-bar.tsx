import { Menu, Wifi, WifiOff, ShieldCheck, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { androidBridge, windowsBridge } from "@/lib/jarvis/bridges";
import { coreStore, CORE_LABEL } from "@/lib/jarvis/core";
import { settingsStore } from "@/lib/jarvis/settings";
import { cn } from "@/lib/utils";

function Pill({ label, ok, icon }: { label: string; ok: boolean; icon?: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] whitespace-nowrap",
        ok
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-steel/30 bg-secondary/40 text-steel",
      )}
    >
      {icon}
      {label}
    </span>
  );
}

export function HeaderBar({ onMenu }: { onMenu: () => void }) {
  const { assistantName, privileged } = useStore(settingsStore);
  const { state } = useStore(coreStore);
  const [clock, setClock] = useState("--:--:--");
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleTimeString("fa-IR"));
      setOnline(navigator.onLine);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="hud-panel sticky top-0 z-30 flex items-center justify-between gap-3 rounded-none border-x-0 border-t-0 px-3 py-2 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenu}
          aria-label="باز کردن منو"
        >
          <Menu className="size-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="font-display text-glow truncate text-sm font-bold tracking-[0.3em] text-primary uppercase sm:text-base">
            {assistantName}
          </h1>
          <p className="truncate text-[10px] tracking-[0.2em] text-steel uppercase">
            مرکز فرماندهی شخصی
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <Pill
          label={online ? "شبکه متصل" : "شبکه قطع"}
          ok={online}
          icon={online ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
        />
        <Pill label="پل ویندوز" ok={windowsBridge.isAvailable()} />
        <Pill label="پل اندروید" ok={androidBridge.isAvailable()} />
        <Pill
          label={privileged ? "دسترسی باز" : "دسترسی محدود"}
          ok={privileged}
          icon={
            privileged ? <ShieldCheck className="size-3" /> : <ShieldAlert className="size-3" />
          }
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-[11px] tracking-widest text-muted-foreground sm:inline">
          {CORE_LABEL[state]}
        </span>
        <span className="font-mono text-sm tabular-nums text-primary/90" suppressHydrationWarning>
          {clock}
        </span>
      </div>
    </header>
  );
}
