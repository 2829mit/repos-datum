import React, { useState, useEffect } from 'react';
import {
  DIESEL_SCORE_QUESTIONS,
  QuestionId,
  QuestionnaireOption,
  DieselScoreAnswers,
  calculateDieselScore,
  DieselScoreResult,
} from '../utils/dieselScore';

interface DieselScoreQuestionnaireModalProps {
  isOpen: boolean;
  onComplete: (result: DieselScoreResult) => void;
  onClose: () => void;
}

export const DieselScoreQuestionnaireModal: React.FC<DieselScoreQuestionnaireModalProps> = ({
  isOpen,
  onComplete,
  onClose,
}) => {
  const [answers, setAnswers] = useState<DieselScoreAnswers>({});

  // Lock background body scroll when questionnaire modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === 6;

  const handleSelectOption = (questionId: QuestionId, option: QuestionnaireOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAnswered) return;

    const fullAnswers = answers as Record<QuestionId, QuestionnaireOption>;
    const result = calculateDieselScore(fullAnswers);
    onComplete(result);
  };

  const procurementQuestions = DIESEL_SCORE_QUESTIONS.filter((q) => q.group === 'procurement');
  const operationQuestions = DIESEL_SCORE_QUESTIONS.filter((q) => q.group === 'operation');

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0f1115] text-white w-full max-w-3xl rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[850px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex-shrink-0 bg-[#0f1115] border-b border-white/10 px-5 py-4 md:px-8 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Assessment
                </span>
                <span className="text-[11px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono">
                  {answeredCount}/6 Answered
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                Diesel Score Questionnaire
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 h-1.5 flex-shrink-0">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${(answeredCount / 6) * 100}%` }}
          />
        </div>

        {/* Questionnaire Form - Scroll container restricted strictly inside modal */}
        <div className="overflow-y-auto overscroll-contain px-5 py-6 md:px-8 md:py-8 space-y-8 flex-1">
          {/* Introduction Card */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-gray-300 leading-relaxed">
            Answer the 6 quick questions below regarding your current fuel management to calculate your verified{' '}
            <span className="text-white font-semibold">Diesel Score</span>.
          </div>

          {/* GROUP 1: PROCUREMENT SCORE */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                <h3 className="text-sm md:text-base font-bold tracking-wider uppercase text-gray-200">
                  1. Procurement Score
                </h3>
              </div>
              <span className="text-xs text-gray-400">Questions 1–3</span>
            </div>

            <div className="space-y-6">
              {procurementQuestions.map((q) => {
                const selectedOption = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 md:p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                        Q{q.questionNumber} • {q.topic}
                      </span>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-white mb-4">
                      {q.question}
                    </h4>

                    <div className="space-y-2.5" role="radiogroup" aria-labelledby={`q-label-${q.id}`}>
                      {q.options.map((opt) => {
                        const isSelected = selectedOption?.id === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                              isSelected
                                ? 'bg-blue-600/15 border-blue-500/80 text-white shadow-md shadow-blue-500/10'
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] text-gray-300 hover:border-white/15'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-500 text-white'
                                    : 'border-white/30 bg-white/5'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="text-sm md:text-base font-medium">
                                {opt.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GROUP 2: OPERATION SCORE */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                <h3 className="text-sm md:text-base font-bold tracking-wider uppercase text-gray-200">
                  2. Operation Score
                </h3>
              </div>
              <span className="text-xs text-gray-400">Questions 4–6</span>
            </div>

            <div className="space-y-6">
              {operationQuestions.map((q) => {
                const selectedOption = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 md:p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        Q{q.questionNumber} • {q.topic}
                      </span>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-white mb-4">
                      {q.question}
                    </h4>

                    <div className="space-y-2.5" role="radiogroup" aria-labelledby={`q-label-${q.id}`}>
                      {q.options.map((opt) => {
                        const isSelected = selectedOption?.id === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                              isSelected
                                ? 'bg-indigo-600/15 border-indigo-500/80 text-white shadow-md shadow-indigo-500/10'
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] text-gray-300 hover:border-white/15'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-500 text-white'
                                    : 'border-white/30 bg-white/5'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="text-sm md:text-base font-medium">
                                {opt.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex-shrink-0 bg-[#0f1115] border-t border-white/10 px-5 py-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs md:text-sm text-gray-400">
            {isAllAnswered ? (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                All 6 questions answered
              </span>
            ) : (
              <span>Please answer all 6 questions to proceed ({6 - answeredCount} remaining)</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isAllAnswered}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-200 flex items-center justify-center gap-2 ${
              isAllAnswered
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 active:scale-[0.98] cursor-pointer'
                : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            <span>View Diesel Score</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DieselScoreQuestionnaireModal;
