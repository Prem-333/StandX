export type Evidence = {
  record_id: string;
  is_number: string;
  source: string;
  source_url?: string | null;
  fetched_at?: string;
  snapshot_sha256?: string;
  display_label?: string;
};
export type Version = {
  status: string;
  is_latest_revision: boolean | null;
  final_current_standard: string | null;
  final_current_confirmed?: boolean;
  supersession_path?: string[];
  amendments_reported?: number | null;
  unresolved_amendments: number | null;
  known_unresolved_amendments?: number;
  latest_basis?: string;
};
export type Rule = {
  id: string;
  scheme: string;
  scheme_name?: string;
  requirement: string;
  as_verified_on: string;
  stale: boolean;
  applies_to_supplied_context: boolean | null;
  product_category: string;
  legal_applicability_confirmed?: boolean;
  notice?: string;
  scope_note?: string;
  limitation?: string;
  transition_notice?: string;
  missing_conditions?: { description: string }[];
  trigger: Record<string, unknown>;
  evidence: { url: string; locator: string; summary: string }[];
};
export type Allied = {
  record_id: string;
  is_number: string;
  title: string;
  source: string;
  relationship_type: string;
  evidence: Evidence[];
  evidence_path?: unknown[];
};
export type Standard = {
  record_id: string;
  is_number: string;
  title: string;
  score: number;
  confidence_basis: string;
  source: string;
  status: string;
  rationale: string;
  meets_confidence_threshold: boolean;
  version_status: Version;
  allied_standards: Record<string, Allied[]>;
  certification_requirements: Rule[];
  evidence: Evidence[];
  warnings: { severity: string; code: string; message: string }[];
  certification?: {
    schemes: {
      id: string;
      name: string;
      requirement: string;
      source: string;
    }[];
  };
  matched_phrases?: { phrase: string; phrase_status: string }[];
};
export type Report = {
  recommendation_id: string;
  timestamp: string;
  query_text: string;
  kind: string;
  message: string;
  status: string;
  synthetic_enabled: boolean;
  primary_standards: Standard[];
  certification_requirements: Rule[];
  normalization: {
    original_text: string;
    normalized_text: string;
    status: string;
    detected_language: string;
    notices: string[];
  };
  extraction?: { manual_review_clauses: unknown[]; omitted_phrases: unknown[] };
  kb_fingerprint: string;
};
export type Language = "en" | "hi" | "hi-Latn";
