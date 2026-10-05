import React, { useEffect, useState } from 'react';
import {
  DieselScoreResult,
  formatScore,
  getScoreLevelLabel,
  SCORE_MESSAGES,
  SCORE_COLOR_CONFIG,
  classifyScore,
} from '../utils/dieselScore';

interface DieselScoreResultModalProps {
  isOpen: boolean;
  result: DieselScoreResult | null;
  onClose: () => void;
  onCtaClick?: () => void;
}

interface DonutChartProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor?: string;
  animate?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({
  score,
  size = 190,
  strokeWidth = 14,
  color,
  trackColor = '#222225',
  animate = true,
}) => {
  const [currentScore, setCurrentScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setCurrentScore(score);
      }, 80);
      return () => clearTimeout(timer);
    } else {
      setCurrentScore(score);
    }
  }, [score, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(Math.max(currentScore / 10, 0), 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90 block">
      {/* Background Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Animated Colored Progress Bar */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
};

export const DieselScoreResultModal: React.FC<DieselScoreResultModalProps> = ({
  isOpen,
  result,
  onClose,
  onCtaClick,
}) => {
  // Lock background body scroll when result modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const {
    finalScore,
    finalLevel,
    procurementScore,
    procurementLevel,
    operationScore,
    operationLevel,
    answers,
  } = result;

  const finalTheme = SCORE_COLOR_CONFIG[finalLevel];
  const finalMessage = SCORE_MESSAGES[finalLevel];

  const procurementTheme = SCORE_COLOR_CONFIG[procurementLevel];
  const operationTheme = SCORE_COLOR_CONFIG[operationLevel];

  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      {/* Main Container - Dark Premium Mobile-First UI */}
      <div
        className="relative bg-[#0d0f14] text-white w-full max-w-md sm:max-w-lg md:max-w-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[880px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Glow Gradient according to Final Score Level */}
        <div
          className="absolute top-0 left-0 right-0 h-72 pointer-events-none transition-all duration-700"
          style={{ background: finalTheme.glowGradient }}
        />

        {/* Top Header Bar */}
        <div className="relative z-10 px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm"
              style={{ backgroundColor: finalTheme.accentHex }}
            />
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
              Diesel Score
            </h1>
          </div>

          {/* Exit icon in top right */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Exit Diesel Score"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="relative z-10 overflow-y-auto overscroll-contain px-5 sm:px-7 py-6 space-y-7 flex-1">
          
          {/* Central Donut Section */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative flex items-center justify-center">
              <DonutChart
                score={finalScore}
                size={200}
                strokeWidth={14}
                color={finalTheme.donutColor}
                trackColor={finalTheme.donutTrack}
              />
              {/* Inside Donut Score */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <div className="flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                    {formatScore(finalScore)}
                  </span>
                  <span className="text-xl sm:text-2xl text-gray-400 font-semibold ml-0.5">
                    /10
                  </span>
                </div>
                <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
                  Diesel Score
                </span>
                <span
                  className="inline-block mt-2 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm"
                  style={{
                    backgroundColor: finalTheme.badgeBg,
                    color: finalTheme.accentHex,
                    borderColor: `${finalTheme.accentHex}40`,
                  }}
                >
                  {getScoreLevelLabel(finalLevel)}
                </span>
              </div>
            </div>

            {/* Score Message Card */}
            <div className="mt-6 text-center max-w-md px-2">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                {finalMessage.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                {finalMessage.description}
              </p>
            </div>
          </div>

          {/* TWO SUMMARY CARDS: 1. Procurement Score, 2. Operation Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Procurement Score Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 shadow-lg">
              <div className="space-y-1.5 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Procurement Score
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">
                    {formatScore(procurementScore)}
                  </span>
                  <span className="text-sm font-semibold text-gray-400">/10</span>
                </div>
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: procurementTheme.badgeBg,
                      color: procurementTheme.accentHex,
                      borderColor: `${procurementTheme.accentHex}40`,
                    }}
                  >
                    {getScoreLevelLabel(procurementLevel)}
                  </span>
                </div>
              </div>

              {/* Small Donut */}
              <div className="flex-shrink-0">
                <DonutChart
                  score={procurementScore}
                  size={58}
                  strokeWidth={6}
                  color={procurementTheme.donutColor}
                  trackColor="#222225"
                />
              </div>
            </div>

            {/* Operation Score Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3 shadow-lg">
              <div className="space-y-1.5 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Operation Score
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">
                    {formatScore(operationScore)}
                  </span>
                  <span className="text-sm font-semibold text-gray-400">/10</span>
                </div>
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    style={{
                      backgroundColor: operationTheme.badgeBg,
                      color: operationTheme.accentHex,
                      borderColor: `${operationTheme.accentHex}40`,
                    }}
                  >
                    {getScoreLevelLabel(operationLevel)}
                  </span>
                </div>
              </div>

              {/* Small Donut */}
              <div className="flex-shrink-0">
                <DonutChart
                  score={operationScore}
                  size={58}
                  strokeWidth={6}
                  color={operationTheme.donutColor}
                  trackColor="#222225"
                />
              </div>
            </div>
          </div>

          {/* PROCUREMENT SCORE BREAKDOWN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold tracking-wider uppercase text-gray-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Procurement Breakdown
              </h3>
              <span className="text-[11px] text-gray-400">Avg {formatScore(procurementScore)}/10</span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
              {/* Delivery -> Procurement selected score */}
              <BreakdownRow
                label="Delivery"
                selectedOption={answers.procurement.label}
                score={answers.procurement.score}
              />
              {/* Quality -> Quality selected score */}
              <BreakdownRow
                label="Quality"
                selectedOption={answers.quality.label}
                score={answers.quality.score}
              />
              {/* Quantity -> Quantity selected score */}
              <BreakdownRow
                label="Quantity"
                selectedOption={answers.quantity.label}
                score={answers.quantity.score}
              />
            </div>
          </div>

          {/* OPERATION SCORE BREAKDOWN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold tracking-wider uppercase text-gray-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Operation Breakdown
              </h3>
              <span className="text-[11px] text-gray-400">Avg {formatScore(operationScore)}/10</span>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
              {/* Storage -> Storage selected score */}
              <BreakdownRow
                label="Storage"
                selectedOption={answers.storage.label}
                score={answers.storage.score}
              />
              {/* Dispensing -> Dispensing selected score */}
              <BreakdownRow
                label="Dispensing"
                selectedOption={answers.dispensing.label}
                score={answers.dispensing.score}
              />
              {/* Authentication -> Authentication selected score */}
              <BreakdownRow
                label="Authentication"
                selectedOption={answers.authentication.label}
                score={answers.authentication.score}
              />
            </div>
          </div>

        </div>

        {/* Bottom Sticky CTA Button */}
        <div className="relative z-10 p-5 bg-[#0d0f14]/95 backdrop-blur-md border-t border-white/10 flex flex-col items-center">
          <button
            onClick={handleCta}
            className="w-full py-3.5 px-6 rounded-full font-bold text-sm sm:text-base text-white shadow-xl transition-all duration-300 transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5"
            style={{
              backgroundColor: finalTheme.accentHex,
              boxShadow: `0 8px 24px -4px ${finalTheme.accentHex}60`,
            }}
          >
            <span>Organise your fuelling</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const BreakdownRow: React.FC<{
  label: string;
  selectedOption: string;
  score: number;
}> = ({ label, selectedOption, score }) => {
  const level = classifyScore(score);
  const theme = SCORE_COLOR_CONFIG[level];

  return (
    <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{label}</span>
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.accentHex }}
          />
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {selectedOption}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-16 sm:w-20 bg-white/10 rounded-full h-1.5 overflow-hidden hidden xs:block">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(score / 10) * 100}%`,
              backgroundColor: theme.accentHex,
            }}
          />
        </div>
        <div
          className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border"
          style={{
            backgroundColor: theme.badgeBg,
            color: theme.accentHex,
            borderColor: `${theme.accentHex}40`,
          }}
        >
          {score}/10
        </div>
      </div>
    </div>
  );
};

export default DieselScoreResultModal;
