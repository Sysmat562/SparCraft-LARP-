import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type declarations for browsers
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface UseVoiceConversationProps {
  onUserMessageComplete: (text: string) => void;
  isAiSpeaking: boolean;
  isRoundActive: boolean;
  silenceThresholdMs?: number; // 1400ms natural conversational pause
}

export function useVoiceConversation({
  onUserMessageComplete,
  isAiSpeaking,
  isRoundActive,
  silenceThresholdMs = 1400,
}: UseVoiceConversationProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isHandsfreePaused, setIsHandsfreePaused] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const accumulatedFinalTextRef = useRef('');
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAiSpeakingRef = useRef(isAiSpeaking);
  isAiSpeakingRef.current = isAiSpeaking;

  // Initialize Microphone & Audio Analyser
  const initMicrophoneStream = useCallback(async () => {
    try {
      if (micStreamRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicPermission('granted');

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(1, avg / 128);
            setAudioLevel(normalized);
          }
          animFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();
      }
    } catch (err: any) {
      console.warn('Microphone access denied or error:', err);
      setMicPermission('denied');
    }
  }, []);

  // Dispatch completed user turn
  const finishUserTurn = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const completeText = accumulatedFinalTextRef.current.trim();
    accumulatedFinalTextRef.current = '';
    setInterimText('');

    if (completeText.length > 0) {
      onUserMessageComplete(completeText);
    }
  }, [onUserMessageComplete]);

  // Start Speech Recognition
  const startListening = useCallback(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      // If AI is speaking, ignore or interrupt
      if (isAiSpeakingRef.current) {
        return;
      }

      let currentInterim = '';
      let newlyFinalized = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          newlyFinalized += item[0].transcript + ' ';
        } else {
          currentInterim += item[0].transcript;
        }
      }

      if (newlyFinalized) {
        accumulatedFinalTextRef.current += newlyFinalized;
      }

      const display = (accumulatedFinalTextRef.current + currentInterim).trim();
      setInterimText(display);

      // Reset natural conversational silence detection timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // If user has spoken something substantial, trigger hands-free completion after conversational pause
      if (display.length > 2 && !isAiSpeakingRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          finishUserTurn();
        }, silenceThresholdMs);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.warn('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if round is still active and user is not paused
      if (isRoundActive && !isHandsfreePaused) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }
  }, [finishUserTurn, isRoundActive, isHandsfreePaused, silenceThresholdMs]);

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Manage listening lifecycle according to round and AI speaking states
  useEffect(() => {
    if (isRoundActive) {
      initMicrophoneStream();
      if (!isAiSpeaking && !isHandsfreePaused) {
        startListening();
      } else {
        stopListening();
      }
    } else {
      stopListening();
      setInterimText('');
      accumulatedFinalTextRef.current = '';
    }

    return () => {
      stopListening();
    };
  }, [isRoundActive, isAiSpeaking, isHandsfreePaused, initMicrophoneStream, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Manual trigger if user wants to send immediately without waiting for silence timer
  const submitCurrentSpeech = useCallback(() => {
    finishUserTurn();
  }, [finishUserTurn]);

  // Clear current draft
  const clearSpeech = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    accumulatedFinalTextRef.current = '';
    setInterimText('');
  }, []);

  return {
    isListening,
    interimText,
    audioLevel,
    micPermission,
    speechSupported,
    isHandsfreePaused,
    setIsHandsfreePaused,
    submitCurrentSpeech,
    clearSpeech,
    initMicrophoneStream,
  };
}
