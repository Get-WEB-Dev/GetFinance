"use client";

import { useEffect, useId, useState } from "react";
import { placesService } from "@/lib/services";
import { PLACES_MIN_QUERY_LENGTH } from "@/lib/simulation/places";
import type { AddressSuggestion } from "@/types/places";

type Status = "idle" | "loading" | "results" | "empty" | "error";

const DEBOUNCE_MS = 300;

export function AddressAutocomplete({ onSelect }: { onSelect: (suggestion: AddressSuggestion) => void }) {
  const inputId = useId();
  const listId = `${inputId}-list`;
  const hintId = `${inputId}-hint`;
  const statusId = `${inputId}-status`;

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [filled, setFilled] = useState(false);

  const tooShort = query.trim().length < PLACES_MIN_QUERY_LENGTH;
  const effectiveStatus: Status = tooShort ? "idle" : status;
  const showList = open && effectiveStatus === "results" && suggestions.length > 0;

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < PLACES_MIN_QUERY_LENGTH) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const outcome = await placesService.search(trimmed, controller.signal);
      if (controller.signal.aborted) return;

      if (outcome.status === "error") {
        setSuggestions([]);
        setStatus("error");
        return;
      }
      setSuggestions(outcome.suggestions);
      setActiveIndex(-1);
      setStatus(outcome.suggestions.length > 0 ? "results" : "empty");
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function handleChange(value: string) {
    setQuery(value);
    setFilled(false);
    setOpen(true);
    if (value.trim().length >= PLACES_MIN_QUERY_LENGTH) setStatus("loading");
  }

  function select(suggestion: AddressSuggestion) {
    onSelect(suggestion);
    setQuery("");
    setSuggestions([]);
    setStatus("idle");
    setOpen(false);
    setActiveIndex(-1);
    setFilled(true);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const count = suggestions.length;

    if (event.key === "Enter") {
      event.preventDefault();
      if (showList && activeIndex >= 0) select(suggestions[activeIndex]);
      return;
    }
    if (event.key === "ArrowDown" && count > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % count);
    } else if (event.key === "ArrowUp" && count > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index <= 0 ? count - 1 : index - 1));
    } else if (event.key === "Escape") {
      if (showList) event.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const statusText =
    effectiveStatus === "loading"
      ? "Searching addresses…"
      : effectiveStatus === "empty"
        ? "No matching addresses found. Enter your address manually below."
        : effectiveStatus === "error"
          ? "Address search is unavailable. Enter your address manually below."
          : effectiveStatus === "results"
            ? `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"} available. Use the up and down arrow keys to review them.`
            : filled
              ? "The fields below were filled from your selection. Please check they are correct."
              : "";

  const statusIsVisible = effectiveStatus !== "results" && statusText !== "";

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <label htmlFor={inputId} className="block text-sm font-medium text-navy-900">
        Find your address <span className="font-normal text-slate-500">(optional)</span>
      </label>
      <p id={hintId} className="mt-1 text-sm text-slate-500">
        Simulated address search with demo data only. Try &ldquo;Pune&rdquo;, &ldquo;MG Road&rdquo; or
        &ldquo;Bengaluru&rdquo;. You can always type your address below instead.
      </p>

      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          aria-describedby={`${hintId} ${statusId}`}
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-600"
        />

        {showList && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Address suggestions"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-line bg-white py-1 shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.id}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`cursor-pointer px-3 py-2 text-sm text-navy-900 ${
                  index === activeIndex ? "bg-accent-600/15 font-medium" : ""
                }`}
              >
                {suggestion.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p
        id={statusId}
        role="status"
        className={statusIsVisible ? "mt-2 text-sm text-slate-600" : "sr-only"}
      >
        {statusText}
      </p>
    </div>
  );
}