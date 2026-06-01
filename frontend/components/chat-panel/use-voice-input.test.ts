import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useVoiceInput } from "./use-voice-input";

type MockInstance = {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: ((e: Event) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
};

describe("useVoiceInput", () => {
  const onTranscript = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when SpeechRecognition is not available", () => {
    it("reports isSupported as false", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      expect(result.current.isSupported).toBe(false);
    });

    it("reports isListening as false", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      expect(result.current.isListening).toBe(false);
    });
  });

  describe("when SpeechRecognition is available", () => {
    let captured!: MockInstance;

    beforeEach(() => {
      vi.stubGlobal(
        "SpeechRecognition",
        class {
          start = vi.fn();
          stop = vi.fn();
          continuous = false;
          interimResults = false;
          lang = "";
          onresult: MockInstance["onresult"] = null;
          onend: MockInstance["onend"] = null;
          onerror: MockInstance["onerror"] = null;

          constructor() {
            captured = this as unknown as MockInstance;
          }
        },
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("reports isSupported as true", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      expect(result.current.isSupported).toBe(true);
    });

    it("reports isListening as false initially", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      expect(result.current.isListening).toBe(false);
    });

    it("calls start and sets isListening true when startListening is called", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      act(() => {
        result.current.startListening();
      });
      expect(captured.start).toHaveBeenCalledOnce();
      expect(result.current.isListening).toBe(true);
    });

    it("calls stop when stopListening is called", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      act(() => {
        result.current.startListening();
      });
      act(() => {
        result.current.stopListening();
      });
      expect(captured.stop).toHaveBeenCalledOnce();
    });

    it("sets isListening to false when recognition ends", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      act(() => {
        result.current.startListening();
      });
      expect(result.current.isListening).toBe(true);
      act(() => {
        captured.onend?.(new Event("end"));
      });
      expect(result.current.isListening).toBe(false);
    });

    it("calls onTranscript with the recognised text on result", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      act(() => {
        result.current.startListening();
      });
      const mockEvent = {
        results: [[{ transcript: "hello chef" }]],
      } as unknown as SpeechRecognitionEvent;
      act(() => {
        captured.onresult?.(mockEvent);
      });
      expect(onTranscript).toHaveBeenCalledWith("hello chef");
    });

    it("sets isSupported false and calls onError when permission is denied", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      act(() => {
        result.current.startListening();
      });
      act(() => {
        captured.onerror?.({ error: "not-allowed" } as SpeechRecognitionErrorEvent);
      });
      expect(result.current.isSupported).toBe(false);
      expect(onError).toHaveBeenCalledWith("Microphone access was denied.");
    });

    it("sets isListening false and calls onError on non-permission error", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      act(() => {
        result.current.startListening();
      });
      act(() => {
        captured.onerror?.({ error: "network" } as SpeechRecognitionErrorEvent);
      });
      expect(result.current.isListening).toBe(false);
      expect(onError).toHaveBeenCalledWith("Voice recognition failed. Please try again.");
    });

    it("does not start a second recognition when already listening", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      act(() => { result.current.startListening(); });
      const firstStart = captured.start;
      act(() => { result.current.startListening(); });
      expect(firstStart).toHaveBeenCalledOnce();
      expect(captured.start).toBe(firstStart);
    });

    it("does not call onTranscript when transcript is empty", () => {
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      act(() => { result.current.startListening(); });
      act(() => {
        captured.onresult?.({ results: [[{ transcript: "" }]] } as unknown as SpeechRecognitionEvent);
      });
      expect(onTranscript).not.toHaveBeenCalled();
    });

    it("calls stop on unmount while listening", () => {
      const { result, unmount } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      act(() => { result.current.startListening(); });
      const stopFn = captured.stop;
      unmount();
      expect(stopFn).toHaveBeenCalledOnce();
    });
  });

  describe("when only webkitSpeechRecognition is available", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("reports isSupported as true", () => {
      vi.stubGlobal(
        "webkitSpeechRecognition",
        class {
          start = vi.fn();
          stop = vi.fn();
          continuous = false;
          interimResults = false;
          lang = "";
          onresult = null;
          onend = null;
          onerror = null;
        },
      );
      const { result } = renderHook(() => useVoiceInput({ onTranscript, onError }));
      expect(result.current.isSupported).toBe(true);
    });
  });
});
