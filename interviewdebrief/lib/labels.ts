import type { GutFeeling, InterviewFormat } from "@/lib/types";

export const formatLabel: Record<InterviewFormat, string> = {
  hr: "HR",
  user: "User",
  case: "Case",
};

export const gutLabel: Record<GutFeeling, string> = {
  jelek: "Rasanya jeblok",
  campur: "Campur aduk",
  tenang: "Cukup tenang",
};
