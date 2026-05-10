const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

let currentAudio = null;

export async function speakText(text, voice = 'hila') {
  if (!text?.trim()) return;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const res = await fetch(`${BASE}/tts/speak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice_name: voice }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `TTS error ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  currentAudio = audio;

  return new Promise((resolve, reject) => {
    audio.onended = () => { URL.revokeObjectURL(url); currentAudio = null; resolve(); };
    audio.onerror = reject;
    audio.play().catch(reject);
  });
}

export async function checkTTS() {
  const res = await fetch(`${BASE}/tts/check`);
  return res.json();
}
