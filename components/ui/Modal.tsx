"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-full max-w-3xl rounded-lg p-0 backdrop:bg-navy-950/60"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 id={titleId} className="font-semibold text-navy-900">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-slate-600 hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent-600"
        >
          <X aria-hidden className="h-5 w-5" />
          <span className="sr-only">Close preview</span>
        </button>
      </div>
      <div className="p-5">{open ? children : null}</div>
    </dialog>
  );
}