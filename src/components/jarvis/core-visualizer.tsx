import { useStore } from "@/hooks/use-store";
import { coreStore, CORE_LABEL } from "@/lib/jarvis/core";
import { settingsStore } from "@/lib/jarvis/settings";
import { cn } from "@/lib/utils";

export function CoreVisualizer({ compact = false }: { compact?: boolean }) {
  const { state, detail, level } = useStore(coreStore);
  const { assistantName } = useStore(settingsStore);

  const tone =
    state === "ERROR"
      ? "text-destructive"
      : state === "OFFLINE"
        ? "text-steel"
        : "text-primary";

  const ringColor =
    state === "ERROR"
      ? "border-destructive/60"
      : state === "OFFLINE"
        ? "border-steel/30"
        : "border-primary/50";

  return (
    <div
      className={cn(
        "relative mx-auto flex aspect-square items-center justify-center overflow-hidden rounded-full",
        compact ? "w-36" : "w-56 sm:w-72 lg:w-80",
        state === "OFFLINE" && "opacity-60",
      )}
      role="img"
      aria-label={`وضعیت هسته: ${CORE_LABEL[state]}`}
    >
      {/* outer rotating dashed ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border border-dashed",
          ringColor,
          state !== "OFFLINE" && "animate-spin-slow",
        )}
        style={{ borderStyle: "dashed" }}
      />
      {/* mid ring */}
      <div
        className={cn(
          "absolute inset-[12%] rounded-full border-2 border-t-transparent border-b-transparent",
          ringColor,
          state === "THINKING" ? "animate-spin-reverse" : "animate-spin-slow",
        )}
      />
      {/* pulsing halo */}
      <div
        className={cn(
          "absolute inset-[22%] rounded-full",
          state === "ERROR" ? "bg-destructive/15" : "bg-primary/10",
          state !== "OFFLINE" && "animate-pulse-ring",
        )}
        style={{
          animationDuration:
            state === "LISTENING" ? "1.2s" : state === "THINKING" ? "1.8s" : "3.2s",
        }}
      />
      {/* reactive listening ring */}
      {state === "LISTENING" && (
        <div
          className="absolute rounded-full border border-primary/70 transition-all duration-150"
          style={{
            inset: `${28 - level * 10}%`,
            boxShadow: `0 0 ${18 + level * 34}px oklch(0.74 0.168 58 / 45%)`,
          }}
        />
      )}
      {/* speaking bars */}
      {state === "SPEAKING" && (
        <div className="absolute inset-x-[26%] bottom-[30%] flex h-8 items-end justify-center gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="w-1 origin-bottom rounded-full bg-primary"
              style={{
                height: "100%",
                animation: `jarvis-bar ${0.6 + (i % 4) * 0.14}s ease-in-out ${i * 0.06}s infinite`,
              }}
            />
          ))}
        </div>
      )}
      {/* center */}
      <div
        className={cn(
          "hud-scanlines relative flex aspect-square w-[46%] flex-col items-center justify-center rounded-full border bg-card/70 text-center",
          state === "ERROR" ? "border-destructive/50" : "border-primary/40",
        )}
        style={{
          boxShadow:
            state === "OFFLINE"
              ? "none"
              : "inset 0 0 30px oklch(0.74 0.168 58 / 18%), 0 0 40px oklch(0.74 0.168 58 / 12%)",
        }}
      >
        <span
          className={cn(
            "font-display text-glow text-lg font-bold tracking-[0.2em] uppercase sm:text-xl",
            tone,
          )}
        >
          {CORE_LABEL[state]}
        </span>
        {!compact && (
          <span className="mt-1 px-2 text-[11px] text-muted-foreground">{detail}</span>
        )}
      </div>

      {!compact && (
        <span className="absolute bottom-1 font-display text-xs tracking-[0.35em] text-steel uppercase">
          {assistantName}
        </span>
      )}
    </div>
  );
}
