/**
 * Validation Service
 * 
 * This service ensures that the AI detection output is strictly binary:
 * "AI-generated" or "Human-written".
 */

export type StrictLabel = "AI-generated" | "Human-written";

/**
 * Forces any classification result into a strict binary label.
 * 
 * Rules:
 * 1. If score > 50, it's "AI-generated"
 * 2. If score <= 50, it's "Human-written"
 * 3. Overrides "UNCERTAIN" or any other labels
 */
export function enforceStrictLabel(score: number, classification?: string): StrictLabel {
  // 1. Clean the input classification if provided
  const cleanInput = classification?.trim().toLowerCase() || "";

  // 2. Direct mapping if clear
  if (cleanInput.includes("ai-generated") || cleanInput.includes("ai")) {
    return "AI-generated";
  }
  if (cleanInput.includes("human-written") || cleanInput.includes("human")) {
    return "Human-written";
  }

  // 3. Fallback to deterministic score-based logic (Deterministic Override)
  // This ensures we NEVER return "uncertain"
  return score > 50 ? "AI-generated" : "Human-written";
}

/**
 * Validates and cleans the final string output to ensure it matches the exact requirements.
 */
export function validateFinalOutput(output: string): StrictLabel {
  const normalized = output.toLowerCase();
  
  if (normalized.includes("ai")) {
    return "AI-generated";
  }
  
  return "Human-written";
}
