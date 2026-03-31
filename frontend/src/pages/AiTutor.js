import { useEffect, useRef, useState } from "react";
import { useVoiceInteraction } from "../hooks/useVoiceInteraction";
import { useI18n } from "../context/I18nContext";
import { chatWithTutor as apiChat } from "../services/api";

export default function AiTutor() {
  const { t } = useI18n();
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! Ask me anything about your subjects." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const {
    isListening,
    isSpeaking,
    listeningTranscript,
    error: voiceError,
    isSupported,
    toggleListening,
    speak,
    stopSpeaking,
    clearError,
  } = useVoiceInteraction({
    onTranscript: (_, finalTranscript) => {
      if (finalTranscript.trim()) {
        setInput(finalTranscript.trim());
      }
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isListening, listeningTranscript]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (isListening) toggleListening();
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await apiChat(text);
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      if (isSupported.synthesis) {
        try {
          await speak(data.reply);
        } catch {
          // ignore speech failures
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: err.message || "AI tutor error." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col px-4 pb-20 pt-24 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("AI Tutor")}</h1>
      <p className="mt-1 text-sm text-gray-600">
        A calm, focused space for your questions.
      </p>

      {(!isSupported.recognition || !isSupported.synthesis) && (
        <div className="mt-4 rounded-2xl border border-mist bg-fog px-4 py-3 text-sm text-gray-700">
          {!isSupported.recognition && (
            <p>Speech recognition is not supported in this browser.</p>
          )}
          {!isSupported.synthesis && (
            <p>Text-to-speech is not supported in this browser.</p>
          )}
        </div>
      )}

      {voiceError && (
        <div className="mt-4 rounded-2xl border border-mist bg-paper px-4 py-3 text-sm text-gray-700">
          <div className="flex items-center justify-between gap-3">
            <span>{voiceError}</span>
            <button
              onClick={clearError}
              className="rounded-2xl border border-ink px-3 py-1 text-xs font-medium transition hover:bg-ink hover:text-paper"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex min-h-[420px] flex-1 flex-col rounded-2xl border border-mist bg-paper shadow-soft">
        <div className="flex-1 space-y-4 p-6">
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end gap-2">
                <div
                  className={[
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    m.role === "user"
                      ? "border border-ink bg-ink text-paper"
                      : "border border-mist bg-fog text-ink",
                  ].join(" ")}
                >
                  {m.text}
                </div>
                {m.role === "assistant" && isSupported.synthesis && (
                  <button
                    onClick={() => speak(m.text)}
                    className="rounded-2xl border border-mist px-2 py-1 text-xs transition hover:border-ink"
                    title="Speak"
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? "..." : "🔊"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl border border-mist bg-fog px-4 py-3 text-sm text-ink">
                Thinking...
              </div>
            </div>
          )}
          {isListening && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl border border-mist bg-fog px-4 py-3 text-sm text-ink">
                Listening...
                {listeningTranscript && (
                  <div className="mt-1 text-xs text-gray-600">
                    “{listeningTranscript}”
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-mist p-4">
          <div className="flex items-center gap-2">
            {isSupported.recognition && (
              <button
                onClick={toggleListening}
                disabled={loading}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-medium transition",
                  isListening
                    ? "border-ink bg-ink text-paper"
                    : "border-ink hover:bg-ink hover:text-paper",
                ].join(" ")}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? "■" : "🎤"}
              </button>
            )}
            <input
              className="w-full rounded-2xl border border-mist bg-paper px-4 py-3 text-sm outline-none transition focus:border-ink"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="rounded-2xl border border-ink px-4 py-3 text-sm font-medium transition hover:bg-ink hover:text-paper"
            >
              {loading ? "..." : "Send"}
            </button>
            {isSpeaking && isSupported.synthesis && (
              <button
                onClick={stopSpeaking}
                className="rounded-2xl border border-ink px-3 py-3 text-sm font-medium transition hover:bg-ink hover:text-paper"
                title="Stop speaking"
              >
                ■
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
