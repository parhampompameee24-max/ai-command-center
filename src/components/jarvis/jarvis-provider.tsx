import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useStore } from "@/hooks/use-store";
import { setCoreState, setCoreLevel, coreStore } from "@/lib/jarvis/core";
import { log, logStore } from "@/lib/jarvis/logger";
import { memoryStore, remember } from "@/lib/jarvis/memory";
import { providers } from "@/lib/jarvis/providers";
import { settingsStore } from "@/lib/jarvis/settings";
import {
  recognitionSupported,
  speak,
  startRecognition,
  stopSpeaking,
  synthesisSupported,
  type RecognitionHandle,
} from "@/lib/jarvis/speech";
import { uid } from "@/lib/jarvis/store";
import type { ChatMessage } from "@/lib/jarvis/types";

interface JarvisContextValue {
  messages: ChatMessage[];
  sending: boolean;
  listening: boolean;
  transcript: string;
  voiceError: string | null;
  supportsVoice: boolean;
  supportsSpeech: boolean;
  sendMessage: (text: string, opts?: { spoken?: boolean }) => Promise<void>;
  clearChat: () => void;
  toggleListening: () => void;
  say: (text: string) => void;
  stopVoice: () => void;
}

const JarvisContext = createContext<JarvisContextValue | null>(null);

export function useJarvis() {
  const ctx = useContext(JarvisContext);
  if (!ctx) throw new Error("useJarvis must be used inside JarvisProvider");
  return ctx;
}

export function JarvisProvider({ children }: { children: ReactNode }) {
  const settings = useStore(settingsStore);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [supportsVoice, setSupportsVoice] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const recRef = useRef<RecognitionHandle | null>(null);
  const autoRef = useRef(false);

  // hydrate persisted stores + baseline system state after mount
  useEffect(() => {
    settingsStore.hydrate();
    memoryStore.hydrate();
    logStore.hydrate();
    setSupportsVoice(recognitionSupported());
    setSupportsSpeech(synthesisSupported());
    setCoreState(navigator.onLine ? "IDLE" : "OFFLINE");
    log("system", "هستهٔ جارویس راه‌اندازی شد", "success");

    const on = () => {
      setCoreState("IDLE");
      log("system", "اتصال شبکه برقرار شد", "success");
    };
    const off = () => {
      setCoreState("OFFLINE");
      log("system", "اتصال شبکه قطع شد", "warning");
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const say = useCallback(
    (text: string) => {
      if (!settings.soundEffects) return;
      speak(
        text,
        {
          lang: settings.language,
          voiceURI: settings.voiceURI,
          rate: settings.rate,
          pitch: settings.pitch,
        },
        () => setCoreState("SPEAKING"),
        () => {
          setCoreState(coreStore.get().state === "SPEAKING" ? "IDLE" : coreStore.get().state);
          if (autoRef.current) startListening();
        },
      );
    },
    // startListening declared below via hoisted function reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings],
  );

  const sendMessage = useCallback(
    async (text: string, opts: { spoken?: boolean } = {}) => {
      const clean = text.trim();
      if (!clean || sending) return;
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content: clean,
        at: Date.now(),
      };
      const assistantId = uid();
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          at: Date.now(),
          pending: true,
          provider: settings.provider,
        },
      ]);
      setSending(true);
      setCoreState("THINKING");
      log("ai", `پرسش ارسال شد (${settings.provider})`, "info");

      try {
        const provider = providers[settings.provider];
        const answer = await provider.send(
          clean,
          {
            history: messages.map((m) => ({ role: m.role, content: m.content })),
            assistantName: settings.assistantName,
          },
          (partial) =>
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: partial } : m)),
            ),
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: answer, pending: false } : m,
          ),
        );
        log("ai", "پاسخ دریافت شد", "success");
        setCoreState("IDLE");
        if (opts.spoken) say(answer);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "پاسخ‌گویی با خطا مواجه شد.", pending: false }
              : m,
          ),
        );
        setCoreState("ERROR");
        log("ai", "خطا در دریافت پاسخ", "error");
        setTimeout(() => setCoreState("IDLE"), 2200);
      } finally {
        setSending(false);
      }
    },
    [messages, sending, settings, say],
  );

  const startListening = useCallback(() => {
    if (!recognitionSupported()) {
      setVoiceError("مرورگر شما تشخیص گفتار را پشتیبانی نمی‌کند.");
      return;
    }
    setVoiceError(null);
    setTranscript("");
    stopSpeaking();
    const handle = startRecognition({
      lang: settings.language,
      onInterim: (t) => {
        setTranscript(t);
        setCoreLevel(Math.min(1, t.length / 40));
      },
      onFinal: (t) => {
        setTranscript(t);
        log("voice", `دستور صوتی: ${t}`, "success");
        void sendMessage(t, { spoken: true });
      },
      onError: (msg) => {
        setVoiceError(msg);
        log("voice", msg, "error");
        setCoreState("ERROR");
        setTimeout(() => setCoreState("IDLE"), 1800);
      },
      onEnd: () => {
        setListening(false);
        recRef.current = null;
        setCoreLevel(0);
        if (coreStore.get().state === "LISTENING") setCoreState("IDLE");
      },
    });
    if (handle) {
      recRef.current = handle;
      setListening(true);
      setCoreState("LISTENING");
      log("voice", "میکروفن فعال شد", "info");
    }
  }, [settings.language, sendMessage]);

  useEffect(() => {
    autoRef.current = settings.autoListen;
  }, [settings.autoListen]);

  const toggleListening = useCallback(() => {
    if (listening) {
      recRef.current?.stop();
      recRef.current = null;
      setListening(false);
      setCoreState("IDLE");
    } else {
      startListening();
    }
  }, [listening, startListening]);

  const stopVoice = useCallback(() => {
    stopSpeaking();
    recRef.current?.stop();
    setListening(false);
    setCoreState("IDLE");
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    log("ai", "گفت‌وگو پاک شد", "info");
  }, []);

  // keep a light memory trail of what was asked
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && !last.pending && last.content.length > 120) {
      remember("fact", last.content.slice(0, 180));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const value = useMemo<JarvisContextValue>(
    () => ({
      messages,
      sending,
      listening,
      transcript,
      voiceError,
      supportsVoice,
      supportsSpeech,
      sendMessage,
      clearChat,
      toggleListening,
      say,
      stopVoice,
    }),
    [
      messages,
      sending,
      listening,
      transcript,
      voiceError,
      supportsVoice,
      supportsSpeech,
      sendMessage,
      clearChat,
      toggleListening,
      say,
      stopVoice,
    ],
  );

  return <JarvisContext.Provider value={value}>{children}</JarvisContext.Provider>;
}
