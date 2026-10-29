import { HttpIdentityVerifier, type IdentityVerifier } from "./identity-verifier";
import { HttpPlacesService, type PlacesService } from "./places-service";

export const identityVerifier: IdentityVerifier = new HttpIdentityVerifier();
export const placesService: PlacesService = new HttpPlacesService();
