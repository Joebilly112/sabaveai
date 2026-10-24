export const medicalClaims = ["cure", "protects your lungs", "prevents illness", "kills germs"];

// Unicode boundaries avoid substring false positives (e.g. "cheap" in "cheaper").
export function findViolations(text: string, neverSay: string[]): string[] {
  const normalized = text.normalize("NFKC");
  return [...new Set([...neverSay, ...medicalClaims].map(term => term.trim()).filter(Boolean))]
    .filter(term => {
      const escaped = term.normalize("NFKC").replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
      return new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, "iu").test(normalized);
    });
}
