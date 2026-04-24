import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onResult: (text: string) => void;
  className?: string;
  label?: string;
}

// Minimal SpeechRecognition typing
type SR = {
  new (): SR;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (e: any) => void;
  onend: () => void;
  onerror: (e: any) => void;
};

export default function VoiceInput({ onResult, className, label = "Falar" }: Props) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const r = new SR() as SR;
    r.lang = "pt-BR";
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) onResult(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recRef.current = r;
  }, [onResult]);

  if (!supported) return null;

  const toggle = () => {
    if (!recRef.current) return;
    if (listening) {
      recRef.current.stop();
      setListening(false);
    } else {
      try {
        recRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? "Parar de gravar" : "Gravar por voz"}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-5 py-4 text-base font-semibold text-foreground transition-all hover:border-primary hover:bg-secondary",
        listening && "border-destructive bg-destructive/10 animate-pulse-glow",
        className,
      )}
    >
      {listening ? (
        <MicOff className="h-6 w-6 text-destructive" />
      ) : (
        <Mic className="h-6 w-6 text-primary" />
      )}
      <span>{listening ? "Ouvindo…" : label}</span>
    </button>
  );
}
