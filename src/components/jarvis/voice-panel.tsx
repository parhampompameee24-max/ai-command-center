import { Mic, MicOff, Square, Volume2 } from "lucide-react";

import { HudPanel } from "@/components/jarvis/hud-panel";
import { useJarvis } from "@/components/jarvis/jarvis-provider";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { settingsStore } from "@/lib/jarvis/settings";
import { cn } from "@/lib/utils";

export function VoicePanel() {
  const {
    listening,
    transcript,
    voiceError,
    supportsVoice,
    supportsSpeech,
    toggleListening,
    stopVoice,
    say,
  } = useJarvis();
  const settings = useStore(settingsStore);

  return (
    <HudPanel
      title="کنترل صوتی"
      subtitle={settings.language === "fa-IR" ? "فارسی (fa-IR)" : "انگلیسی (en-US)"}
      bodyClassName="space-y-3"
    >
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={toggleListening}
          disabled={!supportsVoice}
          className={cn("size-14 shrink-0 rounded-full", listening && "animate-pulse-ring")}
          variant={listening ? "default" : "secondary"}
          aria-pressed={listening}
          aria-label={listening ? "توقف شنیدن" : "شروع شنیدن"}
        >
          {listening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{listening ? "در حال شنیدن…" : "میکروفن خاموش است"}</p>
          <p className="text-[11px] text-muted-foreground">
            {supportsVoice
              ? "برای گفتن دستور روی میکروفن بزنید."
              : "این مرورگر تشخیص گفتار ندارد؛ از چت یا کنسول استفاده کنید."}
          </p>
        </div>

        <Button type="button" variant="ghost" size="icon" onClick={stopVoice} aria-label="قطع صدا">
          <Square className="size-4" />
        </Button>
      </div>

      <div className="min-h-16 rounded-md border border-border/70 bg-background/50 p-3">
        <p className="mb-1 text-[10px] tracking-[0.2em] text-steel uppercase">متن شنیده‌شده</p>
        <p className="text-sm break-words">
          {transcript || <span className="text-muted-foreground">—</span>}
        </p>
      </div>

      {voiceError && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {voiceError}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={!supportsSpeech}
        onClick={() => say(`${settings.assistantName} آمادهٔ دریافت دستور است.`)}
      >
        <Volume2 className="size-4" />
        آزمایش صدا
      </Button>
    </HudPanel>
  );
}
