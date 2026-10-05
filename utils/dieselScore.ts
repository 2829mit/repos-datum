export type ScoreLevel = 'low' | 'moderate' | 'high';

export interface QuestionnaireOption {
  id: string;
  label: string;
  score: number;
}

export type QuestionId = 'procurement' | 'quality' | 'quantity' | 'storage' | 'dispensing' | 'authentication';

export interface QuestionnaireQuestion {
  id: QuestionId;
  group: 'procurement' | 'operation';
  groupTitle: string;
  sectionIndex: number;
  questionNumber: number;
  topic: string;
  question: string;
  options: QuestionnaireOption[];
}

export type DieselScoreAnswers = {
  [K in QuestionId]?: QuestionnaireOption;
};

export interface DieselScoreResult {
  procurementScore: number;
  operationScore: number;
  finalScore: number;
  procurementLevel: ScoreLevel;
  operationLevel: ScoreLevel;
  finalLevel: ScoreLevel;
  answers: {
    procurement: QuestionnaireOption;
    quality: QuestionnaireOption;
    quantity: QuestionnaireOption;
    storage: QuestionnaireOption;
    dispensing: QuestionnaireOption;
    authentication: QuestionnaireOption;
  };
}

export const DIESEL_SCORE_QUESTIONS: QuestionnaireQuestion[] = [
  // 1. PROCUREMENT SCORE GROUP
  {
    id: 'procurement',
    group: 'procurement',
    groupTitle: 'Procurement Score',
    sectionIndex: 1,
    questionNumber: 1,
    topic: 'Procurement',
    question: 'How do you get your diesel today?',
    options: [
      { id: 'proc_barrels', label: 'Diesel Brought In Barrels', score: 6 },
      { id: 'proc_bowser', label: 'Diesel Brought by unauthorized Bowser', score: 4 },
      { id: 'proc_pump', label: 'Diesel Brought on credit by petrol Pump', score: 8 },
    ],
  },
  {
    id: 'quality',
    group: 'procurement',
    groupTitle: 'Procurement Score',
    sectionIndex: 1,
    questionNumber: 2,
    topic: 'Quality',
    question: 'How do you check if your diesel Is good Quality?',
    options: [
      { id: 'qual_none', label: 'No Quality Check', score: 4 },
      { id: 'qual_density', label: 'Density check', score: 8 },
      { id: 'qual_water', label: 'Water check', score: 6 },
    ],
  },
  {
    id: 'quantity',
    group: 'procurement',
    groupTitle: 'Procurement Score',
    sectionIndex: 1,
    questionNumber: 3,
    topic: 'Quantity',
    question: 'How do you check if you received the right amount of diesel?',
    options: [
      { id: 'quan_dip', label: 'Check with a Dip rod', score: 6 },
      { id: 'quan_sensor', label: 'Check with Calibrated sensor & Dispenser', score: 8 },
      { id: 'quan_bowser', label: 'Depend on bowser Quality', score: 4 },
    ],
  },

  // 2. OPERATION SCORE GROUP
  {
    id: 'storage',
    group: 'operation',
    groupTitle: 'Operation Score',
    sectionIndex: 2,
    questionNumber: 4,
    topic: 'Storage',
    question: 'Where do you store your diesel on site?',
    options: [
      { id: 'stor_drums', label: 'Drums/Barrels', score: 4 },
      { id: 'stor_underground', label: 'Underground tank', score: 6 },
      { id: 'stor_approved', label: 'Approved Fuel Storage Tank', score: 8 },
    ],
  },
  {
    id: 'dispensing',
    group: 'operation',
    groupTitle: 'Operation Score',
    sectionIndex: 2,
    questionNumber: 5,
    topic: 'Dispensing',
    question: 'How do you dispense fuel into your vehicles or Machines?',
    options: [
      { id: 'disp_pump', label: 'Hand/Electric pump', score: 6 },
      { id: 'disp_bowser', label: 'Directly via bowser', score: 4 },
      { id: 'disp_partial', label: 'Partly automation', score: 8 },
    ],
  },
  {
    id: 'authentication',
    group: 'operation',
    groupTitle: 'Operation Score',
    sectionIndex: 2,
    questionNumber: 6,
    topic: 'Authentication',
    question: 'How do you track which Vehicle or Machine Received fuel?',
    options: [
      { id: 'auth_manual', label: 'Written/Manual records', score: 4 },
      { id: 'auth_team', label: 'Physical Check by the Site Team', score: 6 },
      { id: 'auth_rfid', label: 'RFID or Telematics', score: 8 },
    ],
  },
];

/**
 * Score classification:
 * - 1 to <5 = Low
 * - 5 to <8 = Moderate
 * - 8 to 10 = High
 *
 * 8.0 must be High, not Moderate.
 * 7.9 must be Moderate.
 * 5.0 must be Moderate.
 * 4.9 must be Low.
 */
export const classifyScore = (score: number): ScoreLevel => {
  const rounded = Math.round(score * 10) / 10;
  if (rounded >= 8.0) return 'high';
  if (rounded >= 5.0) return 'moderate';
  return 'low';
};

/**
 * If a calculated score has decimals, show up to 1 decimal place.
 * Whole numbers format cleanly without unnecessary trailing decimals (e.g. 8 vs 7.3).
 */
export const formatScore = (score: number): string => {
  const rounded = Math.round(score * 10) / 10;
  return Number(rounded.toFixed(1)).toString();
};

export const getScoreLevelLabel = (level: ScoreLevel): string => {
  switch (level) {
    case 'high':
      return 'High';
    case 'moderate':
      return 'Moderate';
    case 'low':
      return 'Low';
  }
};

export interface ScoreMessage {
  title: string;
  description: string;
}

export const SCORE_MESSAGES: Record<ScoreLevel, ScoreMessage> = {
  low: {
    title: 'Your Diesel score is low.',
    description:
      'This means there may be significant gaps in how fuel is procured, stored, dispensed, or tracked. Improving these processes can help reduce fuel losses and improve control.',
  },
  moderate: {
    title: 'Your Diesel score is moderate.',
    description:
      'This means some fuel losses from pilferage, spillage and wastage may still be adding to your costs.',
  },
  high: {
    title: 'Your Diesel score is high.',
    description:
      'Your current fuel management practices show a good level of control across procurement, storage, dispensing, and tracking.',
  },
};

export const SCORE_COLOR_CONFIG: Record<
  ScoreLevel,
  {
    donutColor: string;
    donutTrack: string;
    accentHex: string;
    glowGradient: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    lightCardBg: string;
    barColor: string;
  }
> = {
  low: {
    donutColor: '#EF4444',
    donutTrack: '#262626',
    accentHex: '#EF4444',
    glowGradient: 'radial-gradient(ellipse at top, rgba(239, 68, 68, 0.22) 0%, rgba(185, 28, 28, 0.08) 45%, transparent 70%)',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-500/20',
    lightCardBg: 'rgba(239, 68, 68, 0.04)',
    barColor: 'bg-red-500',
  },
  moderate: {
    donutColor: '#F59E0B',
    donutTrack: '#262626',
    accentHex: '#F59E0B',
    glowGradient: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.22) 0%, rgba(180, 83, 9, 0.08) 45%, transparent 70%)',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/20',
    lightCardBg: 'rgba(245, 158, 11, 0.04)',
    barColor: 'bg-amber-500',
  },
  high: {
    donutColor: '#10B981',
    donutTrack: '#262626',
    accentHex: '#10B981',
    glowGradient: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.08) 45%, transparent 70%)',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/20',
    lightCardBg: 'rgba(16, 185, 129, 0.04)',
    barColor: 'bg-emerald-500',
  },
};

export const calculateDieselScore = (
  answers: Record<QuestionId, QuestionnaireOption>
): DieselScoreResult => {
  const procurementScore = (answers.procurement.score + answers.quality.score + answers.quantity.score) / 3;
  const operationScore = (answers.storage.score + answers.dispensing.score + answers.authentication.score) / 3;
  const finalScore = (procurementScore + operationScore) / 2;

  return {
    procurementScore,
    operationScore,
    finalScore,
    procurementLevel: classifyScore(procurementScore),
    operationLevel: classifyScore(operationScore),
    finalLevel: classifyScore(finalScore),
    answers: {
      procurement: answers.procurement,
      quality: answers.quality,
      quantity: answers.quantity,
      storage: answers.storage,
      dispensing: answers.dispensing,
      authentication: answers.authentication,
    },
  };
};

export const DEFAULT_DIESEL_SCORE_RESULT: DieselScoreResult = calculateDieselScore({
  procurement: { id: 'proc_barrels', label: 'Diesel Brought In Barrels', score: 6 },
  quality: { id: 'qual_water', label: 'Water check', score: 6 },
  quantity: { id: 'quan_dip', label: 'Check with a Dip rod', score: 6 },
  storage: { id: 'stor_drums', label: 'Drums/Barrels', score: 4 },
  dispensing: { id: 'disp_bowser', label: 'Directly via bowser', score: 4 },
  authentication: { id: 'auth_manual', label: 'Written/Manual records', score: 4 },
});
