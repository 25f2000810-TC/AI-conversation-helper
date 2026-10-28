import React from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  levels?: number[]; // Array of 8 to 16 numbers between 0.05 and 1.0
  color?: 'indigo' | 'emerald' | 'amber' | 'cyan';
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  levels = [],
  color = 'indigo',
  barCount = 12
}) => {
  const defaultHeights = [14, 24, 38, 52, 60, 44, 30, 48, 56, 32, 22, 12];
  
  const colorClasses = {
    indigo: 'bg-indigo-600 dark:bg-indigo-400',
    emerald: 'bg-emerald-500 dark:bg-emerald-400',
    amber: 'bg-amber-500 dark:bg-amber-400',
    cyan: 'bg-cyan-500 dark:bg-cyan-400'
  };

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-xs px-4" aria-hidden="true">
      {Array.from({ length: barCount }).map((_, index) => {
        let heightPercent = 12;
        if (isActive) {
          if (levels.length > 0) {
            const raw = levels[index % levels.length] || 0.1;
            heightPercent = Math.min(100, Math.max(12, Math.round(raw * 100)));
          } else {
            // Organic fallback height
            heightPercent = defaultHeights[index % defaultHeights.length];
          }
        }

        return (
          <div
            key={index}
            className={`w-1.5 rounded-full transition-all duration-100 ease-out ${
              isActive ? colorClasses[color] : 'bg-slate-300 dark:bg-slate-700'
            }`}
            style={{
              height: `${heightPercent}%`,
              opacity: isActive ? 0.9 : 0.3
            }}
          />
        );
      })}
    </div>
  );
};
