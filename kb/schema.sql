-- Public metadata only. This isolated schema does not alter application tables.
CREATE SCHEMA IF NOT EXISTS kb;
CREATE TABLE IF NOT EXISTS kb.standard (
    id text PRIMARY KEY,
    family_number text NOT NULL UNIQUE,
    source text NOT NULL CHECK (source IN ('bis_public_metadata_verified','synthetic_seed')),
    latest_version text,
    latest_basis text NOT NULL DEFAULT 'latest_observed_in_kb',
    CHECK ((source = 'synthetic_seed') = (family_number LIKE 'IS-SEED-%'))
);
CREATE TABLE IF NOT EXISTS kb.source_snapshot (
    id text PRIMARY KEY,
    source text NOT NULL,
    source_url text,
    fetched_at timestamptz NOT NULL,
    content_sha256 text NOT NULL,
    metadata jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS kb.revision (
    id text PRIMARY KEY,
    standard_id text NOT NULL REFERENCES kb.standard(id),
    is_number text NOT NULL UNIQUE,
    title text NOT NULL,
    publication_year integer NOT NULL,
    revision_count integer CHECK (revision_count >= 0),
    amendment_count integer CHECK (amendment_count >= 0),
    degree_of_equivalence text,
    equivalent_standards_raw text,
    technical_department text,
    technical_committee text,
    language text,
    scope_abstract text,
    certification_flag_raw text,
    status text NOT NULL CHECK (status IN ('active','superseded','withdrawn','unknown')),
    superseded boolean NOT NULL DEFAULT false,
    latest_confirmed boolean NOT NULL DEFAULT false,
    source text NOT NULL CHECK (source IN ('bis_public_metadata_verified','synthetic_seed')),
    snapshot_id text NOT NULL REFERENCES kb.source_snapshot(id),
    fetched_at timestamptz NOT NULL,
    payload jsonb NOT NULL,
    UNIQUE (standard_id, id),
    CHECK ((source = 'synthetic_seed') = (is_number LIKE 'IS-SEED-%'))
);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='standard_latest_version_fk'
                   AND connamespace='kb'::regnamespace) THEN
        ALTER TABLE kb.standard ADD CONSTRAINT standard_latest_version_fk
        FOREIGN KEY (id, latest_version) REFERENCES kb.revision(standard_id,id)
        DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;
CREATE TABLE IF NOT EXISTS kb.amendment (
    id text PRIMARY KEY,
    revision_id text NOT NULL REFERENCES kb.revision(id),
    amendment_number integer NOT NULL CHECK (amendment_number > 0),
    issued_on date,
    resolution text NOT NULL CHECK (resolution IN ('unresolved','incorporated','unknown')),
    source text NOT NULL,
    snapshot_id text NOT NULL REFERENCES kb.source_snapshot(id),
    UNIQUE (revision_id, amendment_number)
);
-- Parent identifies the BIS Group/Sub-group/Sub-sub-group hierarchy; Aspect is a facet.
CREATE TABLE IF NOT EXISTS kb.classification (
    id text PRIMARY KEY,
    parent_id text REFERENCES kb.classification(id),
    level text NOT NULL CHECK (level IN ('group','sub_group','sub_sub_group','aspect')),
    label text NOT NULL,
    source text NOT NULL
);
CREATE TABLE IF NOT EXISTS kb.revision_classification (
    revision_id text REFERENCES kb.revision(id),
    classification_id text REFERENCES kb.classification(id),
    snapshot_id text NOT NULL REFERENCES kb.source_snapshot(id),
    PRIMARY KEY (revision_id,classification_id)
);
CREATE TABLE IF NOT EXISTS kb.certification_scheme (
    id text PRIMARY KEY,
    name text NOT NULL,
    source text NOT NULL,
    evidence_url text
);
CREATE TABLE IF NOT EXISTS kb.revision_scheme (
    revision_id text REFERENCES kb.revision(id),
    scheme_id text REFERENCES kb.certification_scheme(id),
    requirement text NOT NULL CHECK (requirement IN ('required','voluntary','unknown')),
    snapshot_id text NOT NULL REFERENCES kb.source_snapshot(id),
    PRIMARY KEY (revision_id,scheme_id)
);
CREATE TABLE IF NOT EXISTS kb.product_category (
    id text PRIMARY KEY,
    name text NOT NULL,
    mapping_source text NOT NULL DEFAULT 'project_curated'
);
CREATE TABLE IF NOT EXISTS kb.revision_product_category (
    revision_id text REFERENCES kb.revision(id),
    product_category_id text REFERENCES kb.product_category(id),
    PRIMARY KEY (revision_id,product_category_id)
);
-- Unresolved endpoints retain their literal identifiers; never create invented Standard rows.
CREATE TABLE IF NOT EXISTS kb.cross_reference (
    id text PRIMARY KEY,
    observed_revision_id text NOT NULL REFERENCES kb.revision(id),
    from_identifier text NOT NULL,
    to_identifier text NOT NULL,
    from_revision_id text REFERENCES kb.revision(id),
    to_revision_id text REFERENCES kb.revision(id),
    namespace text NOT NULL CHECK (namespace IN ('indian','international','synthetic')),
    relationship_type text NOT NULL CHECK (relationship_type IN
       ('untyped_reference','normative_reference','test_method_for','terminology_for',
        'superseded_by','allied_safety_standard','installation_standard')),
    reported_direction text NOT NULL CHECK (reported_direction IN ('outgoing','incoming')),
    referenced_title_raw text,
    evidence_label text NOT NULL,
    source text NOT NULL,
    snapshot_id text NOT NULL REFERENCES kb.source_snapshot(id)
);
CREATE INDEX IF NOT EXISTS cross_reference_from_idx ON kb.cross_reference(from_identifier);
CREATE INDEX IF NOT EXISTS cross_reference_to_idx ON kb.cross_reference(to_identifier);
CREATE INDEX IF NOT EXISTS revision_family_idx ON kb.revision(standard_id,publication_year);
CREATE INDEX IF NOT EXISTS revision_search_idx ON kb.revision USING gin
    (to_tsvector('simple',is_number || ' ' || title || ' ' || coalesce(scope_abstract,'')));
