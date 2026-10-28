import type { ApplicationDraft } from "@/types/application";

export interface DraftRepository {
  create(draft: ApplicationDraft): Promise<void>;
  load(id: string): Promise<ApplicationDraft | null>;
  save(draft: ApplicationDraft): Promise<void>;
  remove(id: string): Promise<void>;
}