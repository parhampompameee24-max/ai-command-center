import { windowsBridge, androidBridge } from "./bridges";
import { getCoreState, CORE_LABEL } from "./core";
import { log } from "./logger";
import { clearMemory, memoryStore, remember, searchMemory } from "./memory";
import { settingsStore, updateSettings, resetSettings } from "./settings";
import type { CommandResult, PermissionTier } from "./types";

export interface CommandDef {
  name: string;
  tier: PermissionTier;
  usage: string;
  description: string;
  run: (args: string[]) => Promise<string> | string;
}

export const TIER_LABEL: Record<PermissionTier, string> = {
  PUBLIC: "عمومی",
  SAFE: "ایمن",
  CONFIRM: "نیازمند تأیید",
  PRIVILEGED: "سطح بالا",
  BLOCKED: "مسدود",
};

export const commands: CommandDef[] = [
  {
    name: "help",
    tier: "PUBLIC",
    usage: "help",
    description: "فهرست فرمان‌ها",
    run: () =>
      commands
        .map((c) => `${c.usage.padEnd(22, " ")} — ${c.description} [${TIER_LABEL[c.tier]}]`)
        .join("\n"),
  },
  {
    name: "time",
    tier: "PUBLIC",
    usage: "time",
    description: "ساعت دستگاه",
    run: () => new Date().toLocaleTimeString("fa-IR"),
  },
  {
    name: "date",
    tier: "PUBLIC",
    usage: "date",
    description: "تاریخ امروز",
    run: () => new Date().toLocaleDateString("fa-IR", { dateStyle: "full" }),
  },
  {
    name: "whoami",
    tier: "PUBLIC",
    usage: "whoami",
    description: "معرفی دستیار",
    run: () => {
      const s = settingsStore.get();
      return `${s.assistantName} · زبان ${s.language} · ارائه‌دهنده ${s.provider} · دسترسی ${
        s.privileged ? "باز" : "محدود"
      }`;
    },
  },
  {
    name: "status",
    tier: "PUBLIC",
    usage: "status",
    description: "وضعیت هسته و اتصال",
    run: () => {
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;
      return [
        `هسته: ${CORE_LABEL[getCoreState()]}`,
        `شبکه: ${online ? "متصل" : "قطع"}`,
        `پل ویندوز: ${windowsBridge.isAvailable() ? "متصل" : "متصل نیست"}`,
        `پل اندروید: ${androidBridge.isAvailable() ? "متصل" : "متصل نیست"}`,
        `آیتم‌های حافظه: ${memoryStore.get().items.length}`,
      ].join("\n");
    },
  },
  {
    name: "memory",
    tier: "SAFE",
    usage: "memory [search|add] ...",
    description: "جست‌وجو یا افزودن به حافظه",
    run: (args) => {
      const [sub, ...rest] = args;
      if (sub === "add") {
        if (!rest.length) return "متن یادداشت را بنویسید: memory add ...";
        remember("note", rest.join(" "));
        return "در حافظه ثبت شد.";
      }
      const found = searchMemory(rest.join(" "));
      if (!found.length) return "چیزی پیدا نشد.";
      return found
        .slice(0, 10)
        .map((i) => `• [${i.kind}] ${i.content}`)
        .join("\n");
    },
  },
  {
    name: "settings",
    tier: "SAFE",
    usage: "settings [key value]",
    description: "نمایش یا تغییر تنظیمات",
    run: (args) => {
      const s = settingsStore.get();
      if (!args.length) return JSON.stringify(s, null, 2);
      const [key, ...rest] = args;
      const value = rest.join(" ");
      if (!(key in s)) return `کلید ناشناخته: ${key}`;
      const current = (s as unknown as Record<string, unknown>)[key];
      let parsed: unknown = value;
      if (typeof current === "number") parsed = Number(value);
      if (typeof current === "boolean") parsed = value === "true" || value === "1";
      updateSettings({ [key]: parsed } as never);
      return `${key} = ${String(parsed)}`;
    },
  },
  {
    name: "voice",
    tier: "SAFE",
    usage: "voice [rate|pitch] <عدد>",
    description: "تنظیم سرعت یا زیر و بمی گفتار",
    run: (args) => {
      const [key, value] = args;
      if (key !== "rate" && key !== "pitch") return "استفاده: voice rate 1.2";
      const n = Number(value);
      if (!Number.isFinite(n)) return "عدد معتبر نیست.";
      updateSettings({ [key]: Math.min(2, Math.max(0.5, n)) } as never);
      return `${key} = ${n}`;
    },
  },
  {
    name: "log",
    tier: "SAFE",
    usage: "log <متن>",
    description: "ثبت یک رویداد دستی",
    run: (args) => {
      if (!args.length) return "متن رویداد را بنویسید.";
      log("command", args.join(" "), "info");
      return "رویداد ثبت شد.";
    },
  },
  {
    name: "clear",
    tier: "SAFE",
    usage: "clear",
    description: "پاک کردن خروجی کنسول",
    run: () => "__CLEAR__",
  },
  {
    name: "forget",
    tier: "CONFIRM",
    usage: "forget",
    description: "پاک کردن کل حافظه",
    run: () => {
      clearMemory();
      return "حافظه پاک شد.";
    },
  },
  {
    name: "reset",
    tier: "CONFIRM",
    usage: "reset",
    description: "بازگرداندن تنظیمات به حالت اولیه",
    run: () => {
      resetSettings();
      return "تنظیمات بازنشانی شد.";
    },
  },
  {
    name: "sysinfo",
    tier: "PRIVILEGED",
    usage: "sysinfo",
    description: "وضعیت سیستم‌عامل از طریق پل",
    run: async () => {
      const res = await windowsBridge.getSystemStatus();
      return res.ok ? JSON.stringify(res.data) : (res.reason ?? "در دسترس نیست");
    },
  },
  {
    name: "open",
    tier: "PRIVILEGED",
    usage: "open <برنامه>",
    description: "اجرای برنامه روی دستگاه از طریق پل",
    run: async (args) => {
      const res = await windowsBridge.openApplication(args.join(" "));
      return res.ok ? "اجرا شد." : (res.reason ?? "در دسترس نیست");
    },
  },
  {
    name: "shutdown",
    tier: "BLOCKED",
    usage: "shutdown",
    description: "خاموش کردن دستگاه",
    run: () => "این فرمان از داخل مرورگر مسدود است.",
  },
];

export function findCommand(name: string) {
  return commands.find((c) => c.name === name.toLowerCase());
}

export async function runCommand(
  input: string,
  opts: { confirmed?: boolean } = {},
): Promise<CommandResult & { needsConfirm?: boolean }> {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { ok: false, output: "", tier: "PUBLIC" };
  const [name, ...args] = parts;
  const cmd = findCommand(name);

  if (!cmd) {
    log("command", `فرمان ناشناخته: ${name}`, "warning");
    return {
      ok: false,
      tier: "PUBLIC",
      output: `فرمان «${name}» شناخته نشد. برای فهرست فرمان‌ها help را بزنید.`,
    };
  }

  if (cmd.tier === "BLOCKED") {
    log("command", `فرمان مسدود: ${cmd.name}`, "error");
    return { ok: false, tier: cmd.tier, output: cmd.run(args) as string };
  }

  if (cmd.tier === "PRIVILEGED" && !settingsStore.get().privileged) {
    log("command", `دسترسی رد شد: ${cmd.name}`, "warning");
    return {
      ok: false,
      tier: cmd.tier,
      output: "این فرمان به دسترسی سطح بالا نیاز دارد. در تنظیمات آن را باز کنید.",
    };
  }

  if (cmd.tier === "CONFIRM" && !opts.confirmed) {
    return { ok: false, tier: cmd.tier, output: "", needsConfirm: true };
  }

  const output = await cmd.run(args);
  log("command", `${cmd.name} اجرا شد`, "success");
  remember("command", input.trim());
  return { ok: true, tier: cmd.tier, output };
}
