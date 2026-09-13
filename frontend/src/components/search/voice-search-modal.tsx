import React, { useState, useEffect } from "react";
import { Mic, MicOff, X, Sparkles, Volume2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (spokenText: string) => void;
}

export function VoiceSearchModal({ isOpen, onClose, onSearch }: VoiceSearchModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const sampleVoicePrompts = [
    "Cold pressed groundnut oil",
    "Best unpolished millets for diabetes",
    "Pure Lakadong turmeric powder",
    "Vedic A2 bilona cow ghee",
    "Organic basmati rice 5kg",
  ];

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript("");
      setErrorMessage("");
      return;
    }

    // Check for Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Voice speech recognition is not natively supported in this browser. Try one of our suggested voice queries below!"
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN"; // English (India)

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage("");
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultText = event.results[current][0].transcript;
        setTranscript(resultText);

        if (event.results[current].isFinal) {
          setIsListening(false);
          setTimeout(() => {
            onSearch(resultText);
            onClose();
          }, 600);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access was denied. Please allow microphone permissions or tap a sample query.");
        } else {
          setErrorMessage("Didn't catch that. Please tap the microphone and speak clearly.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();

      return () => {
        try {
          recognition.stop();
        } catch (e) {
          // ignore
        }
      };
    } catch (err) {
      setErrorMessage("Could not initialize voice microphone. Tap any sample prompt below.");
      return undefined;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-[2.5rem] bg-card border border-border p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          <X className="size-5" />
        </button>

        {/* Title */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="size-3.5" /> AI Smart Voice Search
          </span>
          <h3 className="font-display text-2xl font-bold text-foreground mt-2">
            {isListening ? "Listening to Your Voice..." : "Speak Your Harvest Request"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Say an ingredient, recipe goal, or dietary preference in English or Hindi.
          </p>
        </div>

        {/* Animated Mic Wave Pulse */}
        <div className="relative flex items-center justify-center py-6">
          {isListening && (
            <>
              <div className="absolute size-32 rounded-full bg-primary/20 animate-ping" />
              <div className="absolute size-24 rounded-full bg-brand-gold/30 animate-pulse" />
            </>
          )}

          <div
            className={`relative size-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
              isListening ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground"
            }`}
          >
            {isListening ? (
              <Mic className="size-9 animate-bounce" />
            ) : (
              <MicOff className="size-8" />
            )}
          </div>
        </div>

        {/* Live Transcription or Error */}
        <div className="min-h-[50px] flex items-center justify-center px-4">
          {transcript ? (
            <p className="font-display text-xl font-bold text-foreground">
              "{transcript}"
            </p>
          ) : errorMessage ? (
            <p className="text-xs text-destructive font-medium">{errorMessage}</p>
          ) : (
            <p className="text-xs text-muted-foreground animate-pulse">
              Try saying: "Wood pressed mustard oil" or "Millets for diabetes"...
            </p>
          )}
        </div>

        {/* Quick Voice Suggestions */}
        <div className="pt-4 border-t border-border space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Or tap to search with one tap:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {sampleVoicePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  onSearch(prompt);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/80 hover:bg-primary hover:text-primary-foreground px-3 py-1 text-xs font-medium transition"
              >
                <span>{prompt}</span>
                <ArrowRight className="size-3" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
