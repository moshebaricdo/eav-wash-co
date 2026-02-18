# GA4 Tracking Spec

This document defines the GA4 events and setup used by the site.

## Key Event

- Mark `generate_lead` as a GA4 Key Event.

## Recommended Custom Dimensions (Event Scope)

Create these in GA4 Admin -> Custom definitions:

- `channel`
- `placement`
- `timeline`
- `selected_services_count`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `depth_percent`
- `faq_index`
- `service`

## Event Catalog

- `contact_click`
  - Fired for SMS/phone/email and estimate-form CTAs.
  - Params: `channel`, `placement`, `page`, plus stored attribution on this event.

- `estimate_step_view`
  - Fired when estimate form step is viewed.
  - Params: `step`, `page`.

- `estimate_step_continue`
  - Fired when user advances step 1 -> step 2.
  - Params: `step_from`, `step_to`, `page`.

- `estimate_option_select`
  - Fired when services/timeline options are selected in estimate form.
  - Params: `option_group`, `option_value`, optional `selected`, `page`.

- `generate_lead`
  - Fired on successful estimate form submission.
  - Params: `channel`, `placement`, `selected_services_count`, `timeline`, `has_address`, `has_notes`, `page`, plus stored attribution.

- `estimate_submit_error`
  - Fired on validation, API, or network submission failures.
  - Params: `error_type`, optional `invalid_fields`, optional `status_code`, `page`.

- `scroll_depth`
  - Fired once per threshold per page view.
  - Params: `depth_percent` (25, 50, 75, 90), `page`.

- `faq_open`
  - Fired when a FAQ accordion item is opened.
  - Params: `faq_index`, `faq_question`, `placement`, `page`.

- `before_after_interaction`
  - Fired once per slider instance when user first interacts.
  - Params: `service`, `page`.

## Attribution Capture

- Captured from URL params once per session and stored in `sessionStorage`.
- Supported params:
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
  - `gclid`, `wbraid`, `gbraid`, `fbclid`, `msclkid`, `ttclid`
- Snapshot is attached automatically to:
  - `contact_click`
  - `generate_lead`

## DebugView Validation Checklist

Use GA4 DebugView and verify all paths below:

- CTA tracking
  - Click Hero SMS and phone links -> `contact_click` with `placement=hero`.
  - Click Header phone/email links -> `contact_click` with `placement=header`.
  - Click Footer email/phone/sms links -> `contact_click` with `placement=footer`.
  - Click Footer "Get an Estimate" -> `contact_click` with `channel=estimate_form`.
  - Click FAQ inline estimate/phone/email links -> `contact_click` with `placement=faq`.

- Form funnel
  - Open form and observe `estimate_step_view` for step 1.
  - Complete step 1 and continue -> `estimate_step_continue` and `estimate_step_view` step 2.
  - Toggle services and timeline -> `estimate_option_select`.
  - Submit valid request -> `generate_lead`.
  - Force validation errors -> `estimate_submit_error` (`error_type=validation`).

- Interaction signals
  - Scroll page to at least 25/50/75/90% -> `scroll_depth` thresholds once each.
  - Open FAQ items -> `faq_open`.
  - Drag or key-adjust before/after slider -> `before_after_interaction`.

- Attribution
  - Land with UTMs (example: `?utm_source=yard_sign&utm_medium=offline&utm_campaign=spring`).
  - Trigger a `contact_click` or `generate_lead`.
  - Confirm event params include the expected UTM values.

