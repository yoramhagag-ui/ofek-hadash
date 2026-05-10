import { useState } from 'react';
import { speakText } from '../api/tts';

export default function VoiceButton({
  text,
  voice = 'hila',
  size = 22,
  className = '',
  iconStyle = {},
}) {
  const [state, setState] = useState('idle'); // idle | loading | playing | error

  const handleClick = async () => {
    if (state === 'loading' || state === 'playing') return;
    setState('loading');
    try {
      await speakText(text, voice);
      setState('idle');
    } catch (e) {
      console.error('TTS:', e);
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  };

  const icon = state === 'loading' ? 'hourglass_empty'
             : state === 'playing' ? 'volume_up'
             : state === 'error'   ? 'volume_off'
             : 'volume_up';

  const color = state === 'error' ? '#ba1a1a'
              : state === 'idle'  ? '#727783'
              : '#006d41';

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      title={state === 'error' ? 'שגיאת קול' : 'השמע'}
      style={{
        background: 'none', border: 'none', cursor: state === 'loading' ? 'wait' : 'pointer',
        padding: 6, borderRadius: '50%', color,
        transition: 'color 0.2s, transform 0.15s',
        transform: state === 'playing' ? 'scale(1.15)' : 'scale(1)',
        ...iconStyle,
      }}
      className={className}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: size,
          fontVariationSettings: state !== 'idle' ? "'FILL' 1" : "'FILL' 0",
          display: 'block',
          animation: state === 'loading' ? 'spin 1s linear infinite' : 'none',
        }}
      >
        {icon}
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
