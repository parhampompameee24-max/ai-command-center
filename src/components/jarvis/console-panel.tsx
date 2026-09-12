import { useEffect, useRef, useState } from "react";

import { HudPanel } from "@/components/jarvis/hud-panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { commands, runCommand, TIER_LABEL } from "@/lib/jarvis/commands";
import { cn } from "@/lib/utils";

interface Line {
  id: number;
  kind: "in" | "out" | "err";
  text: string;
}

let counter = 0;

export function ConsolePanel() {
  const [lines, setLines] = useState<Line[]>([
    { id: counter++, kind: "out", text: "کنسول جارویس آماده است. help را بزنید." },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [pending, setPending] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const push = (kind: Line["kind"], text: string) =>
    setLines((prev) => [...prev, { id: counter++, kind, text }]);

  const execute = async (input: string, confirmed = false) => {
    const res = await runCommand(input, { confirmed });
    if (res.needsConfirm) {
      setPending(input);
      return;
    }
    if (res.output === "__CLEAR__") {
      setLines([]);
      return;
    }
    push(res.ok ? "out" : "err", res.output);
  };

  const submit = async () => {
    const input = value.trim();
    if (!input) return;
    push("in", input);
    setHistory((h) => [input, ...h].slice(0, 50));
    setCursor(-1);
    setValue("");
    await execute(input);
    inputRef.current?.focus();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <HudPanel
        title="کنسول فرمان"
        subtitle="اجرای مستقیم دستورها"
        bodyClassName="flex h-[min(60vh,32rem)] flex-col gap-3 p-0"
      >
        <div className="hud-scanlines min-h-0 flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-6">
          {lines.map((l) => (
            <pre
              key={l.id}
              dir="auto"
              className={cn(
                "break-words whitespace-pre-wrap",
                l.kind === "in" && "text-primary",
                l.kind === "err" && "text-destructive",
                l.kind === "out" && "text-foreground/85",
              )}
            >
              {l.kind === "in" ? `› ${l.text}` : l.text}
            </pre>
          ))}
          <div ref={endRef} />
        </div>
        <form
          className="flex items-center gap-2 border-t border-border/70 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <span className="font-mono text-primary">›</span>
          <Input
            ref={inputRef}
            dir="ltr"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const next = Math.min(cursor + 1, history.length - 1);
                if (next >= 0) {
                  setCursor(next);
                  setValue(history[next] ?? "");
                }
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = cursor - 1;
                setCursor(next);
                setValue(next >= 0 ? (history[next] ?? "") : "");
              }
            }}
            placeholder="help"
            className="bg-background/60 font-mono"
            autoComplete="off"
          />
          <Button type="submit" size="sm">
            اجرا
          </Button>
        </form>
      </HudPanel>

      <HudPanel title="فرمان‌ها" subtitle="با سطح دسترسی" bodyClassName="space-y-2 p-3">
        {commands.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => {
              setValue(c.usage.split(" ")[0] ?? c.name);
              inputRef.current?.focus();
            }}
            className="w-full rounded-md border border-border/60 px-3 py-2 text-start transition-colors hover:border-primary/50"
          >
            <span className="block font-mono text-xs text-primary" dir="ltr">
              {c.usage}
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {c.description} · {TIER_LABEL[c.tier]}
            </span>
          </button>
        ))}
      </HudPanel>

      <AlertDialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>اجرای این فرمان تأیید می‌خواهد</AlertDialogTitle>
            <AlertDialogDescription>
              فرمان «{pending}» تغییری برگشت‌ناپذیر ایجاد می‌کند. مطمئن هستید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const cmd = pending!;
                setPending(null);
                void execute(cmd, true);
              }}
            >
              اجرا کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
