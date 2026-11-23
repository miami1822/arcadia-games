-- Arcadia Creator review queue. Private backend schema: never expose through public Data APIs.
CREATE TABLE IF NOT EXISTS arcadia_creator_submissions (
 id uuid PRIMARY KEY,
 receipt_hash char(64) NOT NULL,
 ip_hash char(64) NOT NULL,
 title varchar(80) NOT NULL,
 description varchar(500) NOT NULL,
 genre varchar(36) NOT NULL,
 school_requested boolean NOT NULL DEFAULT false,
 asset_manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
 rights_confirmed boolean NOT NULL DEFAULT false,
 file_sha256 char(64) NOT NULL,
 file_size integer NOT NULL,
 zip_file bytea NOT NULL,
 status varchar(28) NOT NULL DEFAULT 'pending'
   CHECK (status IN ('pending','changes_requested','rejected','approved_pending_release','published')),
 review_note varchar(1000),
 published_url varchar(500),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS arcadia_creator_recent_ip_idx ON arcadia_creator_submissions(ip_hash,created_at DESC);
CREATE INDEX IF NOT EXISTS arcadia_creator_status_idx ON arcadia_creator_submissions(status,created_at DESC);
