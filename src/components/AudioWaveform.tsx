import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isListening: boolean;
  isAiSpeaking: boolean;
  isThinking: boolean;
  audioLevel: number; // 0.0 to 1.0 from microphone
  characterName: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isListening,
  isAiSpeaking,
  isThinking,
  audioLevel,
  characterName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      phase += 0.05;

      if (isAiSpeaking) {
        // AI Speaking Waveform: Vibrant Cyan/Teal layered sine pulses
        const barCount = 36;
        const barWidth = 4;
        const totalBarWidth = barCount * (barWidth + 4);
        const startX = (width - totalBarWidth) / 2;

        for (let i = 0; i < barCount; i++) {
          const x = startX + i * (barWidth + 4);
          const distanceCenter = 1 - Math.abs((i - barCount / 2) / (barCount / 2));
          const wave = Math.sin(phase * 2 + i * 0.3) * 0.5 + 0.5;
          const barHeight = Math.max(6, distanceCenter * (30 + wave * 45));

          const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          gradient.addColorStop(0, '#38BDF8'); // Sky 400
          gradient.addColorStop(0.5, '#0EA5E9'); // Sky 500
          gradient.addColorStop(1, '#0284C7'); // Sky 600

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else if (isThinking) {
        // AI Thinking Animation: Flowing amber dots
        const dotCount = 5;
        const spacing = 20;
        const startX = width / 2 - ((dotCount - 1) * spacing) / 2;

        for (let i = 0; i < dotCount; i++) {
          const x = startX + i * spacing;
          const offset = Math.sin(phase * 3 + i * 0.6) * 10;
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(x, centerY + offset, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (isListening) {
        // User Speaking: Responsive amber spectrum reacting directly to audioLevel
        const barCount = 42;
        const barWidth = 4;
        const totalBarWidth = barCount * (barWidth + 4);
        const startX = (width - totalBarWidth) / 2;

        for (let i = 0; i < barCount; i++) {
          const x = startX + i * (barWidth + 4);
          const distanceCenter = 1 - Math.abs((i - barCount / 2) / (barCount / 2));
          // Mix microphone audio level with a subtle living wave
          const livingWave = Math.sin(phase * 1.5 + i * 0.25) * 0.2 + 0.8;
          const intensity = Math.max(0.12, audioLevel * 1.8 * distanceCenter * livingWave);
          const barHeight = Math.max(6, intensity * 70);

          const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          gradient.addColorStop(0, '#FCD34D'); // Amber 300
          gradient.addColorStop(0.5, '#F59E0B'); // Amber 500
          gradient.addColorStop(1, '#D97706'); // Amber 600

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        // Idle/Muted baseline line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.2, centerY);
        ctx.lineTo(width * 0.8, centerY);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isAiSpeaking, isThinking, audioLevel]);

  return (
    <div className="w-full flex flex-col items-center justify-center py-4">
      <canvas
        ref={canvasRef}
        width={480}
        height={96}
        className="w-full max-w-md h-24 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-inner"
      />
      <div className="mt-3 flex items-center gap-2 text-xs font-mono">
        {isAiSpeaking ? (
          <span className="text-sky-400 font-medium">
            {characterName} is speaking...
          </span>
        ) : isThinking ? (
          <span className="text-amber-400 font-medium">
            {characterName} is processing your comeback...
          </span>
        ) : isListening ? (
          <span className="text-emerald-400 font-medium">
            Listening hands-free · Speak naturally
          </span>
        ) : (
          <span className="text-slate-500">Microphone paused</span>
        )}
      </div>
    </div>
  );
};
