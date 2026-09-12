/* Thin wrappers around the browser Web Speech APIs. */

export interface RecognitionHandle {
  stop: () => void;
}

type AnyWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<
    ArrayLike<{ transcript: string }> & { isFinal: boolean }
  >;
}

export function recognitionSupported() {
  if (typeof window === "undefined") return false;
  const w = window as AnyWindow;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function synthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function startRecognition(opts: {
  lang: string;
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}): RecognitionHandle | null {
  if (!recognitionSupported()) return null;
  const w = window as AnyWindow;
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition)!;
  const rec = new Ctor();
  rec.lang = opts.lang;
  rec.continuous = false;
  rec.interimResults = true;

  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i += 1) {
      const res = e.results[i];
      const text = res[0]?.transcript ?? "";
      if (res.isFinal) opts.onFinal(text.trim());
      else interim += text;
    }
    if (interim) opts.onInterim(interim.trim());
  };
  rec.onerror = (e) => opts.onError(errorMessage(e.error));
  rec.onend = () => opts.onEnd();

  try {
    rec.start();
  } catch {
    opts.onError("امکان شروع میکروفن نبود.");
    return null;
  }
  return { stop: () => rec.stop() };
}

function errorMessage(code: string) {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "دسترسی به میکروفن داده نشد.";
    case "no-speech":
      return "صدایی شنیده نشد.";
    case "audio-capture":
      return "میکروفنی پیدا نشد.";
    case "network":
      return "سرویس تشخیص گفتار در دسترس نیست.";
    default:
      return `خطای تشخیص گفتار: ${code}`;
  }
}

export function listVoices(): SpeechSynthesisVoice[] {
  if (!synthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}

export function speak(
  text: string,
  opts: { lang: string; voiceURI?: string; rate: number; pitch: number },
  onStart?: () => void,
  onEnd?: () => void,
) {
  if (!synthesisSupported() || !text.trim()) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts.lang;
  u.rate = opts.rate;
  u.pitch = opts.pitch;
  const voice = listVoices().find((v) => v.voiceURI === opts.voiceURI);
  if (voice) u.voice = voice;
  u.onstart = () => onStart?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (synthesisSupported()) window.speechSynthesis.cancel();
}
