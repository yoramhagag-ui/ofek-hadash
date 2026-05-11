import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { speakText } from '../api/tts';
import VoiceButton from '../components/VoiceButton';

const getTime = () => new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

export default function CommanderScreen() {
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [voiceOn,    setVoiceOn]    = useState(true);
  const [voiceName,  setVoiceName]  = useState('hila');
  const [listening,  setListening]  = useState(false);
  const [error,      setError]      = useState(null);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);
  const initialized = useRef(false);

  // speak helper
  const speak = useCallback((text) => {
    if (voiceOn) speakText(text, voiceName).catch(() => {});
  }, [voiceOn, voiceName]);

  // load history or fetch morning brief on first mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      // load voice preference from settings (best-effort)
      api.getSettings().then(s => {
        if (s.voice_name) setVoiceName(s.voice_name);
        if (s.voice_enabled !== undefined) setVoiceOn(s.voice_enabled === 'true');
      }).catch(() => {});

      // try to load today's history
      try {
        const history = await api.getChatHistory(30);
        if (history.length > 0) {
          setMessages(history.map(h => ({ role: h.role, content: h.content, time: h.created_at?.slice(11, 16) || '' })));
          return;
        }
      } catch { /* no history yet */ }

      // no history → fetch morning brief
      try {
        const { message } = await api.morningBrief();
        setMessages([{ role: 'assistant', content: message, time: getTime() }]);
        speak(message);
      } catch {
        const fallback = 'בוקר טוב! מוכן להתחיל את היום?';
        setMessages([{ role: 'assistant', content: fallback, time: getTime() }]);
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('דפדפן זה אינו תומך בזיהוי קול. נסה Chrome.'); return; }
    if (listening) { recognitionRef.current?.stop(); return; }

    const rec = new SR();
    rec.lang = 'he-IL';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onerror  = () => setListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setListening(false);
      setInput('');
      // send immediately
      const userMsg = { role: 'user', content: text, time: getTime() };
      setMessages(prev => {
        const next = [...prev, userMsg];
        setLoading(true);
        setError(null);
        const payload = next.map(m => ({ role: m.role, content: m.content }));
        api.chat(payload).then(({ reply }) => {
          const assistantMsg = { role: 'assistant', content: reply, time: getTime() };
          setMessages(p => [...p, assistantMsg]);
          speak(reply);
        }).catch(() => {
          setError('שגיאה בתקשורת עם הסוכנת.');
        }).finally(() => setLoading(false));
        return next;
      });
    };
    rec.start();
  }, [listening, speak]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text, time: getTime() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const payload = nextMessages.map(m => ({ role: m.role, content: m.content }));
      const { reply } = await api.chat(payload);
      const assistantMsg = { role: 'assistant', content: reply, time: getTime() };
      setMessages(prev => [...prev, assistantMsg]);
      speak(reply);
    } catch {
      setError('שגיאה בתקשורת עם הסוכנת. בדוק שה-backend רץ ו-ANTHROPIC_API_KEY מוגדר.');
    } finally {
      setLoading(false);
    }
  };

  const chatHistory = messages
    .filter(m => m.role === 'assistant')
    .slice(-4)
    .map((m, i) => ({
      preview: m.content.length > 55 ? `"${m.content.slice(0, 55)}..."` : `"${m.content}"`,
      time: m.time || '',
      key: i,
    }));

  return (
    <div className="commander-wrap" style={{ display: 'flex', height: 'calc(100svh - 64px - 68px - env(safe-area-inset-bottom, 0px))', overflow: 'hidden' }}>

      {/* ── Chat area ── */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#fdf8ff' }}>

        {/* Header */}
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e1e9', backgroundColor: '#fdf8ff', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#006d41', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20 }}>smart_toy</span>
              </div>
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', backgroundColor: loading ? '#C8853A' : '#90f4b7', border: '2px solid #fdf8ff', transition: 'background 0.3s' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#00478d' }}>המפקדת</div>
              <div style={{ fontSize: 12, color: loading ? '#C8853A' : '#006d41', fontWeight: 500 }}>
                {loading ? 'חושבת...' : 'מוכנה לשיחה'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setVoiceOn(v => !v)}
              title={voiceOn ? 'השתק' : 'הפעל קול'}
              style={{ padding: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: voiceOn ? 'rgba(0,109,65,0.1)' : 'transparent', color: voiceOn ? '#006d41' : '#727783' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: voiceOn ? "'FILL' 1" : "'FILL' 0" }}>
                {voiceOn ? 'volume_up' : 'volume_off'}
              </span>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ backgroundColor: '#ffdad6', color: '#93000a', padding: '10px 20px', fontSize: 13, borderBottom: '1px solid #ffb4ab', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
            {error}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }} className="hide-scrollbar">
          {messages.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: '#727783', marginTop: 40 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12, color: '#c2c6d4' }}>smart_toy</span>
              <p style={{ margin: 0, fontSize: 14 }}>טוען שיחת בוקר...</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-start' : 'flex-end' }}>
              <div style={{
                maxWidth: '80%', padding: '12px 16px', borderRadius: 20, fontSize: 15, lineHeight: 1.65,
                backgroundColor: msg.role === 'user' ? '#ebe6ee' : '#00478d',
                color: msg.role === 'user' ? '#1c1b20' : '#ffffff',
                borderTopRightRadius: msg.role === 'user' ? 4 : 20,
                borderTopLeftRadius:  msg.role === 'assistant' ? 4 : 20,
              }}>
                {msg.content}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, padding: '0 4px' }}>
                <span style={{ fontSize: 10, color: '#727783' }}>{msg.time}</span>
                {msg.role === 'assistant' && (
                  <VoiceButton text={msg.content} voice={voiceName} size={14} />
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ backgroundColor: '#00478d', padding: '12px 16px', borderRadius: '20px 20px 4px 20px' }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 18 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.7)',
                      animation: 'bounce 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e1e9', backgroundColor: '#fdf8ff', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <button
              onClick={startListening}
              title={listening ? 'עצור הקלטה' : 'דבר עם הסוכנת'}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                backgroundColor: listening ? '#ba1a1a' : '#00478d',
                color: '#fff', border: `3px solid ${listening ? 'rgba(186,26,26,0.3)' : '#fdf8ff'}`,
                boxShadow: listening ? '0 0 0 8px rgba(186,26,26,0.15)' : '0 4px 14px rgba(0,71,141,0.3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>
                {listening ? 'stop' : 'mic'}
              </span>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="כתוב לסוכנת..."
              disabled={loading}
              style={{ flex: 1, backgroundColor: '#f7f2fa', color: '#1c1b20', padding: '10px 16px', borderRadius: 99, border: 'none', fontSize: 14, outline: 'none', fontFamily: 'Arimo, Arial, sans-serif', opacity: loading ? 0.7 : 1 }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{ padding: 10, borderRadius: '50%', border: 'none', backgroundColor: loading || !input.trim() ? '#c2c6d4' : '#00478d', color: '#fff', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, transform: 'scaleX(-1)', display: 'block' }}>send</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── History sidebar – desktop only ── */}
      <aside style={{ width: 280, borderRight: '1px solid #e5e1e9', backgroundColor: '#ffffff', flexDirection: 'column', padding: 16, gap: 12, overflowY: 'auto' }} className="hidden lg:flex">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#424752', margin: 0 }}>היסטוריית שיחות</h3>
        {chatHistory.length === 0 ? (
          <p style={{ fontSize: 13, color: '#727783', textAlign: 'center', marginTop: 8 }}>עדיין אין שיחות היום</p>
        ) : chatHistory.map((item) => (
          <div key={item.key} style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#f7f2fa', cursor: 'default', border: '1px solid transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: '#727783' }}>{item.time}</span>
            </div>
            <p style={{ fontSize: 13, color: '#424752', margin: 0, fontStyle: 'italic', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.preview}</p>
          </div>
        ))}

        <div style={{ marginTop: 'auto', backgroundColor: 'rgba(0,71,141,0.06)', borderRadius: 16, padding: 16, border: '1px solid rgba(0,71,141,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00478d', marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lightbulb</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>טיפ יומי</span>
          </div>
          <p style={{ fontSize: 13, color: '#424752', margin: 0, lineHeight: 1.5 }}>שמירה על עקביות בשגרה היומית מגבירה את קצב ההחלמה ב-40%.</p>
        </div>
      </aside>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @media (min-width: 768px) {
          .commander-wrap { height: calc(100svh - 64px) !important; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  );
}
