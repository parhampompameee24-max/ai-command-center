import type { ProviderId } from "./types";

export interface AIProvider {
  id: ProviderId;
  label: string;
  description: string;
  /** Streams the answer chunk by chunk. */
  send(
    prompt: string,
    ctx: { history: { role: string; content: string }[]; assistantName: string },
    onChunk: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<string>;
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    });
  });

async function stream(text: string, onChunk: (t: string) => void, signal?: AbortSignal) {
  const words = text.split(" ");
  let out = "";
  for (const w of words) {
    await sleep(22 + Math.random() * 45, signal);
    out += (out ? " " : "") + w;
    onChunk(out);
  }
  return out;
}

function mockAnswer(prompt: string, assistantName: string) {
  const p = prompt.trim().toLowerCase();
  if (/سلام|درود|hi|hello/.test(p))
    return `سلام. ${assistantName} در خدمت شماست. می‌توانید سؤال بپرسید یا از بخش کنسول فرمان بدهید.`;
  if (/ساعت|زمان|time/.test(p))
    return `ساعت دستگاه شما ${new Date().toLocaleTimeString("fa-IR")} است. این مقدار مستقیم از مرورگر خوانده می‌شود.`;
  if (/تاریخ|date/.test(p))
    return `امروز ${new Date().toLocaleDateString("fa-IR", { dateStyle: "full" })} است.`;
  if (/کی هستی|who are you|خودت/.test(p))
    return `من ${assistantName} هستم، یک دستیار نمایشی که کاملاً داخل مرورگر شما اجرا می‌شود. در حالت آزمایشی پاسخ‌ها شبیه‌سازی شده‌اند و به هیچ سرویس بیرونی وصل نیستم.`;
  if (/سیستم|cpu|رم|ram|حافظه سیستم/.test(p))
    return `اطلاعات سخت‌افزاری واقعی مثل پردازنده و رم از داخل مرورگر قابل خواندن نیست. در بخش «سیستم» فقط مقادیری را نشان می‌دهم که مرورگر واقعاً در اختیار می‌گذارد و بقیه با برچسب «نیازمند پل» مشخص شده‌اند.`;
  if (p.endsWith("؟") || p.endsWith("?"))
    return `پرسش شما را ثبت کردم: «${prompt}». در حالت آزمایشی پاسخ واقعی مدل زبانی در دسترس نیست؛ با انتخاب ارائه‌دهندهٔ محلی یا ابری در تنظیمات، همین گفت‌وگو به مدل واقعی وصل می‌شود.`;
  return `دریافت شد: «${prompt}». این پاسخ شبیه‌سازی‌شده است تا جریان کار را ببینید؛ منطق گفت‌وگو، حافظه و ثبت رویداد کاملاً واقعی کار می‌کنند.`;
}

export const mockProvider: AIProvider = {
  id: "mock",
  label: "حالت آزمایشی",
  description: "کاملاً آفلاین، بدون هیچ سرویس بیرونی. پاسخ‌ها شبیه‌سازی شده‌اند.",
  async send(prompt, ctx, onChunk, signal) {
    await sleep(320, signal);
    return stream(mockAnswer(prompt, ctx.assistantName), onChunk, signal);
  },
};

export const localProvider: AIProvider = {
  id: "local",
  label: "مدل محلی",
  description: "اتصال به Ollama یا llama.cpp روی همین دستگاه.",
  async send(prompt, _ctx, onChunk, signal) {
    void prompt;
    await sleep(200, signal);
    return stream(
      "مدل محلی در دسترس نیست. برای این حالت باید یک سرویس مثل Ollama روی همین دستگاه در حال اجرا باشد و نشانی آن در تنظیمات وارد شود.",
      onChunk,
      signal,
    );
  },
};

export const cloudProvider: AIProvider = {
  id: "cloud",
  label: "مدل ابری",
  description: "معماری آماده است؛ کلید و سرویس هنوز متصل نشده.",
  async send(prompt, _ctx, onChunk, signal) {
    void prompt;
    await sleep(200, signal);
    return stream(
      "سرویس ابری هنوز متصل نشده است. ساختار فراخوانی آماده است و به محض فعال‌سازی بک‌اند، همین گفت‌وگو به مدل واقعی وصل می‌شود.",
      onChunk,
      signal,
    );
  },
};

export const providers: Record<ProviderId, AIProvider> = {
  mock: mockProvider,
  local: localProvider,
  cloud: cloudProvider,
};
