import { draftSchema } from "@/lib/validation/draft";
import type { ApplicationDraft } from "@/types/application";
import type { DraftRepository } from "./draft-repository";

const KEY_PREFIX = "getfinance:draft:";
const keyFor = (id: string) => `${KEY_PREFIX}${id}`;

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

    async findByReference(reference: string): Promise<ApplicationDraft | null> {
    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index);
      if (!key || !key.startsWith(KEY_PREFIX)) continue;

      const draft = await this.load(key.slice(KEY_PREFIX.length));
      if (draft?.reference === reference) return draft;
    }
    return null;
  }
}