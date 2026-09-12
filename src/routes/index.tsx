import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ActivityPanel } from "@/components/jarvis/activity-panel";
import { ChatPanel } from "@/components/jarvis/chat-panel";
import { ConsolePanel } from "@/components/jarvis/console-panel";
import { CoreVisualizer } from "@/components/jarvis/core-visualizer";
import { HeaderBar } from "@/components/jarvis/header-bar";
import { HudPanel } from "@/components/jarvis/hud-panel";
import { JarvisProvider } from "@/components/jarvis/jarvis-provider";
import { MemoryPanel } from "@/components/jarvis/memory-panel";
import { SettingsPanel } from "@/components/jarvis/settings-panel";
import { SideNav, NAV_ITEMS, type ViewId } from "@/components/jarvis/side-nav";
import { SystemPanel } from "@/components/jarvis/system-panel";
import { VoicePanel } from "@/components/jarvis/voice-panel";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "جارویس | مرکز فرماندهی دستیار شخصی" },
      {
        name: "description",
        content:
          "مرکز فرماندهی جارویس: کنترل صوتی، گفت‌وگوی هوشمند، کنسول فرمان، حافظهٔ ماندگار و گزارش رویدادها در یک داشبورد آینده‌نگر.",
      },
      { property: "og:title", content: "جارویس | مرکز فرماندهی دستیار شخصی" },
      {
        property: "og:description",
        content:
          "داشبورد دستیار شخصی با کنترل صوتی، کنسول فرمان، حافظهٔ ماندگار و گزارش زندهٔ رویدادها.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function CoreView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
      <div className="order-2 flex min-h-[28rem] flex-col xl:order-1">
        <ChatPanel className="min-h-[28rem] flex-1" />
      </div>
      <div className="order-1 space-y-4 xl:order-2">
        <HudPanel title="هستهٔ جارویس" bodyClassName="pt-8 pb-10">
          <CoreVisualizer />
        </HudPanel>
        <VoicePanel />
      </div>
    </div>
  );
}

function Index() {
  const [view, setView] = useState<ViewId>("core");
  const [navOpen, setNavOpen] = useState(false);
  const current = NAV_ITEMS.find((i) => i.id === view)!;

  const select = (id: ViewId) => {
    setView(id);
    setNavOpen(false);
  };

  return (
    <JarvisProvider>
      <div dir="rtl" className="min-h-screen bg-background text-foreground">
        <HeaderBar onMenu={() => setNavOpen(true)} />

        <div className="mx-auto flex w-full max-w-[120rem] gap-4 p-3 sm:p-4">
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="hud-panel hud-corners sticky top-20 p-3">
              <SideNav active={view} onSelect={select} />
              <div className="mt-4 border-t border-border/60 pt-4">
                <CoreVisualizer compact />
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg tracking-[0.2em] text-primary uppercase">
                {current.label}
              </h2>
              <span className="text-xs text-muted-foreground">{current.hint}</span>
            </div>

            {view === "core" && <CoreView />}
            {view === "console" && <ConsolePanel />}
            {view === "system" && <SystemPanel />}
            {view === "memory" && <MemoryPanel />}
            {view === "activity" && <ActivityPanel />}
            {view === "settings" && <SettingsPanel />}
          </main>
        </div>

        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetContent side="right" className="w-72 p-4">
            <SheetTitle className="font-display mb-4 text-sm tracking-[0.25em] text-primary uppercase">
              بخش‌ها
            </SheetTitle>
            <SideNav active={view} onSelect={select} />
          </SheetContent>
        </Sheet>
      </div>
    </JarvisProvider>
  );
}
