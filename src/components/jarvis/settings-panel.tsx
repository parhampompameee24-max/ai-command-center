import { useEffect, useState } from "react";

import { HudPanel } from "@/components/jarvis/hud-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/hooks/use-store";
import { androidBridge, windowsBridge } from "@/lib/jarvis/bridges";
import { log } from "@/lib/jarvis/logger";
import { providers } from "@/lib/jarvis/providers";
import { resetSettings, settingsStore, updateSettings } from "@/lib/jarvis/settings";
import { listVoices, synthesisSupported } from "@/lib/jarvis/speech";
import type { ProviderId } from "@/lib/jarvis/types";

export function SettingsPanel() {
  const settings = useStore(settingsStore);
  const [voices, setVoices] = useState<{ uri: string; label: string }[]>([]);

  useEffect(() => {
    if (!synthesisSupported()) return;
    const load = () =>
      setVoices(
        listVoices().map((v) => ({ uri: v.voiceURI, label: `${v.name} — ${v.lang}` })),
      );
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <HudPanel title="هویت و زبان" bodyClassName="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assistant-name">نام دستیار</Label>
          <Input
            id="assistant-name"
            value={settings.assistantName}
            onChange={(e) => updateSettings({ assistantName: e.target.value })}
            className="bg-background/60"
          />
        </div>
        <div className="space-y-2">
          <Label>زبان گفت‌وگو</Label>
          <Select
            value={settings.language}
            onValueChange={(v) => updateSettings({ language: v as "fa-IR" | "en-US" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fa-IR">فارسی (fa-IR)</SelectItem>
              <SelectItem value="en-US">English (en-US)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2.5">
          <div>
            <p className="text-sm">شنیدن خودکار پس از پاسخ</p>
            <p className="text-[11px] text-muted-foreground">
              میکروفن بعد از هر پاسخ دوباره فعال می‌شود.
            </p>
          </div>
          <Switch
            checked={settings.autoListen}
            onCheckedChange={(v) => updateSettings({ autoListen: v })}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2.5">
          <div>
            <p className="text-sm">پاسخ صوتی</p>
            <p className="text-[11px] text-muted-foreground">خواندن پاسخ‌ها با بلندگو.</p>
          </div>
          <Switch
            checked={settings.soundEffects}
            onCheckedChange={(v) => updateSettings({ soundEffects: v })}
          />
        </div>
      </HudPanel>

      <HudPanel title="صدا" subtitle="موتور گفتار مرورگر" bodyClassName="space-y-4">
        <div className="space-y-2">
          <Label>صدای گوینده</Label>
          <Select
            value={settings.voiceURI || "auto"}
            onValueChange={(v) => updateSettings({ voiceURI: v === "auto" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">خودکار</SelectItem>
              {voices.map((v) => (
                <SelectItem key={v.uri} value={v.uri}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!voices.length && (
            <p className="text-[11px] text-muted-foreground">
              این مرورگر فهرست صداها را در اختیار نگذاشته است.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>سرعت گفتار: {settings.rate.toFixed(1)}</Label>
          <Slider
            value={[settings.rate]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([v]) => updateSettings({ rate: v })}
          />
        </div>
        <div className="space-y-2">
          <Label>زیر و بمی: {settings.pitch.toFixed(1)}</Label>
          <Slider
            value={[settings.pitch]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([v]) => updateSettings({ pitch: v })}
          />
        </div>
      </HudPanel>

      <HudPanel title="موتور پاسخ‌گویی" bodyClassName="space-y-4">
        <div className="space-y-2">
          <Label>ارائه‌دهنده</Label>
          <Select
            value={settings.provider}
            onValueChange={(v) => {
              updateSettings({ provider: v as ProviderId });
              log("system", `ارائه‌دهنده به ${v} تغییر کرد`, "info");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(providers).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] leading-5 text-muted-foreground">
            {providers[settings.provider].description}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endpoint">نشانی مدل محلی</Label>
          <Input
            id="endpoint"
            dir="ltr"
            value={settings.localEndpoint}
            onChange={(e) => updateSettings({ localEndpoint: e.target.value })}
            className="bg-background/60 font-mono text-xs"
          />
        </div>
      </HudPanel>

      <HudPanel title="دسترسی و پل‌ها" bodyClassName="space-y-4">
        <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2.5">
          <div>
            <p className="text-sm">دسترسی سطح بالا</p>
            <p className="text-[11px] text-muted-foreground">
              اجازهٔ اجرای فرمان‌های حساس در کنسول.
            </p>
          </div>
          <Switch
            checked={settings.privileged}
            onCheckedChange={(v) => {
              updateSettings({ privileged: v });
              log("system", v ? "دسترسی سطح بالا باز شد" : "دسترسی محدود شد", "warning");
            }}
          />
        </div>
        {[
          { name: "پل ویندوز", ok: windowsBridge.isAvailable() },
          { name: "پل اندروید", ok: androidBridge.isAvailable() },
        ].map((b) => (
          <div
            key={b.name}
            className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2.5 text-sm"
          >
            <span>{b.name}</span>
            <span className={b.ok ? "text-primary" : "text-steel"}>
              {b.ok ? "متصل" : "متصل نیست"}
            </span>
          </div>
        ))}
        <Button variant="outline" className="w-full" onClick={resetSettings}>
          بازگرداندن تنظیمات پیش‌فرض
        </Button>
      </HudPanel>
    </div>
  );
}
