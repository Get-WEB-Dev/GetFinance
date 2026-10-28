"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { draftRepository } from "@/lib/persistence";
import type { ApplicationDraft, DraftPatch, SaveState } from "@/types/application";
import { reconcileDraft } from "@/lib/draft/reconcile";


type LoadStatus = "loading" | "ready" | "missing";


interface DraftContextValue {
  status: LoadStatus;
  draft: ApplicationDraft | null;
  saveState: SaveState;
  updateDraft: (patch: DraftPatch) => Promise<void>;
  discard: () => Promise<void>;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({
  applicationId,
  children,
}: {
  applicationId: string;
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const draftRef = useRef<ApplicationDraft | null>(null);
  const saveTicket = useRef(0);

  useEffect(() => {
    let cancelled = false;

    draftRepository
      .load(applicationId)
      .then((loaded) => {
        if (cancelled) return;
        draftRef.current = loaded;
        setDraft(loaded);
        setStatus(loaded ? "ready" : "missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const updateDraft = useCallback(async (patch: DraftPatch) => {
    const current = draftRef.current;
    if (!current) return;

    const changed = (Object.keys(patch) as (keyof DraftPatch)[]).some(
      (key) => patch[key] !== current[key],
    );
    if (!changed) return;

        let next: ApplicationDraft = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    const completed = patch.completedSteps;
    if (completed) {
      next.stepsToReview = (patch.stepsToReview ?? current.stepsToReview).filter(
        (slug) => !completed.includes(slug),
      );
    }

    if (completed || patch.loanType) {
      next = reconcileDraft(next);
    
    };
    draftRef.current = next;
    setDraft(next);

    const ticket = ++saveTicket.current;
    setSaveState("saving");
    try {
      await draftRepository.save(next);
      if (ticket === saveTicket.current) setSaveState("saved");
    } catch {
      if (ticket === saveTicket.current) setSaveState("error");
    }
  }, []);

  const discard = useCallback(async () => {
    draftRef.current = null;
    await draftRepository.remove(applicationId);
  }, [applicationId]);

  const value = useMemo(
    () => ({ status, draft, saveState, updateDraft, discard }),
    [status, draft, saveState, updateDraft, discard],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft(): DraftContextValue {
  const context = useContext(DraftContext);
  if (!context) throw new Error("useDraft must be used inside <DraftProvider>.");
  return context;
}
export function useReadyDraft() {
  const { draft, ...rest } = useDraft();
  if (!draft) throw new Error("useReadyDraft must be used where a draft is loaded.");
  return { draft, ...rest };
}