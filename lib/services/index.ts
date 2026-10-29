import { HttpIdentityVerifier, type IdentityVerifier } from "./identity-verifier";

export const identityVerifier: IdentityVerifier = new HttpIdentityVerifier();