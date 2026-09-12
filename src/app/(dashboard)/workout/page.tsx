'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDayvernStore } from '@/lib/store/dayvernStore';
import { ActivityCategory } from '@/types/database';
import { ShareButton } from '@/components/share/ShareButton';
import { ScheduleWorkoutModal } from '@/components/tasks/ScheduleWorkoutModal';
import { 
  Flame, 
  Coins, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle2, 
  ArrowLeft,
  Zap,
  MapPin
} from 'lucide-react';

type WorkoutType = 'lifting' | 'strength' | 'running' | 'walking' | 'cycling' | 'mobility' | 'hiit' | 'other';

interface ActivityOption {
  id: WorkoutType;
  title: string;
  category: ActivityCategory;
  emoji: string;
  isCardio: boolean;
  defaultTitle: string;
}

const WORKOUT_OPTIONS: ActivityOption[] = [
  { id: 'lifting', title: 'Heavy Lifting', category: 'fitness', emoji: '🏋️', isCardio: false, defaultTitle: 'Heavy Lifting Workout' },
  { id: 'strength', title: 'Strength Training', category: 'fitness', emoji: '💪', isCardio: false, defaultTitle: 'Strength Training Session' },
  { id: 'running', title: 'Running', category: 'fitness', emoji: '🏃', isCardio: true, defaultTitle: 'Outdoor Run' },
  { id: 'walking', title: 'Walking', category: 'fitness', emoji: '🚶', isCardio: true, defaultTitle: 'Power Walk' },
  { id: 'cycling', title: 'Cycling', category: 'fitness', emoji: '🚴', isCardio: true, defaultTitle: 'Bike Ride' },
  { id: 'mobility', title: 'Mobility & Stretching', category: 'fitness', emoji: '🧘', isCardio: false, defaultTitle: 'Mobility & Flexibility' },
  { id: 'hiit', title: 'HIIT & Cardio', category: 'fitness', emoji: '⚡', isCardio: false, defaultTitle: 'High-Intensity Circuit' },
  { id: 'other', title: 'Other Fitness', category: 'fitness', emoji: '🏃', isCardio: false, defaultTitle: 'General Workout' },
];

export default function WorkoutPage() {
  const { state, logActivity } = useDayvernStore();

  const [step, setStep] = useState<'select' | 'configure' | 'live' | 'summary'>('select');
  const [selectedOption, setSelectedOption] = useState<ActivityOption>(WORKOUT_OPTIONS[0]);

  // Form state
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [durationMins, setDurationMins] = useState<number>(45);
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [intensity, setIntensity] = useState<'Moderate' | 'High' | 'Extreme'>('Moderate');

  // Live timer state
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Summary result state
  const [summaryData, setSummaryData] = useState<{
    title: string;
    emoji: string;
    duration: number;
    distance?: string;
    xpEarned: number;
    goldEarned: number;
  } | null>(null);

  // Live timer tick
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (step === 'live' && isTimerRunning) {
      timer = setInterval(() => {
        setLiveSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, isTimerRunning]);

  const handleSelectOption = (option: ActivityOption) => {
    setSelectedOption(option);
    setWorkoutTitle(option.defaultTitle);
    setStep('configure');
  };

  const handleStartLive = () => {
    setLiveSeconds(0);
    setIsTimerRunning(true);
    setStep('live');
  };

  const handleFinishWorkout = async (finalDurationMins?: number) => {
    const mins = finalDurationMins || durationMins;
    if (mins <= 0) return;

    const titleToSave = workoutTitle.trim() || selectedOption.defaultTitle;
    let fullNotes = notes.trim();
    if (selectedOption.isCardio && distanceKm) {
      fullNotes = `Distance: ${distanceKm} km. ${fullNotes}`;
    }
    if (intensity) {
      fullNotes = `Intensity: ${intensity}. ${fullNotes}`;
    }

    // Call store logActivity which executes authoritative Supabase insert + RPC
    await logActivity(titleToSave, selectedOption.category, mins, fullNotes);

    // Calculate preview rewards for summary
    const estimatedXp = mins * 10;
    const estimatedGold = Math.floor(mins * 2);

    setSummaryData({
      title: titleToSave,
      emoji: selectedOption.emoji,
      duration: mins,
      distance: selectedOption.isCardio && distanceKm ? `${distanceKm} km` : undefined,
      xpEarned: estimatedXp,
      goldEarned: estimatedGold,
    });

    setIsTimerRunning(false);
    setStep('summary');
  };

  const formatTimerDisplay = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl mx-auto min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D6D9] dark:border-[#303238] pb-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2] flex items-center gap-2">
            Workout Tracker 🏋️
          </h1>
          <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-sans mt-0.5">
            Log real physical effort to strengthen your character, maintain your streak, and earn XP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 bg-white dark:bg-[#17191D] text-[#C1121F] dark:text-[#F04452] hover:border-[#C1121F] dark:hover:border-[#F04452] px-3.5 py-2 rounded border border-[#E8D6D9] dark:border-[#303238] font-mono text-xs font-bold transition-all min-h-[40px]"
          >
            📅 Schedule Workout
          </button>

          <div className="flex items-center gap-2 bg-[#FFF5F6] dark:bg-[#17191D] px-3 py-2 rounded border border-[#E8D6D9] dark:border-[#303238] font-mono text-xs text-[#C1121F] dark:text-[#F04452] min-h-[40px]">
            <Flame className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" />
            <span className="font-bold">{state.profile.streak_count}d Streak</span>
          </div>
        </div>
      </div>

      {/* STEP 1: SELECT ACTIVITY TILE */}
      {step === 'select' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-base font-serif font-bold text-[#171717] dark:text-[#F5F5F2]">What&apos;s your activity today?</h2>
            <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91]">Select a workout category to begin logging.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {WORKOUT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className="p-4 flex flex-col items-center justify-center text-center space-y-2 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] hover:border-[#C1121F] dark:hover:border-[#F04452] hover:bg-[#FFF5F6] dark:hover:bg-[#35171B] transition-all group min-h-[110px] rounded-lg shadow-sm"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{option.emoji}</span>
                <span className="text-xs font-bold font-sans text-[#171717] dark:text-[#F5F5F2]">{option.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: CONFIGURE WORKOUT DETAILS */}
      {step === 'configure' && (
        <div className="p-6 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-lg shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#E8D6D9] dark:border-[#303238] pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedOption.emoji}</span>
              <div>
                <h2 className="text-lg font-serif font-bold text-[#171717] dark:text-[#F5F5F2]">{selectedOption.title}</h2>
                <p className="text-xs text-[#6B6B6B] dark:text-[#8B8D91] font-mono">Configure session details</p>
              </div>
            </div>

            <button
              onClick={() => setStep('select')}
              className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#C1121F] dark:hover:text-[#F04452] flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Change Activity
            </button>
          </div>

          <div className="space-y-4">
            {/* Workout Title */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Session Title</label>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                placeholder="e.g. Upper Body Hypertrophy"
                className="w-full bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-3.5 py-2.5 text-sm text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452] font-sans"
              />
            </div>

            {/* Duration Slider & Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <label className="text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" /> Duration (Minutes)
                </label>
                <span className="text-[#C1121F] dark:text-[#F04452] font-bold text-sm">{durationMins} MINS</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  className="w-full accent-[#C1121F] dark:accent-[#F04452] bg-[#FFF5F6] dark:bg-[#1D2025] h-2 rounded-lg"
                />
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  className="w-20 bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-2 py-2 text-center text-sm font-mono text-[#C1121F] dark:text-[#F04452] font-bold min-h-[44px]"
                />
              </div>
            </div>

            {/* Cardio Distance Input (if applicable) */}
            {selectedOption.isCardio && (
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C1121F] dark:text-[#F04452]" /> Distance (Kilometers)
                </label>
                <input
                  type="text"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="e.g. 5.2"
                  className="w-full bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-3.5 py-2 text-sm text-[#171717] dark:text-[#F5F5F2] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452] font-mono"
                />
              </div>
            )}

            {/* Intensity Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Intensity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Moderate', 'High', 'Extreme'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIntensity(lvl)}
                    className={`py-2 px-3 rounded text-xs font-mono font-bold transition-all min-h-[38px] ${
                      intensity === lvl
                        ? 'bg-[#FDE7EA] dark:bg-[#35171B] border border-[#C1121F] dark:border-[#F04452] text-[#C1121F] dark:text-[#F04452]'
                        : 'bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] text-[#6B6B6B] dark:text-[#8B8D91] hover:text-[#171717] dark:hover:text-[#F5F5F2]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] uppercase font-medium">Notes (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key exercises, sets, or how you felt..."
                className="w-full bg-white dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded px-3 py-2 text-xs text-[#171717] dark:text-[#F5F5F2] placeholder-[#6B6B6B] dark:placeholder-[#8B8D91] focus:outline-none focus:border-[#C1121F] dark:focus:border-[#F04452]"
              />
            </div>
          </div>

          {/* Action Choice: Start Live vs Log Direct */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E8D6D9] dark:border-[#303238]">
            <button
              onClick={handleStartLive}
              className="flex-1 flex items-center justify-center gap-2 bg-[#FFF5F6] dark:bg-[#1D2025] text-[#C1121F] dark:text-[#F04452] hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] border border-[#E8D6D9] dark:border-[#303238] font-mono font-bold px-4 py-3 rounded text-xs min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-current" /> Start Live Timer
            </button>

            <button
              onClick={() => handleFinishWorkout(durationMins)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold px-4 py-3 rounded border-b-2 border-[#8F0D16] dark:border-[#C1121F] text-xs min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Completed Workout
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LIVE WORKOUT TIMER */}
      {step === 'live' && (
        <div className="p-8 text-center space-y-8 bg-white dark:bg-[#17191D] border border-[#E8D6D9] dark:border-[#303238] rounded-lg animate-in fade-in duration-200">
          <div className="space-y-2">
            <span className="text-4xl">{selectedOption.emoji}</span>
            <h2 className="text-xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2]">{workoutTitle || selectedOption.title}</h2>
            <p className="text-xs font-mono text-[#C1121F] dark:text-[#F04452]">WORKOUT IN PROGRESS</p>
          </div>

          <div className="py-8 bg-[#FFF5F6] dark:bg-[#0F1012] border border-[#E8D6D9] dark:border-[#303238] rounded-xl shadow-inner max-w-sm mx-auto">
            <div className="text-6xl font-mono font-bold text-[#C1121F] dark:text-[#F04452] tracking-tight">
              {formatTimerDisplay(liveSeconds)}
            </div>
            <p className="text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91] mt-2">Active Time Elapsed</p>
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex items-center gap-2 px-6 py-3 rounded font-mono font-bold text-xs transition-all min-h-[44px] ${
                isTimerRunning
                  ? 'bg-[#FFF5F6] dark:bg-[#1D2025] text-[#C1121F] dark:text-[#F04452] border border-[#C1121F] dark:border-[#F04452]'
                  : 'bg-[#C1121F] dark:bg-[#F04452] text-white border-b-2 border-[#8F0D16] dark:border-[#C1121F]'
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isTimerRunning ? 'Pause Session' : 'Resume Session'}
            </button>

            <button
              onClick={() => {
                const finalMins = Math.max(Math.round(liveSeconds / 60), 1);
                handleFinishWorkout(finalMins);
              }}
              className="flex items-center gap-2 bg-[#C1121F] dark:bg-[#F04452] hover:bg-[#8F0D16] dark:hover:bg-[#C1121F] text-white font-mono font-bold px-6 py-3 rounded border-b-2 border-[#8F0D16] dark:border-[#C1121F] text-xs min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4" /> Finish & Save
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SATISFYING SUMMARY RESULT CARD */}
      {step === 'summary' && summaryData && (
        <div className="p-8 text-center space-y-6 bg-white dark:bg-[#17191D] border-2 border-[#C1121F] dark:border-[#F04452] rounded-xl max-w-lg mx-auto animate-in zoom-in-95 duration-200 shadow-xl">
          <div className="space-y-2">
            <span className="text-5xl inline-block animate-bounce">{summaryData.emoji}</span>
            <h2 className="text-2xl font-serif font-bold text-[#171717] dark:text-[#F5F5F2]">{summaryData.title}</h2>
            <div className="flex justify-center items-center gap-3 text-xs font-mono text-[#6B6B6B] dark:text-[#8B8D91]">
              <span>{summaryData.duration} Mins Completed</span>
              {summaryData.distance && (
                <>
                  <span>•</span>
                  <span>{summaryData.distance}</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-[#FFF5F6] dark:bg-[#0F1012] p-4 rounded-lg border border-[#E8D6D9] dark:border-[#303238] space-y-3">
            <div className="flex justify-center items-center gap-6 font-mono font-bold text-sm">
              <div className="text-[#C1121F] dark:text-[#F04452] flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> +{summaryData.xpEarned} XP
              </div>
              <div className="text-[#171717] dark:text-[#F5F5F2] flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#C1121F] dark:text-[#F04452]" /> +{summaryData.goldEarned} Gold
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#C1121F] dark:text-[#F04452] font-bold pt-1 border-t border-[#E8D6D9] dark:border-[#303238]">
              <Flame className="w-4 h-4" /> 🔥 Streak Maintained!
            </div>
          </div>

          <p className="text-xs font-serif italic text-[#6B6B6B] dark:text-[#8B8D91]">
            &ldquo;Nice work. Your character got stronger today.&rdquo;
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <ShareButton
              variant="primary"
              label="Share Achievement 📸"
              className="flex-1 justify-center py-3 text-sm"
              data={{
                type: 'workout',
                title: summaryData.title,
                primaryMetric: `${summaryData.duration} MINS`,
                subtitle: summaryData.distance ? summaryData.distance : 'WORKOUT COMPLETE',
                xpEarned: summaryData.xpEarned,
                goldEarned: summaryData.goldEarned,
                streakCount: state.profile.streak_count,
                iconEmoji: summaryData.emoji,
                detailText: 'Nice work. Your character got stronger today.',
              }}
            />

            <button
              onClick={() => {
                setStep('select');
                setSummaryData(null);
              }}
              className="flex-1 bg-[#FFF5F6] dark:bg-[#1D2025] hover:bg-[#FDE7EA] dark:hover:bg-[#35171B] text-[#171717] dark:text-[#F5F5F2] border border-[#E8D6D9] dark:border-[#303238] font-mono font-bold px-4 py-3 rounded text-xs transition-all min-h-[44px]"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}

      <ScheduleWorkoutModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialWorkoutType={selectedOption.title}
      />
    </div>
  );
}


