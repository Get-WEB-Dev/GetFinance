import { HybridDraftRepository } from "./hybrid-draft-repository";
import type { DraftRepository } from "./draft-repository";

export const draftRepository: DraftRepository = new HybridDraftRepository();