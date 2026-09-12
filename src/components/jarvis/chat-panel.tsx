import { Eraser, SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HudPanel } from "@/components/jarvis/hud-panel";
import { useJarvis } from "@/components/jarvis/jarvis-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/hooks/use-store";
import { providers } from "@/lib/jarvis/providers";
import { settingsStore } from "@/lib/jarvis/settings";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["ساعت چند است؟", "وضعیت سیستم", "خودت را معرفی کن", "یک یادداشت بساز"];

export function ChatPanel({ className }: { className?: string }) {
  const { messages, sending, sendMessage, clearChat } = useJarvis();
  const settings = useStore(settingsStore);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const submit = async () => {
    const text = draft;
    if (!text.trim()) return;
    setDraft("");
    await sendMessage(text);
    inputRef.current?.focus();
  };

  return (
    <HudPanel
      title="گفت‌وگو"
      subtitle={providers[settings.provider].label}
      className={className}
      bodyClassName="flex min-h-0 flex-col gap-3 p-0"
      actions={
        <Button variant="ghost" size="sm" onClick={clearChat} aria-label="پاک کردن گفت‌وگو">
          <Eraser className="size-4" />
        </Button>
      }
    >
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pt-4">
        {messages.length === 0 && (
          <div className="space-y-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              گفت‌وگو را شروع کنید یا یکی از این‌ها را بزنید:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void sendMessage(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.role === "user" ? "justify-start" : "justify-end")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-6 break-words whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/70 bg-card/60 text-foreground",
              )}
            >
              {m.content || (m.pending ? "…" : "")}
              {m.pending && m.content && <span className="animate-pulse">▍</span>}
              <span
                className={cn(
                  "mt-1 block text-[10px] opacity-60",
                  m.role === "user" ? "text-primary-foreground" : "text-muted-foreground",
                )}
                suppressHydrationWarning
              >
                {new Date(m.at).toLocaleTimeString("fa-IR")}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        className="flex items-end gap-2 border-t border-border/70 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          rows={1}
          placeholder="پیام خود را بنویسید…"
          className="max-h-32 min-h-11 resize-none bg-background/60"
        />
        <Button type="submit" size="icon" className="size-11" disabled={sending}>
          <SendHorizonal className="size-4" />
          <span className="sr-only">ارسال</span>
        </Button>
      </form>
    </HudPanel>
  );
}
