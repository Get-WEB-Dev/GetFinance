import { LocalStorageDraftRepository } from "./local-storage-draft-repository";
import type { DraftRepository } from "./draft-repository";

export const draftRepository: DraftRepository = new LocalStorageDraftRepository();