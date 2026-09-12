'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Clock, Code, BookOpen, Dumbbell, CheckSquare } from 'lucide-react';
import { ActivityCategory } from '@/types/database';

interface FocusTimerProps {
  onComplete: (elapsedMinutes: number, category: ActivityCategory, title: string) => void;
}

export function FocusTimer({ onComplete }: FocusTimerProps) {
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [category, setCategory] = useState<ActivityCategory>('coding');
  const [title, setTitle] = useState('Deep Work Session');

  // Handle countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      onComplete(targetMinutes, category, title);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsRemaining, targetMinutes, category, title, onComplete]);

  const handleSetTarget = (mins: number) => {
    setTargetMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsRunning(false);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinishEarly = () => {
    const elapsedSeconds = targetMinutes * 60 - secondsRemaining;
    const elapsedMins = Math.max(Math.round(elapsedSeconds / 60), 1);
    setIsRunning(false);
    onComplete(elapsedMins, category, title);
  };

  return (
    <div className="space-y-6 text-center">
      {/* Category selector */}
      <div className="flex justify-center gap-2">
        {[
          { id: 'coding' as const, label: 'Code', icon: Code },
          { id: 'study' as const, label: 'Study', icon: BookOpen },
          { id: 'fitness' as const, label: 'Fitness', icon: Dumbbell },
          { id: 'habit' as const, label: 'Habit', icon: CheckSquare },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all min-h-[36px] ${
                isSelected
                  ? 'bg-[#FDE7EA] text-[#C1121F] border border-[#C1121F]/30 font-bold'
                  : 'bg-white border border-[#E8D6D9] text-[#6B6B6B] hover:text-[#171717] hover:bg-[#FFF5F6]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Session Focus Title"
        className="w-full bg-white border border-[#E8D6D9] rounded px-3 py-2 text-center text-sm font-semibold text-[#171717] placeholder-[#6B6B6B] focus:outline-none focus:border-[#C1121F]"
      />

      {/* Timer Counter Display */}
      <div className="py-6 bg-[#FFF5F6] border border-[#E8D6D9] rounded-lg shadow-inner">
        <div className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-[#C1121F]">
          {formatTime(secondsRemaining)}
        </div>
        <div className="text-xs font-mono text-[#6B6B6B] mt-2 flex items-center justify-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#C1121F]" />
          TARGET: {targetMinutes} MINUTES
        </div>
      </div>

      {/* Preset Minutes */}
      <div className="flex justify-center gap-2">
        {[15, 25, 45, 60].map((mins) => (
          <button
            key={mins}
            onClick={() => handleSetTarget(mins)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all min-h-[36px] ${
              targetMinutes === mins
                ? 'bg-[#C1121F] text-white font-bold'
                : 'bg-white text-[#6B6B6B] border border-[#E8D6D9] hover:text-[#171717] hover:bg-[#FFF5F6]'
            }`}
          >
            {mins}m
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded font-mono font-bold text-xs transition-all min-h-[44px] ${
            isRunning
              ? 'bg-[#FFF5F6] text-[#C1121F] border border-[#C1121F]/40 hover:bg-[#FDE7EA]'
              : 'bg-[#C1121F] text-white border-b-2 border-[#8F0D16] hover:bg-[#8F0D16]'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Pause Timer
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Start Focus
            </>
          )}
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setSecondsRemaining(targetMinutes * 60);
          }}
          className="p-2.5 rounded bg-white border border-[#E8D6D9] text-[#6B6B6B] hover:text-[#171717] hover:bg-[#FFF5F6] min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleFinishEarly}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded bg-[#FFF5F6] border border-[#E8D6D9] text-[#C1121F] font-mono text-xs font-bold hover:bg-[#FDE7EA] min-h-[44px]"
        >
          <CheckCircle className="w-4 h-4" /> Save Session
        </button>
      </div>
    </div>
  );
}
