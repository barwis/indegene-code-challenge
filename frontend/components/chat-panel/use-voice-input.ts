import { useState, useRef, useEffect } from "react";

type UseVoiceInputProps = {
  onTranscript: (text: string) => void;
  onError: (message: string) => void;
};

export type UseVoiceInputReturn = {
  isSupported: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognition;

const detectRecognition = (): SpeechRecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const useVoiceInput = ({
  onTranscript,
  onError,
}: UseVoiceInputProps): UseVoiceInputReturn => {
  const [isSupported, setIsSupported] = useState(() => detectRecognition() !== null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    const Ctor = detectRecognition();
    if (!isSupported || !Ctor || recognitionRef.current !== null) return;

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) onTranscript(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setIsSupported(false);
        onError("Microphone access was denied.");
      } else {
        onError("Voice recognition failed. Please try again.");
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  return { isSupported, isListening, startListening, stopListening };
};
