# Redd Master — data integration specification

`schema_version: reddmaster.sgs.v1`

This document is for whoever builds the pipeline between Redd Master and the data hub. It
defines the export contract, the table structures, and the questions that need answering
before any code is written.

---

## First — a check on the premise

**Sequel Data Systems** (sequeldata.com, Austin TX) is an **IT consulting and integration
firm** — managed services, infrastructure, cloud migration, security. It is not a fisheries
data product, and it publishes no public API or data schema.

So "integrate with Sequel" almost certainly means one of these, and they need very different
work:

1. **Sequel is the IT partner who built or manages the hub.** The hub itself is probably a SQL
   Server database, a SharePoint/Dataverse site, or an Azure data store. *Ask Sequel for the
   target system, schema and credentials* — the integration is with that system, not with
   Sequel as a product.
2. **"Sequel" means SQL** — i.e. the hub is a SQL Server database. This is common; SQL is
   pronounced "sequel." If so, the SQL export in this app is directly usable.
3. **Something else entirely** with a similar name.

**Do not let anyone start building until #1 is answered.** The rest of this document is
written so the app side is ready regardless of which it turns out to be.

---

## What the app exports today

All available from **Survey menu → Export & backup**. Nothing is transmitted automatically;
every export is a deliberate action by the surveyor.

| Export | Format | Purpose |
|---|---|---|
| Excel workbook | `.xlsx` | Human review, the data manager's working copy |
| CSV per form | `.csv` | Simple loads, Access/Excel import |
| **Relational JSON** | `.json` | **Machine load into a database or hub** |
| **SQL insert script** | `.sql` | **Direct load into SQL Server / Postgres** |
| Full backup | `.json` | Device restore — *raw app state, not an integration format* |

Use **Relational JSON** or **SQL** for the hub. Do not build a pipeline against the backup
file — its shape follows the app's internal needs and may change.

---

## Keys and idempotency

Every record carries a stable, globally unique id generated on the device, and every child row
carries its parent `survey_id`. This means:

- **Re-importing the same export updates rather than duplicates** — load with `MERGE` (SQL
  Server) or `INSERT … ON CONFLICT DO UPDATE` (Postgres) keyed on the record id.
- **A crew can export mid-day and again at end of day** without creating duplicates.
- `device_id` identifies the phone, so two crews surveying the same reach never collide.

Each export also carries `schema_version`, `app_version`, `device_id` and `exported_at`.
**The pipeline should reject any file whose `schema_version` it does not recognise** rather
than guessing.

---

## Table structures

Reference DDL. Types are given for SQL Server; Postgres equivalents in brackets.

```sql
CREATE TABLE rm_survey (
  survey_id           VARCHAR(32)   NOT NULL PRIMARY KEY,
  device_id           VARCHAR(32)   NULL,
  survey_date         DATE          NULL,
  species_code        VARCHAR(8)    NULL,   -- CHIN COHO CHUM PINK SOCK STHD
  fork_code           VARCHAR(8)    NULL,   -- NF MF SF Other
  stream_name         VARCHAR(120)  NULL,
  water_type          VARCHAR(16)   NULL,   -- Mainstem | Trib
  reach               VARCHAR(120)  NULL,
  crew                VARCHAR(120)  NULL,
  survey_type         VARCHAR(16)   NULL,   -- Primary | Braid
  visibility_code     INT           NULL,   -- 1..6
  visibility_desc     VARCHAR(32)   NULL,
  upper_time          VARCHAR(8)    NULL,   -- HH:MM local
  upper_water_temp    DECIMAL(5,2)  NULL,
  upper_rm            DECIMAL(6,2)  NULL,
  lower_time          VARCHAR(8)    NULL,
  lower_water_temp    DECIMAL(5,2)  NULL,
  lower_rm            DECIMAL(6,2)  NULL,
  temperature_unit    VARCHAR(2)    NULL,   -- C | F
  subsampling         VARCHAR(2)    NULL,   -- Y | N
  subsample_rate      INT           NULL,   -- 10 or 20 (1-in-N)
  gps_unit            VARCHAR(32)   NULL,   -- handheld unit id, NOT the phone
  notes_on_reverse    VARCHAR(2)    NULL,
  page_no             INT           NULL,
  page_of             INT           NULL,
  escapement_method   VARCHAR(64)   NULL,
  created_at          DATETIME2     NULL,   -- [TIMESTAMPTZ]
  updated_at          DATETIME2     NULL
);

CREATE TABLE rm_survey_tally (
  tally_id                      VARCHAR(32) NOT NULL PRIMARY KEY,
  survey_id                     VARCHAR(32) NOT NULL REFERENCES rm_survey(survey_id),
  line_no                       INT          NULL,
  river_mile                    DECIMAL(6,2) NULL,   -- nearest tenth
  new_redds                     INT          NULL,
  live                          INT          NULL,
  dead_nosub_sampled            INT          NULL,
  dead_nosub_not_sampled        INT          NULL,   -- unsamps only
  dead_subgroup_sampled         INT          NULL,
  dead_subgroup_no_biologic     INT          NULL,
  notes                         VARCHAR(MAX) NULL    -- [TEXT]
);

CREATE TABLE rm_carcass (
  carcass_id        VARCHAR(32)  NOT NULL PRIMARY KEY,
  survey_id         VARCHAR(32)  NOT NULL REFERENCES rm_survey(survey_id),
  record_no         INT          NULL,
  species_code      VARCHAR(8)   NULL,
  otolith_no        VARCHAR(32)  NULL,
  dna_no            VARCHAR(32)  NULL,
  fork_length_cm    DECIMAL(5,1) NULL,
  sex               VARCHAR(4)   NULL,   -- M | F | UNK
  river_mile        DECIMAL(6,2) NULL,
  pct_spawned       INT          NULL,   -- 0 | 50 | 100
  ad_clip           VARCHAR(4)   NULL,   -- Y | N | Unk
  cwt               VARCHAR(4)   NULL,   -- Y | N | Unk
  origin            VARCHAR(4)   NULL,   -- HOR | NOR | UNK  (derived, see below)
  scale_card_no     VARCHAR(32)  NULL,
  line_nos          VARCHAR(32)  NULL,
  hbl_no            VARCHAR(32)  NULL,   -- head bag label, present when CWT = Y
  scavenged         VARCHAR(4)   NULL,
  eyes_missing      INT          NULL,   -- 0 | 1 | 2
  latitude          DECIMAL(9,5) NULL,
  longitude         DECIMAL(9,5) NULL,
  gps_accuracy_m    INT          NULL,
  notes             VARCHAR(MAX) NULL
);

CREATE TABLE rm_redd (
  redd_id              VARCHAR(32)  NOT NULL PRIMARY KEY,
  survey_id            VARCHAR(32)  NOT NULL REFERENCES rm_survey(survey_id),
  redd_no              VARCHAR(8)   NULL,   -- 01.. restarts each day
  river_mile           DECIMAL(6,2) NULL,
  gps_waypoint_no      VARCHAR(32)  NULL,   -- handheld waypoint
  gps_unit             VARCHAR(32)  NULL,   -- pairs with the waypoint
  location_in_channel  VARCHAR(4)   NULL,   -- LB | MC | RB
  channel_type         VARCHAR(16)  NULL,   -- Single | Braided
  braid_location       VARCHAR(4)   NULL,   -- L | M | R
  live_on_redd         INT          NULL,
  latitude             DECIMAL(9,5) NULL,
  longitude            DECIMAL(9,5) NULL,
  gps_accuracy_m       INT          NULL,
  notes                VARCHAR(MAX) NULL
);

CREATE TABLE rm_other_species (
  observation_id    VARCHAR(32)  NOT NULL PRIMARY KEY,
  survey_id         VARCHAR(32)  NOT NULL REFERENCES rm_survey(survey_id),
  record_no         INT          NULL,
  species_code      VARCHAR(8)   NULL,
  species_name      VARCHAR(48)  NULL,
  observation_type  VARCHAR(16)  NULL,   -- Live | Carcass | Redd
  count             INT          NULL,
  river_mile        DECIMAL(6,2) NULL,
  latitude          DECIMAL(9,5) NULL,
  longitude         DECIMAL(9,5) NULL,
  gps_accuracy_m    INT          NULL,
  notes             VARCHAR(MAX) NULL
);
```

---

## Notes for the pipeline builder

**`origin` is derived, not recorded.** Ad clip and/or CWT = `HOR`; neither = `NOR`; anything
`Unk` = `UNK`. It is included for convenience — if the hub prefers to derive it itself, use
`ad_clip` and `cwt` and ignore the column.

**`dead_nosub_not_sampled` is unsamps only** — spines, guts, heavily scavenged fish. These
carcasses have **no** row in `rm_carcass` by design. Any carcass with even partial data does
get a carcass row. This matters for reconciliation:

```
dead_nosub_sampled + dead_subgroup_sampled + dead_subgroup_no_biologic
  = count of rm_carcass rows for that survey (target species only)

new_redds (summed over tally rows) = count of rm_redd rows for that survey
```

The app enforces both checks in the field and will not let a crew finish cleanly without them
matching. **The pipeline should re-check them on load and quarantine mismatches** rather than
importing silently.

**Times are local, without a timezone**, exactly as written on the paper form. `created_at`,
`updated_at` and `exported_at` are ISO 8601 UTC.

**Temperature unit is per-export**, in `temperature_unit`. Do not assume Celsius.

**Two GPS sources, and they are not interchangeable.** `gps_waypoint_no` + `gps_unit` is the
handheld record and is the record of truth for redd positions. `latitude`/`longitude` come from
the phone and are supplementary; they may be null.

**Species is per-survey.** The primary forms cover one target species. Anything else is in
`rm_other_species`. A carcass whose `species_code` differs from its survey's is intentional and
is excluded from the reconciliation counts above.

---

## Attribution — and what it is not

Every carcass, redd and other-species record carries:

| Column | Meaning |
|---|---|
| `recorded_by` | Initials of the person signed in when the record was saved |
| `recorded_by_name` | Their full name |
| `recorded_at` | ISO 8601 UTC timestamp of the save |
| `photo_count` | Number of photos attached |

Each export also carries `exported_by`, `exported_by_name` and `device_id`.

**This is provenance, not authentication.** The app has no server, so it cannot verify that
the person signed in is who they say they are — anyone holding the phone can pick any name
from the list. It answers *"who entered this?"* for data-quality and follow-up purposes; it
does not secure anything.

If the hub needs verified identity, that has to happen at the hub: authenticate the upload
(Entra ID, API key per user, or a signed submission endpoint) and treat `recorded_by` as a
claim to be cross-checked against the authenticated uploader, not as proof.

Add to the DDL:

```sql
ALTER TABLE rm_carcass       ADD recorded_by VARCHAR(16) NULL, recorded_by_name VARCHAR(120) NULL,
                                 recorded_at DATETIME2 NULL, photo_count INT NULL;
ALTER TABLE rm_redd          ADD recorded_by VARCHAR(16) NULL, recorded_by_name VARCHAR(120) NULL,
                                 recorded_at DATETIME2 NULL, photo_count INT NULL;
ALTER TABLE rm_other_species ADD recorded_by VARCHAR(16) NULL, recorded_by_name VARCHAR(120) NULL,
                                 recorded_at DATETIME2 NULL, photo_count INT NULL;
```

---

## Photos

Photos live in the device's IndexedDB, **not** in the JSON or SQL exports — they would bloat
them beyond usefulness. They are exported separately as a ZIP:

**Survey menu → Photo archive → Export photos**

The ZIP contains a `photos/` folder of JPEGs plus `photo_index.csv`:

| Column | Notes |
|---|---|
| `photo_file` | Filename inside the ZIP |
| `record_type` | Carcass / Redd / Other species |
| `record_id` | **Joins to `carcass_id`, `redd_id` or `observation_id`** |
| `survey_id` | Joins to `rm_survey` |
| `river_mile`, `latitude`, `longitude` | Position as recorded |
| `taken_at`, `taken_by` | Provenance |
| `width`, `height` | Pixels |

Filenames are human-meaningful — `2026-08-08_CHIN_South-Fork_carcass_003.jpg`,
`…_redd_01.jpg` — so the folder is usable even without the index.

Images are downscaled to 1600px on the long edge at JPEG ~0.72 before storage, which lands
around 15–25 KB each. A heavy day of 200 photos is roughly 4 MB.

**If the hub should store photos**, decide whether it wants the files themselves (blob storage
keyed on `record_id`) or just the count. That choice affects whether the upload path needs to
handle multi-megabyte payloads.

---

## Getting to an automatic upload

Right now the flow is: surveyor exports a file, sends it to the data manager, and it gets
loaded. That is deliberate — the app is offline-first and crews often have no signal for a
whole day.

An automatic push is straightforward to add **once the target exists**. What is needed from
Sequel or LNR IT:

1. **What is the actual target?** SQL Server, SharePoint list, Dataverse, an S3/Blob drop, a
   REST endpoint?
2. **How does it authenticate?** API key, OAuth, Entra ID service principal, SAS token?
3. **Is it reachable from the open internet**, or only from the tribal network / VPN?
4. **Push or pull?** Cleanest and safest is usually: the app drops a file to a watched
   location, and the hub ingests on a schedule. That keeps credentials out of a phone app.
5. **Who owns the data and what are the retention rules?** This is tribal fisheries data with
   co-management implications — settle governance before wiring anything up.

**A recommendation worth stating plainly:** do not put database credentials inside a phone
app. If direct upload is wanted, the right pattern is a small server-side endpoint that the
app posts an export to, which then writes to the hub. That keeps secrets server-side and gives
you an audit trail. I can build the app's side of that (a single POST of the relational JSON,
queued until signal returns) as soon as the endpoint and auth method are known.

---

## Suggested first step

Send the data manager one **Relational JSON** export and one **SQL** export from a real
survey day, plus this document. That gives Sequel and LNR IT everything they need to scope
the work, and it will surface any field naming the hub requires that differs from ours —
cheaper to find now than after a pipeline is built.
