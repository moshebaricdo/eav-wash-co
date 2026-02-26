export type ContactChannel = "sms" | "phone" | "email" | "estimate_form";

export type ContactPlacement =
  | "hero"
  | "header"
  | "footer"
  | "faq"
  | "estimate_form"
  | "footer_cta";

export type EstimateOptionGroup = "surfaces" | "timeline";

export type EstimateTimeline = "asap" | "1-2-weeks" | "flexible" | "unknown";

export type AnalyticsEventName =
  | "contact_click"
  | "estimate_form_start"
  | "estimate_step_view"
  | "estimate_step_continue"
  | "estimate_option_select"
  | "generate_lead"
  | "estimate_submit_error"
  | "scroll_depth"
  | "faq_open"
  | "before_after_interaction";

export type AnalyticsParams = Record<
  string,
  string | number | boolean | undefined
>;
