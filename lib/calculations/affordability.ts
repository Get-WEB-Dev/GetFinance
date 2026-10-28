export interface AffordabilityInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingEmi: number;
  newEmi: number;
}

export interface Affordability {
  disposableIncome: number;
  foir: number;
}

export function calculateAffordability(input: AffordabilityInput): Affordability | null {
  const { monthlyIncome, monthlyExpenses, existingEmi, newEmi } = input;

  const values = [monthlyIncome, monthlyExpenses, existingEmi, newEmi];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (monthlyIncome <= 0) return null;

  return {
    disposableIncome: monthlyIncome - monthlyExpenses - existingEmi - newEmi,
    foir: (existingEmi + newEmi) / monthlyIncome,
  };
}