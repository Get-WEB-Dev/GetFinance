import { draftSchema } from "@/lib/validation/draft";
import type { ApplicationDraft } from "@/types/application";
import type { DraftRepository } from "./draft-repository";

const keyFor = (id: string) => `getfinance:draft:${id}`;

export class LocalStorageDraftRepository implements DraftRepository {
  async create(draft: ApplicationDraft): Promise<void> {
    if (window.localStorage.getItem(keyFor(draft.id)) !== null) {
      throw new Error("A draft with this id already exists.");
    }
    window.localStorage.setItem(keyFor(draft.id), JSON.stringify(draft));
  }

  async load(id: string): Promise<ApplicationDraft | null> {
    const raw = window.localStorage.getItem(keyFor(id));
    if (raw === null) return null;

    try {
      const parsed = draftSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  async save(draft: ApplicationDraft): Promise<void> {
    window.localStorage.setItem(keyFor(draft.id), JSON.stringify(draft));
  }

  async remove(id: string): Promise<void> {
    window.localStorage.removeItem(keyFor(id));
  }
}