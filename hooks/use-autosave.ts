"use client";

import { useEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export function useAutosave<T extends FieldValues>(
  form: UseFormReturn<T>,
  save: (values: T) => void,
  delayMs = 600,
) {
  const { watch, getValues } = form;
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const subscription = watch(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
        saveRef.current(getValues());
      }, delayMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timer !== undefined) {
        clearTimeout(timer);
        saveRef.current(getValues());
      }
    };
  }, [watch, getValues, delayMs]);
}