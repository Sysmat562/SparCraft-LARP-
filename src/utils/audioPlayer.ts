interface AudioPlaybackController {
  stop: () => void;
  promise: Promise<void>;
}

let currentAudio: HTMLAudioElement | null = null;

export function stopAllSpeech(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export async function playAiSpeech(
  text: string,
  voiceName: string = 'Kore',
  onStart?: () => void,
  onEnd?: () => void
): Promise<AudioPlaybackController> {
  stopAllSpeech();

  let isStopped = false;
  let rejectPlayback: (() => void) | null = null;

  const controller: AudioPlaybackController = {
    stop: () => {
      isStopped = true;
      stopAllSpeech();
      if (rejectPlayback) {
        rejectPlayback();
      }
    },
    promise: Promise.resolve(),
  };

  controller.promise = new Promise<void>(async (resolve, reject) => {
    rejectPlayback = () => {
      if (onEnd) onEnd();
      resolve();
    };

    if (onStart) onStart();

    try {
      // 1. Try Gemini 3.8 Flash Lite TTS via server endpoint
      const response = await fetch('/api/spar/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName }),
      });

      if (isStopped) {
        if (onEnd) onEnd();
        return resolve();
      }

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64 && !isStopped) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          currentAudio = audio;

          audio.onended = () => {
            currentAudio = null;
            if (onEnd) onEnd();
            resolve();
          };

          audio.onerror = (e) => {
            console.warn('Audio element error, falling back to Web Speech Synthesis:', e);
            fallbackSpeechSynthesis(text, voiceName, resolve, onEnd);
          };

          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn('Error fetching server TTS, using browser speech synthesis fallback:', err);
    }

    if (isStopped) {
      if (onEnd) onEnd();
      return resolve();
    }

    // 2. Fallback to Web Speech Synthesis
    fallbackSpeechSynthesis(text, voiceName, resolve, onEnd);
  });

  return controller;
}

function fallbackSpeechSynthesis(
  text: string,
  voiceName: string,
  resolve: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    resolve();
    return;
  }

  window.speechSynthesis.cancel();
  const cleanText = text.replace(/\[.*?\]/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Pitch and rate tailored to character vibe
  utterance.rate = 1.05; // Natural conversational tempo
  if (voiceName === 'Puck' || voiceName === 'Zephyr') {
    utterance.pitch = 1.1;
  } else if (voiceName === 'Charon' || voiceName === 'Fenrir') {
    utterance.pitch = 0.9;
  } else {
    utterance.pitch = 1.0;
  }

  // Attempt to select an English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
    resolve();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
    resolve();
  };

  window.speechSynthesis.speak(utterance);
}
