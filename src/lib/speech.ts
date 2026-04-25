// Hook simples para Text-to-Speech usando a API nativa do navegador.
// Funciona offline, gratuito, em pt-BR.
import { useCallback, useEffect, useRef, useState } from "react";

const KEY = "meu-bolso-audio-v1";

export interface SpeechSettings {
  enabled: boolean;
  autoSpeakBalance: boolean;
  rate: number; // 0.7 - 1.2
}

const defaults: SpeechSettings = {
  enabled: true,
  autoSpeakBalance: false,
  rate: 0.95,
};

function readSettings(): SpeechSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function writeSettings(s: SpeechSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("meu-bolso:speech"));
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let cachedVoice: SpeechSynthesisVoice | null = null;
function pickPtBrVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null;
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  const pt =
    voices.find((v) => /pt[-_]br/i.test(v.lang)) ||
    voices.find((v) => /^pt/i.test(v.lang)) ||
    null;
  cachedVoice = pt;
  return pt;
}

export function speak(text: string, opts?: { rate?: number }) {
  if (!isSpeechSupported()) return;
  const settings = readSettings();
  if (!settings.enabled) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  u.rate = opts?.rate ?? settings.rate;
  u.pitch = 1;
  const v = pickPtBrVoice();
  if (v) u.voice = v;
  synth.speak(u);
}

export function stopSpeaking() {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

export function useSpeechSettings() {
  const [settings, setSettings] = useState<SpeechSettings>(readSettings);

  useEffect(() => {
    const h = () => setSettings(readSettings());
    window.addEventListener("meu-bolso:speech", h);
    window.addEventListener("storage", h);
    // Pré-carrega lista de vozes (alguns browsers carregam async)
    if (isSpeechSupported()) {
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoice = null;
        pickPtBrVoice();
      };
      pickPtBrVoice();
    }
    return () => {
      window.removeEventListener("meu-bolso:speech", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const update = useCallback((patch: Partial<SpeechSettings>) => {
    const next = { ...readSettings(), ...patch };
    writeSettings(next);
    setSettings(next);
  }, []);

  return { settings, update };
}

export function useSpeak() {
  const { settings } = useSpeechSettings();
  const speakFn = useCallback(
    (text: string) => speak(text, { rate: settings.rate }),
    [settings.rate],
  );
  return speakFn;
}

// Hook para narrar automaticamente um texto quando muda (e está habilitado)
export function useAutoSpeak(text: string | null, enabled: boolean) {
  const lastRef = useRef<string | null>(null);
  const speakFn = useSpeak();
  useEffect(() => {
    if (!enabled || !text) return;
    if (lastRef.current === text) return;
    lastRef.current = text;
    // pequeno delay pra esperar a UI renderizar
    const t = setTimeout(() => speakFn(text), 350);
    return () => clearTimeout(t);
  }, [text, enabled, speakFn]);
}
