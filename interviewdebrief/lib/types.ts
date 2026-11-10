export const interviewFormats = ["hr", "user", "case"] as const;
export const gutFeelings = ["jelek", "campur", "tenang"] as const;

export type InterviewFormat = (typeof interviewFormats)[number];
export type GutFeeling = (typeof gutFeelings)[number];

export interface DebriefInput {
  role: string;
  format: InterviewFormat;
  asked: string;
  durationMinutes: number;
  gut: GutFeeling;
}

export type DimensionKey = "structure" | "clarity" | "examples" | "questions";

export interface DimensionScore {
  key: DimensionKey;
  label: string;
  score: number;
  note: string;
}

export interface Scorecard {
  overall: number;
  band: string;
  spiralNote: string;
  dimensions: DimensionScore[];
  fixes: string[];
  narrativeSource: "coach" | "deepseek";
}

export interface DebriefRecord extends Scorecard {
  id: string;
  createdAt: string;
  input: DebriefInput;
  paid: boolean;
  orderId?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  snapTokenAt?: string;
  paymentStatus?: string;
}

export interface PublicDebrief {
  id: string;
  paid: boolean;
  role: string;
  format: InterviewFormat;
  durationMinutes: number;
  gut: GutFeeling;
  asked: string;
  overall: number;
  band: string;
  spiralNote: string;
  dimensionLabels: string[];
  dimensions?: DimensionScore[];
  fixes?: string[];
  priceIdr: number;
}
