import { recognitionSupported, synthesisSupported } from "./speech";

export interface SystemRow {
  label: string;
  value: string;
  available: boolean;
}

interface NavigatorExtras extends Navigator {
  deviceMemory?: number;
  getBattery?: () => Promise<{ level: number; charging: boolean }>;
}

interface PerfMemory {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export async function readBrowserStats(): Promise<SystemRow[]> {
  if (typeof window === "undefined") return [];
  const nav = navigator as NavigatorExtras;
  const rows: SystemRow[] = [
    { label: "وضعیت شبکه", value: nav.onLine ? "متصل" : "قطع", available: true },
    {
      label: "هسته‌های منطقی در دسترس مرورگر",
      value: nav.hardwareConcurrency ? String(nav.hardwareConcurrency) : "نامشخص",
      available: Boolean(nav.hardwareConcurrency),
    },
    {
      label: "حافظهٔ تقریبی دستگاه",
      value: nav.deviceMemory ? `${nav.deviceMemory} گیگابایت` : "در این مرورگر ارائه نمی‌شود",
      available: Boolean(nav.deviceMemory),
    },
    {
      label: "ابعاد نمایشگر",
      value: `${window.screen.width}×${window.screen.height}`,
      available: true,
    },
    { label: "زبان مرورگر", value: nav.language, available: true },
    {
      label: "منطقهٔ زمانی",
      value: Intl.DateTimeFormat().resolvedOptions().timeZone,
      available: true,
    },
    {
      label: "تشخیص گفتار",
      value: recognitionSupported() ? "پشتیبانی می‌شود" : "پشتیبانی نمی‌شود",
      available: recognitionSupported(),
    },
    {
      label: "تبدیل متن به گفتار",
      value: synthesisSupported() ? "پشتیبانی می‌شود" : "پشتیبانی نمی‌شود",
      available: synthesisSupported(),
    },
  ];

  const mem = (performance as Performance & { memory?: PerfMemory }).memory;
  if (mem) {
    const mb = (n: number) => `${Math.round(n / 1048576)} مگابایت`;
    rows.push({
      label: "حافظهٔ مصرفی همین صفحه",
      value: `${mb(mem.usedJSHeapSize)} از ${mb(mem.jsHeapSizeLimit)}`,
      available: true,
    });
  }

  if (nav.getBattery) {
    try {
      const b = await nav.getBattery();
      rows.push({
        label: "باتری",
        value: `${Math.round(b.level * 100)}٪ ${b.charging ? "(در حال شارژ)" : ""}`,
        available: true,
      });
    } catch {
      /* ignore */
    }
  }
  return rows;
}

export const bridgeRows: SystemRow[] = [
  { label: "بار پردازنده", value: "نیازمند پل", available: false },
  { label: "مصرف رم سیستم", value: "نیازمند پل", available: false },
  { label: "فضای دیسک", value: "نیازمند پل", available: false },
  { label: "فرایندهای در حال اجرا", value: "نیازمند پل", available: false },
  { label: "دمای قطعات", value: "نیازمند پل", available: false },
];
