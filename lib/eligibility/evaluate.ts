import { getEligibilityPolicy, type EligibilityPolicy } from "@/config/eligibility";
import { getLoanProduct } from "@/config/loans";
import { applicantRules } from "@/config/rules";
import { calculateAffordability } from "@/lib/calculations/affordability";
import { maxPrincipalForEmi } from "@/lib/calculations/offer";
import { calculateRepayment } from "@/lib/calculations/repayment";
import { formatCurrency as formatMoney } from "@/lib/format/currency";
import { formatPercent } from "@/lib/format/percent";
import type { Decision, EligibilityInput, EligibilityResult, RuleOutcome, RuleResult } from "./types";

const EPSILON = 1e-9;
const ROUND_DOWN_TO = 1_000;

function atMost(value: number, limit: number, referLimit = limit): RuleOutcome {
  if (value <= limit + EPSILON) return "pass";
  if (value <= referLimit + EPSILON) return "refer";
  return "fail";
}

function atLeast(value: number, limit: number, referLimit = limit): RuleOutcome {
  if (value >= limit - EPSILON) return "pass";
  if (value >= referLimit - EPSILON) return "refer";
  return "fail";
}

function computeMaxAmount(input: EligibilityInput, policy: EligibilityPolicy): number | null {
  const product = getLoanProduct(input.loanType, input.country);

  const emiByFoir = policy.maxFoir * input.monthlyIncome - input.existingEmi;
  const emiByDisposable =
    input.monthlyIncome - input.monthlyExpenses - input.existingEmi - policy.minDisposableIncome;
  const emiCapacity = Math.min(emiByFoir, emiByDisposable);
  if (emiCapacity <= 0) return null;

  const byEmi = maxPrincipalForEmi(emiCapacity, input.annualRatePercent, input.termMonths);
  if (byEmi === null) return null;

  const caps = [byEmi, policy.maxLoanToAnnualIncome * input.monthlyIncome * 12, product.maxAmount];
  if (policy.maxLtv !== undefined && input.propertyValue) {
    caps.push(policy.maxLtv * input.propertyValue);
  }

  const rounded = Math.floor(Math.min(...caps) / ROUND_DOWN_TO) * ROUND_DOWN_TO;
  return rounded >= product.minAmount ? rounded : null;
}

/**
 * Returns null when the inputs can't be evaluated (for example a missing property value on a home loan).
 */
export function evaluateEligibility(input: EligibilityInput): EligibilityResult | null {
  const policy = getEligibilityPolicy(input.loanType, input.country);
  const formatCurrency = (amount: number) => formatMoney(amount, input.country);

  const repayment = calculateRepayment(input.requestedAmount, input.annualRatePercent, input.termMonths);
  if (!repayment) return null;

  const affordability = calculateAffordability({
    monthlyIncome: input.monthlyIncome,
    monthlyExpenses: input.monthlyExpenses,
    existingEmi: input.existingEmi,
    newEmi: repayment.monthlyPayment,
  });
  if (!affordability) return null;

  const rules: RuleResult[] = [];

  rules.push({
    id: "age",
    label: "Applicant age",
    outcome: atLeast(input.age, applicantRules.minAge) === "pass" && atMost(input.age, applicantRules.maxAge) === "pass" ? "pass" : "fail",
    yourValue: `${input.age} years`,
    requirement: `${applicantRules.minAge} to ${applicantRules.maxAge} years`,
  });

  const ageAtMaturity = input.age + input.termMonths / 12;
  rules.push({
    id: "maturity-age",
    label: "Age at end of loan",
    outcome: atMost(ageAtMaturity, policy.maxAgeAtMaturity),
    yourValue: `${Math.ceil(ageAtMaturity)} years`,
    requirement: `At most ${policy.maxAgeAtMaturity} years`,
    hint: "Choose a shorter term so the loan ends earlier.",
  });

  rules.push({
    id: "income",
    label: "Monthly income",
    outcome: atLeast(input.monthlyIncome, policy.minMonthlyIncome),
    yourValue: formatCurrency(input.monthlyIncome),
    requirement: `At least ${formatCurrency(policy.minMonthlyIncome)}`,
  });

  rules.push({
    id: "foir",
    label: "Income committed to loan repayments",
    outcome: atMost(affordability.foir, policy.maxFoir, policy.maxFoir + policy.foirReferMargin),
    yourValue: formatPercent(affordability.foir),
    requirement: `At most ${formatPercent(policy.maxFoir)}`,
    hint: "Reduce the loan amount, extend the term, or pay down existing loans.",
  });

  rules.push({
    id: "disposable-income",
    label: "Money left each month",
    outcome: atLeast(affordability.disposableIncome, policy.minDisposableIncome, 0),
    yourValue: formatCurrency(affordability.disposableIncome),
    requirement: `At least ${formatCurrency(policy.minDisposableIncome)}`,
    hint: "A smaller loan or longer term lowers the monthly payment.",
  });

  const loanToIncome = input.requestedAmount / (input.monthlyIncome * 12);
  rules.push({
    id: "loan-to-income",
    label: "Loan size compared with income",
    outcome: atMost(loanToIncome, policy.maxLoanToAnnualIncome),
    yourValue: `${loanToIncome.toFixed(1)}× annual income`,
    requirement: `At most ${policy.maxLoanToAnnualIncome}× annual income`,
    hint: "Request a smaller amount.",
  });

  if (policy.maxLtv !== undefined) {
    if (!input.propertyValue || input.propertyValue <= 0) return null;
    const ltv = input.requestedAmount / input.propertyValue;
    rules.push({
      id: "ltv",
      label: "Loan as a share of property value",
      outcome: atMost(ltv, policy.maxLtv, policy.maxLtv + (policy.ltvReferMargin ?? 0)),
      yourValue: formatPercent(ltv),
      requirement: `At most ${formatPercent(policy.maxLtv)}`,
      hint: "Increase your down payment or request a smaller amount.",
    });
  }

  if (policy.minYearsOperating !== undefined) {
    if (input.yearsOperating === null) return null;
    rules.push({
      id: "business-vintage",
      label: "Years the business has operated",
      outcome: atLeast(input.yearsOperating, policy.minYearsOperating, policy.referYearsOperating ?? policy.minYearsOperating),
      yourValue: `${input.yearsOperating} years`,
      requirement: `At least ${policy.minYearsOperating} years`,
    });
  }

  if (policy.minYearsInCurrentWork !== undefined) {
    if (input.employmentStatus === "unemployed") {
      rules.push({
        id: "work-stability",
        label: "Employment or business history",
        outcome: "refer",
        yourValue: "Not currently employed",
        requirement: "Stable employment or business history",
        hint: "An adviser would need to review your other income sources.",
      });
    } else {
      if (input.yearsInCurrentWork === null) return null;
      rules.push({
        id: "work-stability",
        label: "Employment or business history",
        outcome: atLeast(input.yearsInCurrentWork, policy.minYearsInCurrentWork, 0),
        yourValue: `${input.yearsInCurrentWork} years`,
        requirement: `At least ${policy.minYearsInCurrentWork} year`,
      });
    }
  }

  const decision: Decision = rules.some((rule) => rule.outcome === "fail")
    ? "not-eligible"
    : rules.some((rule) => rule.outcome === "refer")
      ? "review"
      : "eligible";

  return {
    decision,
    rules,
    annualRatePercent: input.annualRatePercent,
    monthlyPayment: repayment.monthlyPayment,
    totalPayable: repayment.totalPayable,
    totalInterest: repayment.totalInterest,
    foir: affordability.foir,
    disposableIncome: affordability.disposableIncome,
    maxAmount: computeMaxAmount(input, policy),
  };
}