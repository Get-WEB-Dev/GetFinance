import { HttpIdentityVerifier, type IdentityVerifier } from "./identity-verifier";
import { HttpPlacesService, type PlacesService } from "./places-service";
import { SimulatedDocumentUploader, type DocumentUploader } from "./document-uploader";

export const documentUploader: DocumentUploader = new SimulatedDocumentUploader();

export const identityVerifier: IdentityVerifier = new HttpIdentityVerifier();
export const placesService: PlacesService = new HttpPlacesService();
