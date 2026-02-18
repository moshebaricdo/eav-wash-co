export const TEST_MODE_QUERY_KEY = "testMode";
export const TEST_MODE_STORAGE_KEY = "eav_test_mode";
export const ESTIMATE_FORM_PREVIEW_QUERY_KEY = "estimateFormPreview";
export const ESTIMATE_FORM_PREVIEW_STORAGE_KEY = "eav_estimate_form_preview";

function applyToggleFromQuery({
  value,
  storageKey,
}: {
  value: string | null;
  storageKey: string;
}) {
  if (value === "1") {
    window.sessionStorage.setItem(storageKey, "1");
    return;
  }

  if (value === "0") {
    window.sessionStorage.removeItem(storageKey);
  }
}

export function resolveTestModeState() {
  if (typeof window === "undefined") {
    return {
      testModeEnabled: false,
      estimateFormPreviewEnabled: false,
    };
  }

  const params = new URLSearchParams(window.location.search);

  applyToggleFromQuery({
    value: params.get(TEST_MODE_QUERY_KEY),
    storageKey: TEST_MODE_STORAGE_KEY,
  });
  applyToggleFromQuery({
    value: params.get(ESTIMATE_FORM_PREVIEW_QUERY_KEY),
    storageKey: ESTIMATE_FORM_PREVIEW_STORAGE_KEY,
  });

  const testModeEnabled =
    window.sessionStorage.getItem(TEST_MODE_STORAGE_KEY) === "1";
  const estimateFormPreviewEnabled =
    testModeEnabled ||
    window.sessionStorage.getItem(ESTIMATE_FORM_PREVIEW_STORAGE_KEY) === "1";

  return {
    testModeEnabled,
    estimateFormPreviewEnabled,
  };
}
