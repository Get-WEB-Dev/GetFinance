import { HttpIdentityVerifier, type IdentityVerifier } from "./identity-verifier";
import { HttpPlacesService, type PlacesService } from "./places-service";
import { SimulatedDocumentUploader, type DocumentUploader } from "./document-uploader";
import { HttpApplicationSubmitter, type ApplicationSubmitter } from "./application-submitter";



export const identityVerifier: IdentityVerifier = new HttpIdentityVerifier();
export const placesService: PlacesService = new HttpPlacesService();
export const applicationSubmitter: ApplicationSubmitter = new HttpApplicationSubmitter();
export const documentUploader: DocumentUploader = new SimulatedDocumentUploader();
