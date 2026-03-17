"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Suggestion = { description: string; placeId: string };

type AddressAutocompleteInputProps = {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className: string;
  disabled?: boolean;
  readOnly?: boolean;
};

export function AddressAutocompleteInput({
  name,
  defaultValue = "",
  required = false,
  placeholder,
  className,
  disabled = false,
  readOnly = false,
}: AddressAutocompleteInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback((input: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (input.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places-autocomplete?input=${encodeURIComponent(input)}`,
        );
        if (!res.ok) return;

        const data = (await res.json()) as Suggestion[];
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setOpen(false);
      }
    }, 250);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        name={name}
        type="text"
        value={value}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          if (!disabled && !readOnly) fetchSuggestions(next);
        }}
        onFocus={() => {
          if (suggestions.length > 0 && !disabled && !readOnly) {
            setOpen(true);
          }
        }}
        className={className}
      />

      {open && suggestions.length > 0 && !disabled && !readOnly && (
        <ul className="absolute left-0 top-full z-40 mt-1 max-h-52 w-full overflow-auto rounded-md border border-eav-border bg-eav-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                className="w-full px-3.5 py-2.5 text-left font-body text-sm text-eav-black transition-colors hover:bg-eav-surface"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(s.description);
                  setSuggestions([]);
                  setOpen(false);
                }}
              >
                {s.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
