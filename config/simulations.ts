export interface SimulatedFeature {
  id: string;
  name: string;
  inThisDemo: string;
  inProduction: string;
}

export const simulatedFeatures: SimulatedFeature[] = [
  {
    id: "identity",
    name: "Identity verification",
    inThisDemo:
      "Checks the format, then a mock endpoint inside this app returns a made-up result. Only a masked value and a simulated reference are kept.",
    inProduction: "A licensed verification provider would check the number with the issuing authority, with consent.",
  },
  {
    id: "address-search",
    name: "Address suggestions",
    inThisDemo: "A small built-in list of sample places, matched as you type.",
    inProduction: "A maps or postal address service would suggest and validate real addresses.",
  },
  {
    id: "documents",
    name: "Document upload",
    inThisDemo:
      "Files are checked and optimised in your browser and kept in memory only. Nothing is uploaded, and files are lost on refresh.",
    inProduction: "Files would go to secure storage, be scanned for malware and be reviewed by staff.",
  },
  {
    id: "signature",
    name: "E-signature",
    inThisDemo: "A drawn or typed name saved in your browser. It has no legal effect.",
    inProduction: "A legally recognised e-signature method with an audit trail would be used.",
  },
  {
    id: "eligibility",
    name: "Eligibility and pre-approval",
    inThisDemo: "Simplified rules and illustrative rates calculated in your browser. The result is indicative only.",
    inProduction: "A lender's credit policy, bureau data and underwriting would decide.",
  },
  {
    id: "submission",
    name: "Application submission",
    inThisDemo:
      "Sends your reference, loan type, amount and term to a mock endpoint in this app. No lender receives anything.",
    inProduction: "The full application would go to a secured back end with an audit record.",
  },
  {
    id: "storage",
    name: "Saving your progress",
    inThisDemo: "Saved in this browser's local storage, which is not encrypted and is not shared across devices.",
    inProduction: "Saved on a secure server tied to an authenticated account.",
  },
];