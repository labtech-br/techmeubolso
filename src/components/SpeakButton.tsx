import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { isSpeechSupported, useSpeak, useSpeechSettings, stopSpeaking } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Botão de áudio que lê o texto recebido em voz alta (pt-BR).
 * Usa a API nativa do navegador — sem custos.
 */
export default function SpeakButton({ text, label = "Ouvir", className, size = "md" }: Props) {
  const speak = useSpeak();
  const { settings } = useSpeechSettings();
  const [speaking, setSpeaking] = useState(false);

  if (!isSpeechSupported() || !settings.enabled) return null;

  const sizes = {
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-14 w-14",
  };
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text);
    // Heurística: solta o estado depois de um tempo proporcional ao texto
    const ms = Math.max(1500, text.length * 70);
    setTimeout(() => setSpeaking(false), ms);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={speaking ? "Parar leitura" : label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-border bg-card text-primary shadow-soft transition-all hover:border-primary hover:bg-secondary active:scale-95",
        speaking && "border-primary bg-secondary animate-pulse",
        sizes[size],
        className,
      )}
    >
      {speaking ? <VolumeX className={iconSizes[size]} /> : <Volume2 className={iconSizes[size]} />}
    </button>
  );
}
