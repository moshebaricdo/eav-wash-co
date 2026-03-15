"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "iconoir-react";
import { trackContactClick, trackEvent } from "@/lib/analytics";
import { getStoredAttribution } from "@/lib/attribution";

/* ─────────────────────────────────────────────────────────
 * ESTIMATE FORM — MULTI-STEP FLOW
 *
 * Step 1: What needs cleaning? (2x2 multi-select tile grid)
 *         + When do you need this? (single-select pills)
 * Step 2: Your details (text inputs)
 *
 * Props:
 *   variant  — "dark" (default) or "light"
 *   inCard   — when true, form manages its own px so the
 *              progress bar divider bleeds edge-to-edge
 * ───────────────────────────────────────────────────────── */

const STEP_TRANSITION = {
  slideDistance: 40,
  spring: { type: "spring" as const, stiffness: 400, damping: 35 },
};

/* ─── Step data ─────────────────────────────────────────── */

const SURFACES: { id: string; label: string }[] = [
  { id: "driveway", label: "Driveway" },
  { id: "patio-deck", label: "Patio / Deck" },
  { id: "walkways", label: "Walkways" },
  { id: "other", label: "Other" },
];

const TIMELINES = [
  { id: "asap", label: "ASAP" },
  { id: "1-2-weeks", label: "1–2 Weeks" },
  { id: "flexible", label: "Flexible" },
];

const TOTAL_STEPS = 2;

/* ─── Validation helpers ────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns true when the string contains at least 10 digit characters */
function isValidPhone(v: string) {
  return v.replace(/\D/g, "").length >= 10;
}

function isValidEmail(v: string) {
  return EMAIL_RE.test(v.trim());
}

function formatPhoneInput(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function normalizeTimeline(value: string) {
  if (value === "asap" || value === "1-2-weeks" || value === "flexible") {
    return value;
  }
  return "unknown";
}

/* ─── Form state type ───────────────────────────────────── */

type FormData = {
  surfaces: string[];
  otherDetails: string;
  timeline: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

type FieldErrors = {
  name?: string;
  phone?: string;
  email?: string;
};

const INITIAL_FORM: FormData = {
  surfaces: [],
  otherDetails: "",
  timeline: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

/* ─── Color tokens by variant ────────────────────────────── */

const COLORS = {
  dark: {
    heading: "text-eav-cream",
    sub: "text-eav-cream/70",
    progressBg: "bg-eav-cream/10",
    pillIdle: "border-eav-cream/30 text-eav-cream/75 hover:border-eav-cream/60 hover:text-eav-cream",
    pillActive: "bg-eav-cream border-eav-cream text-eav-black",
    inputBorder: "border-eav-cream/20",
    inputText: "text-eav-cream",
    inputPlaceholder: "placeholder:text-eav-cream/20",
    inputLabel: "text-eav-cream/50",
    navIdle: "text-eav-cream/30",
    navEnabled: "text-eav-cream/60 hover:text-eav-cream",
    continueDisabled: "bg-eav-cream/10 text-eav-cream/30",
    divider: "border-eav-cream/10",
    dividerBg: "bg-eav-cream/10",
    reviewQuote: "text-eav-cream",
    reviewAttrib: "text-eav-cream/60",
    successHeading: "text-eav-cream",
    successSub: "text-eav-cream/60",
  },
  light: {
    heading: "text-eav-black",
    sub: "text-eav-black/80",
    progressBg: "bg-eav-black/10",
    pillIdle: "border-eav-black/20 text-eav-black/80 hover:border-eav-black",
    pillActive: "bg-eav-black border-eav-black text-eav-white",
    inputBorder: "border-eav-black/20",
    inputText: "text-eav-black",
    inputPlaceholder: "placeholder:text-eav-black/40",
    inputLabel: "text-eav-black",
    navIdle: "text-eav-black/30",
    navEnabled: "text-eav-black/50 hover:text-eav-black",
    continueDisabled: "bg-eav-black/10 text-eav-black/30",
    divider: "border-eav-black/10",
    dividerBg: "bg-eav-black/10",
    reviewQuote: "text-eav-black",
    reviewAttrib: "text-eav-black/60",
    successHeading: "text-eav-black",
    successSub: "text-eav-black/50",
  },
};

/* ─── Pill selector (multi-select) ──────────────────────── */

function SurfaceTileSelect({
  options,
  selected,
  onToggle,
  c,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  c: (typeof COLORS)["dark"];
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((opt) => {
        const isActive = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            className={`
              flex items-center justify-between gap-2.5 rounded-sm px-3.5 py-3
              border-2 text-left transition-all duration-150 cursor-pointer active:scale-[0.98]
              ${isActive ? c.pillActive : c.pillIdle}
            `}
            aria-pressed={isActive}
          >
            <span className="font-body text-[14px] font-semibold leading-tight">
              {opt.label}
            </span>
            <span
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-eav-orange text-eav-white transition-opacity ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden="true"
            >
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Timeline selector ─────────────────────────────────── */

function TimelineSelect({
  options,
  selected,
  onSelect,
  c,
}: {
  options: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  c: (typeof COLORS)["dark"];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="When do you need this?">
      {options.map((opt) => {
        const isActive = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`
              group inline-flex w-full items-center justify-start gap-2.5 px-3 py-2.5 rounded-sm font-body font-semibold text-sm
              border-2 transition-all duration-150 cursor-pointer active:scale-[0.98]
              ${
                isActive
                  ? "border-eav-black text-eav-black"
                  : "border-eav-black/20 text-eav-black/80 hover:border-eav-black hover:text-eav-black"
              }
            `}
            role="radio"
            aria-checked={isActive}
          >
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                isActive
                  ? "border-eav-orange bg-eav-orange/10"
                  : "border-current bg-transparent group-hover:bg-eav-orange/10"
              }`}
              aria-hidden="true"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isActive ? "bg-eav-orange" : "bg-transparent"
                }`}
              />
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Shared input class builder ─────────────────────────── */

function inputClass(c: (typeof COLORS)["dark"]) {
  return `bg-transparent border-2 ${c.inputBorder} rounded-sm px-3.5 py-2.5 font-body ${c.inputText} text-sm ${c.inputPlaceholder} focus:border-eav-black outline-eav-orange`;
}

/* ─── Text input ────────────────────────────────────────── */

function FormInput({
  label,
  name,
  type = "text",
  inputMode,
  autoComplete,
  value,
  onChange,
  required = false,
  placeholder,
  error,
  c,
}: {
  label: string;
  name: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  c: (typeof COLORS)["dark"];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className={`font-body text-xs ${c.inputLabel}`}
      >
        {label}
        {required && <span className="text-eav-orange ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className={`${inputClass(c)} ${error ? "!border-red-500" : ""}`}
      />
      {error && (
        <p className="font-body text-[12px] text-red-500">{error}</p>
      )}
    </div>
  );
}

/* ─── Address autocomplete (Google Places API New) ───────── */

type Suggestion = { description: string; placeId: string };

function AddressAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  c,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  c: (typeof COLORS)["dark"];
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  /* Position the portal dropdown beneath the input */
  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  }, []);

  /* Fetch suggestions from Places API (New) via our API route */
  const fetchSuggestions = useCallback((input: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (input.length < 3) {
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
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        if (data.length > 0) {
          updatePosition();
          setOpen(true);
        } else {
          setOpen(false);
        }
      } catch {
        /* silent */
      }
    }, 250);
  }, [updatePosition]);

  const handleChange = (v: string) => {
    onChange(v);
    fetchSuggestions(v);
  };

  const handleSelect = (s: Suggestion) => {
    onChange(s.description);
    setSuggestions([]);
    setOpen(false);
  };

  /* Close dropdown on outside click or page scroll */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        inputRef.current && !inputRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      const target = e.target as Node | null;
      // Keep dropdown open when user scrolls inside suggestion list.
      if (target && dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const dropdown =
    open && suggestions.length > 0
      ? createPortal(
          <ul
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-eav-white border border-eav-black/10 rounded-sm shadow-lg max-h-48 overflow-auto"
          >
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  className="w-full text-left px-3.5 py-2.5 font-body text-sm text-eav-black hover:bg-eav-black/[0.04] cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(s)}
                >
                  {s.description}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="address"
        className={`font-body text-xs ${c.inputLabel}`}
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id="address"
        name="address"
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) {
            updatePosition();
            setOpen(true);
          }
        }}
        onBlur={() => {
          // Delay to allow click on dropdown item
          setTimeout(() => setOpen(false), 150);
        }}
        placeholder={placeholder}
        className={inputClass(c)}
      />
      {dropdown}
    </div>
  );
}

/* ─── Review type ────────────────────────────────────────── */

export type ReviewData = {
  stars: number;
  quote: string;
  name: string;
  location: string;
};

/* ─── Main form component ───────────────────────────────── */

export function EstimateForm({
  variant = "dark",
  inCard = false,
  onSubmitted,
}: {
  variant?: "dark" | "light";
  inCard?: boolean;
  onSubmitted?: () => void;
} = {}) {
  const c = COLORS[variant];
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hasTrackedFormStart = useRef(false);

  const trackEstimateFormStart = useCallback(() => {
    if (hasTrackedFormStart.current) return;
    hasTrackedFormStart.current = true;
    trackEvent("estimate_form_start");
  }, []);

  useEffect(() => {
    trackEvent("estimate_step_view", { step: currentStep + 1 });
  }, [currentStep]);

  /* Padding helpers for inCard mode */
  const px = inCard ? "px-5 sm:px-5" : "";
  const pb = inCard ? "pb-5 sm:pb-5" : "";

  /** Light validation — checks required + format */
  const validateStep2 = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) {
      errs.phone = "Phone is required";
    } else if (!isValidPhone(form.phone)) {
      errs.phone = "Enter a valid phone number";
    }
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      errs.email = "Enter a valid email address";
    }
    return errs;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return form.surfaces.length > 0 && form.timeline !== "";
      case 1:
        return form.name.trim() !== "" && form.phone.trim() !== "" && form.email.trim() !== "";
      default:
        return false;
    }
  };

  const goNext = () => {
    if (currentStep < TOTAL_STEPS - 1 && canProceed()) {
      trackEvent("estimate_step_continue", {
        step_from: currentStep + 1,
        step_to: currentStep + 2,
      });
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
      setFieldErrors({});
      setSubmitError("");
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    // Validate fields before submitting
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) {
      trackEvent("estimate_submit_error", {
        error_type: "validation",
        invalid_fields: Object.keys(errs).join(","),
      });
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSubmitError("");
    setSubmitting(true);
    trackContactClick({
      channel: "estimate_form",
      placement: "estimate_form",
    });

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attribution: getStoredAttribution() }),
      });

      if (res.ok) {
        trackEvent("generate_lead", {
          channel: "estimate_form",
          placement: "estimate_form",
          selected_services_count: form.surfaces.length,
          timeline: normalizeTimeline(form.timeline),
          has_address: Boolean(form.address.trim()),
          has_notes: Boolean(form.notes.trim()),
        });
        onSubmitted?.();
      } else {
        const data = await res.json().catch(() => null);
        trackEvent("estimate_submit_error", {
          error_type: "api_response",
          status_code: res.status,
        });
        setSubmitError(
          data?.error || "Something went wrong. Please try again.",
        );
      }
    } catch {
      trackEvent("estimate_submit_error", {
        error_type: "network",
      });
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSurface = (id: string) => {
    trackEstimateFormStart();
    const isSelectedNext = !form.surfaces.includes(id);
    trackEvent("estimate_option_select", {
      option_group: "surfaces",
      option_value: id,
      selected: isSelectedNext,
    });

    setForm((f) => ({
      ...f,
      surfaces: f.surfaces.includes(id)
        ? f.surfaces.filter((s) => s !== id)
        : [...f.surfaces, id],
      otherDetails:
        id === "other" && f.surfaces.includes("other") ? "" : f.otherDetails,
    }));
  };

  const stepVariants = {
    enter: (dir: number) => ({
      x: dir * STEP_TRANSITION.slideDistance,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir * -STEP_TRANSITION.slideDistance,
      opacity: 0,
    }),
  };

  return (
    <div>
      {/* Progress bar — edge-to-edge divider */}
      <div className={`${c.progressBg} h-[3px] overflow-hidden`}>
        <motion.div
          className="h-full bg-eav-orange"
          initial={false}
          animate={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
          transition={STEP_TRANSITION.spring}
        />
      </div>

      {/* Step content — white bg in card mode, padded */}
      <div className={`${inCard ? "bg-eav-white" : ""} ${px} pt-5 pb-5`}>
        <div className="relative min-h-[450px] sm:min-h-[380px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={STEP_TRANSITION.spring}
            >
              {currentStep === 0 && (
                <div>
                  {/* Surfaces */}
                  <h2 className={`font-body font-semibold text-[18px] ${c.heading} mb-1`}>
                    What needs cleaning?
                  </h2>
                  <p className={`font-body text-[14px] ${c.sub} mb-5`}>
                    Select all that apply.
                  </p>
                  <SurfaceTileSelect
                    options={SURFACES}
                    selected={form.surfaces}
                    onToggle={toggleSurface}
                    c={c}
                  />
                  {form.surfaces.includes("other") && (
                    <div className="mt-3">
                      <FormInput
                        label="What else needs cleaning?"
                        name="otherDetails"
                        value={form.otherDetails}
                        onChange={(v) => setForm((f) => ({ ...f, otherDetails: v }))}
                        placeholder="Short description"
                        c={c}
                      />
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="mt-7">
                    <h2 className={`font-body font-semibold text-[18px] ${c.heading} mb-1`}>
                      When do you need this?
                    </h2>
                    <p className={`font-body text-[14px] ${c.sub} mb-4`}>
                      No pressure — just helps us plan.
                    </p>
                    <TimelineSelect
                      options={TIMELINES}
                      selected={form.timeline}
                      onSelect={(id) => {
                        trackEstimateFormStart();
                        trackEvent("estimate_option_select", {
                          option_group: "timeline",
                          option_value: id,
                        });
                        setForm((f) => ({ ...f, timeline: id }));
                      }}
                      c={c}
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h2 className={`font-body font-semibold text-[18px] ${c.heading} mb-1`}>
                    How do we reach you?
                  </h2>
                  <p className={`font-body text-[14px] ${c.sub} mb-5`}>
                    No spam, we promise.
                  </p>

                  {/* Submission error banner */}
                  {submitError && (
                    <div className="mb-4 rounded-sm bg-red-500/10 border border-red-500/30 px-3.5 py-2.5">
                      <p className="font-body text-sm text-red-500">{submitError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormInput
                      label="Name"
                      name="name"
                      autoComplete="name"
                      value={form.name}
                      onChange={(v) => {
                        setForm((f) => ({ ...f, name: v }));
                        if (fieldErrors.name) setFieldErrors((e) => ({ ...e, name: undefined }));
                      }}
                      required
                      placeholder="Your name"
                      error={fieldErrors.name}
                      c={c}
                    />
                    <FormInput
                      label="Phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(v) => {
                        setForm((f) => ({ ...f, phone: formatPhoneInput(v) }));
                        if (fieldErrors.phone) setFieldErrors((e) => ({ ...e, phone: undefined }));
                      }}
                      required
                      placeholder="(470) 555-1234"
                      error={fieldErrors.phone}
                      c={c}
                    />
                    <div className="sm:col-span-2">
                      <FormInput
                        label="Email Address"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(v) => {
                          setForm((f) => ({ ...f, email: v }));
                          if (fieldErrors.email) setFieldErrors((e) => ({ ...e, email: undefined }));
                        }}
                        required
                        placeholder="you@email.com"
                        error={fieldErrors.email}
                        c={c}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <AddressAutocomplete
                        label="Property Address (optional)"
                        value={form.address}
                        onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                        placeholder="Start typing an address..."
                        c={c}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="notes"
                          className={`font-body text-xs ${c.inputLabel}`}
                        >
                          Anything else? (optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={form.notes}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, notes: e.target.value }))
                          }
                          rows={1}
                          placeholder="Tell us more about what you need..."
                          className={`${inputClass(c)} h-[44px] resize-none`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Navigation — divider + action buttons */}
      <div className={`${c.dividerBg} h-px`} />
      <div className={`${px} py-4 ${pb}`}>
        {currentStep === 0 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed()}
            className={`
              h-12 w-full inline-flex items-center justify-center gap-1.5 font-body font-semibold text-sm rounded-sm transition-all cursor-pointer
              ${
                canProceed()
                  ? "bg-eav-orange text-eav-white hover:brightness-95 active:scale-[0.98]"
                  : c.continueDisabled + " cursor-not-allowed"
              }
            `}
          >
            Continue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <div className="flex items-stretch gap-3">
            <button
              type="button"
              onClick={goBack}
              className={`
                inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm
                border-2 border-eav-black bg-eav-black text-eav-white
                transition-all cursor-pointer hover:bg-eav-black/85 active:scale-[0.98]
              `}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className={`
                h-12 inline-flex flex-1 items-center justify-center gap-1.5 font-body font-semibold text-sm rounded-sm transition-all cursor-pointer
                ${
                  canProceed() && !submitting
                    ? "bg-eav-orange text-eav-white hover:brightness-95 active:scale-[0.98]"
                    : c.continueDisabled + " cursor-not-allowed"
                }
              `}
            >
              {submitting ? "Sending..." : "Send Request"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
