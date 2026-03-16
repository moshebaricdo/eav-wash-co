-- Backfill properties from known addresses
INSERT INTO "properties" ("address")
SELECT DISTINCT addr.address
FROM (
  SELECT NULLIF(TRIM("address"), '') AS address FROM "contacts"
  UNION
  SELECT NULLIF(TRIM("address"), '') AS address FROM "leads"
  UNION
  SELECT NULLIF(TRIM("address"), '') AS address FROM "jobs"
) AS addr
WHERE addr.address IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "properties" p WHERE p.address = addr.address
  );
--> statement-breakpoint

-- Attach leads to properties (lead address first, then contact address)
UPDATE "leads" l
SET "property_id" = p.id
FROM "properties" p
WHERE l."property_id" IS NULL
  AND p."address" = NULLIF(TRIM(l."address"), '');
--> statement-breakpoint

UPDATE "leads" l
SET "property_id" = p.id
FROM "contacts" c
JOIN "properties" p ON p."address" = NULLIF(TRIM(c."address"), '')
WHERE l."property_id" IS NULL
  AND c."id" = l."contact_id";
--> statement-breakpoint

-- Attach jobs to properties (job address, then lead property, then lead/contact addresses)
UPDATE "jobs" j
SET "property_id" = p.id
FROM "properties" p
WHERE j."property_id" IS NULL
  AND p."address" = NULLIF(TRIM(j."address"), '');
--> statement-breakpoint

UPDATE "jobs" j
SET "property_id" = l."property_id"
FROM "leads" l
WHERE j."property_id" IS NULL
  AND l."id" = j."lead_id"
  AND l."property_id" IS NOT NULL;
--> statement-breakpoint

UPDATE "jobs" j
SET "property_id" = p.id
FROM "leads" l
JOIN "properties" p ON p."address" = NULLIF(TRIM(l."address"), '')
WHERE j."property_id" IS NULL
  AND l."id" = j."lead_id";
--> statement-breakpoint

UPDATE "jobs" j
SET "property_id" = p.id
FROM "contacts" c
JOIN "properties" p ON p."address" = NULLIF(TRIM(c."address"), '')
WHERE j."property_id" IS NULL
  AND c."id" = j."contact_id";
--> statement-breakpoint

-- Create fallback properties for any remaining null links before NOT NULL enforcement
INSERT INTO "properties" ("address", "name", "notes")
SELECT 'Unknown Lead Property ' || l."id"::text, 'Unknown', 'Auto-created during property backfill'
FROM "leads" l
WHERE l."property_id" IS NULL;
--> statement-breakpoint

UPDATE "leads" l
SET "property_id" = p."id"
FROM "properties" p
WHERE l."property_id" IS NULL
  AND p."address" = 'Unknown Lead Property ' || l."id"::text;
--> statement-breakpoint

INSERT INTO "properties" ("address", "name", "notes")
SELECT 'Unknown Job Property ' || j."id"::text, 'Unknown', 'Auto-created during property backfill'
FROM "jobs" j
WHERE j."property_id" IS NULL;
--> statement-breakpoint

UPDATE "jobs" j
SET "property_id" = p."id"
FROM "properties" p
WHERE j."property_id" IS NULL
  AND p."address" = 'Unknown Job Property ' || j."id"::text;
--> statement-breakpoint

-- Link contacts to properties based on leads/jobs
INSERT INTO "property_contacts" ("property_id", "contact_id")
SELECT DISTINCT l."property_id", l."contact_id"
FROM "leads" l
WHERE l."property_id" IS NOT NULL
ON CONFLICT ("property_id", "contact_id") DO NOTHING;
--> statement-breakpoint

INSERT INTO "property_contacts" ("property_id", "contact_id")
SELECT DISTINCT j."property_id", j."contact_id"
FROM "jobs" j
WHERE j."property_id" IS NOT NULL
ON CONFLICT ("property_id", "contact_id") DO NOTHING;
--> statement-breakpoint

ALTER TABLE "leads" ALTER COLUMN "property_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "property_id" SET NOT NULL;
