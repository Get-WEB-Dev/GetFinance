import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";
import { draftSchema } from "@/lib/validation/draft";
import type { ApplicationDraft } from "@/types/application";
import type { DraftRepository } from "./draft-repository";
import { LocalStorageDraftRepository } from "./local-storage-draft-repository";

/**
 * Browser storage is always written first (fast, works offline).
 * When the user is signed in, the draft is also mirrored to Supabase.
 */
export class HybridDraftRepository implements DraftRepository {
  private local = new LocalStorageDraftRepository();

  private async userId(): Promise<string | null> {
    if (!supabaseConfigured) return null;
    try {
      const { data } = await createClient().auth.getSession();
      return data.session?.user.id ?? null;
    } catch {
      return null;
    }
  }

  private async push(draft: ApplicationDraft): Promise<void> {
    const uid = await this.userId();
    if (!uid) return;
    const { error } = await createClient()
      .from("applications")
      .upsert({
        id: draft.id,
        user_id: uid,
        reference: draft.reference,
        loan_type: draft.loanType,
        country: draft.country,
        status: draft.submission ? "submitted" : "draft",
        draft,
        updated_at: draft.updatedAt,
      });
    if (error) console.warn("Cloud save failed:", error.message);
  }

  private parse(raw: unknown): ApplicationDraft | null {
    const parsed = draftSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  }

  async create(draft: ApplicationDraft): Promise<void> {
    await this.local.create(draft);
    await this.push(draft);
  }

  async load(id: string): Promise<ApplicationDraft | null> {
    const local = await this.local.load(id);
    const uid = await this.userId();
    if (!uid) return local;

    const { data } = await createClient()
      .from("applications")
      .select("draft")
      .eq("id", id)
      .maybeSingle();
    const remote = data ? this.parse(data.draft) : null;

    if (remote && (!local || remote.updatedAt > local.updatedAt)) {
      await this.local.save(remote);
      return remote;
    }
    return local;
  }

  async save(draft: ApplicationDraft): Promise<void> {
    await this.local.save(draft);
    await this.push(draft);
  }

  async remove(id: string): Promise<void> {
    await this.local.remove(id);
    const uid = await this.userId();
    if (uid) await createClient().from("applications").delete().eq("id", id);
  }

  async findByReference(reference: string): Promise<ApplicationDraft | null> {
    const local = await this.local.findByReference(reference);
    if (local) return local;
    const uid = await this.userId();
    if (!uid) return null;
    const { data } = await createClient()
      .from("applications")
      .select("draft")
      .eq("reference", reference)
      .maybeSingle();
    return data ? this.parse(data.draft) : null;
  }
}