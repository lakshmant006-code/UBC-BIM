# QuizAI — PDF Reading & Study-Pack Quality Spec

**Target repo:** `lakshmant006-code/QuizAI` (Next.js app in `quizai/`, Python engine in `quiz-engine/`)
**Audience:** the coding agent implementing this. Read §1 and §2 before touching code.
**Corpus assumption:** academic / textbook material plus arbitrary user uploads — born-digital, scanned, table- and figure-heavy, multi-column.
**First-class question types:** MCQ with engineered distractors, short answer with rubric grading, scenario / case-based application.

---

## 0. How to use this document

This is a specification, not a tutorial. It is organised as:

- **§1** — audit of the pipeline as it exists today, with the specific defects that cap quality. Each is tagged `D1`…`D12`; the rollout plan in §15 refers to these tags.
- **§2–§9** — the target pipeline, stage by stage. Each stage states its contract (in / out), the rules, and the acceptance gate it must pass before the next stage runs.
- **§10–§12** — schema, job model and verbatim prompts.
- **§13–§15** — evaluation, budget, rollout order.
- **Appendices** — the item-writing rulebook, distractor taxonomy and anti-pattern checklist. These are the quality bar. If you implement nothing else from this document, implement Appendix A.

Two rules that override anything else here:

1. **Nothing is generated from text the system cannot cite.** Every summary bullet, every question, every distractor rationale carries a `{chunk_id, page, span}`. If a claim cannot be anchored, it does not ship.
2. **Generation and verification are separate model calls.** A model that writes a question is a poor judge of it. The critic in §8 never sees the generator's reasoning — only the item and the cited source span.

---

## 1. Where we are today

### 1.1 The two paths that exist

**Path A — LLM ("AI") path.**
`components/UploadCard.tsx` → `POST /api/generate` → `app/api/generate/route.ts` downloads the PDF from the Supabase `pdfs` bucket, extracts text with `unpdf` (`extractText(pdf, { mergePages: true })`, route.ts:44), then calls `generateStudyPack()` in `lib/generate.ts`. That either hits an OpenAI-compatible endpoint (`lib/localAI.ts`, via `AI_API_URL` / `OPENROUTER_API_KEY`) or falls back to Claude (`claude-sonnet-5`, `lib/anthropic.ts:9`) with one forced tool, `emit_study_pack`. Results land in `summaries`, `quizzes`, `questions`.

**Path B — offline engine.**
`lib/quizEngine.ts` → FastAPI service in `quiz-engine/` (deployed on Render per `render.yaml`). `pdf.py` extracts with PyMuPDF; `generators.py` runs 10 deterministic, LLM-free generators (`cloze`, `term_to_def`, `def_to_term`, `true_false`, `match`, `odd_one_out`, `sequence`, `short_answer`, `sentence_completion`, `flashcards`) over spaCy term extraction.

### 1.2 Defects that cap quality

| # | Defect | Where | Consequence |
|---|---|---|---|
| **D1** | **Silent truncation at 60,000 chars.** `const MAX_CHARS = 60_000` / `text.slice(0, MAX_CHARS)` | `lib/generate.ts:101,157` | A 300-page textbook is quizzed on roughly its first 25 pages. The user is never told. This is the single largest quality defect in the product. |
| **D2** | **Two different extractors with different quality.** `unpdf` in TS, PyMuPDF in Python | `route.ts:44` vs `quiz-engine/pdf.py` | The better extractor (`pdf.py`, which does reading-order sorting, running-header stripping and de-hyphenation) is only reachable on the *offline* path. The AI path — the flagship — gets a flat `mergePages: true` text dump with no layout awareness at all. |
| **D3** | **No page or span provenance.** Text is merged into one string before it reaches any model | `route.ts:44`, `pdf.py:23` | Nothing can be cited. No "see page 47". No faithfulness verification is even possible, because there is no unit to verify against. |
| **D4** | **Reading order breaks on multi-column pages.** `blocks.sort(key=lambda b: (round(b[1] / 6), round(b[0] / 6)))` | `pdf.py:35` | A two-column page is read left-block-then-right-block *per horizontal band*, interleaving the columns sentence by sentence. Every downstream sentence is corrupted. Textbooks and papers are predominantly two-column. |
| **D5** | **No OCR.** Removed for the Render memory budget; scanned PDFs are rejected | `pdf.py:5-6`, `main.py:81`, `route.ts:46` | Scanned lecture notes, photographed textbook pages and older papers — a large share of real student uploads — fail outright with "Not enough readable text". |
| **D6** | **Tables and figures are destroyed.** No `find_tables()`, no image handling, no caption association | `pdf.py` | Table cells arrive as a stream of loose numbers. Figures vanish entirely, taking their captions' pedagogical content with them. In a textbook, figures *are* the content. |
| **D7** | **One model call produces everything.** Summary + all questions in a single `max_tokens: 4096` response | `lib/generate.ts:165` | Output length forces shallow items. No planning stage, so coverage is whatever the model happened to notice first. No verification stage, so nothing is checked. |
| **D8** | **No question-quality constraints in the prompt.** The instruction is "give exactly 4 plausible options" | `lib/generate.ts` prompt | "Plausible" is doing all the work. No distractor strategy, no cover-the-options rule, no length homogeneity, no ban on *all of the above*, no Bloom targeting. This is why generic AI quizzes feel like flashcards with three obviously wrong options. |
| **D9** | **Short-answer grading is a word-overlap heuristic.** 80% content-word hit rate = correct | `components/QuizRunner.tsx:30-41` | A student who writes the right words in a wrong relationship scores full marks; one who answers correctly in their own vocabulary scores zero. No partial credit, no feedback, no rubric. |
| **D10** | **Synchronous request-response with a hard 120s ceiling.** | `route.ts:7` | A quality pipeline (extract → map → plan → generate → verify) cannot fit in 120s for a real textbook. The architecture must move to a job before the quality work can land. |
| **D11** | **No item statistics.** `quiz_attempts` stores a score and an answers blob, nothing per item | `supabase/schema.sql` | The system can never learn that question 7 is broken, even after 500 students get it wrong. Every serious assessment platform runs item analysis; this is free signal being discarded. |
| **D12** | **No difficulty semantics.** `difficulty` is a quiz-level string passed to the prompt | `quizzes.difficulty` | "Hard" currently means "the model tried harder". Difficulty must be a property of an item (Bloom level + distractor closeness + step count), measured against attempts. |

### 1.3 What is already good — keep it

- `pdf.py` running-header/footer detection (`_strip_running_headers`) and the de-hyphenation / line-joining in `clean_text()`. Port these forward; don't rewrite them.
- The retry-with-budget logic in `lib/quizEngine.ts` (`fetchEngine`) for Render cold starts. The new `/extract` endpoint needs exactly this.
- Supabase RLS on every table, and the `documents.status` state field — the job model in §11 extends this rather than replacing it.
- `components/RealtimeRefresh.tsx` — the progress channel for the async pipeline already exists.
- The deterministic offline generators. They stay as the zero-cost path and as a **fallback when the LLM path fails**, but they are not the quality path.

---

## 2. Target architecture

Six stages. Each writes durable state, so any stage can be re-run without redoing the ones before it.

```
  PDF
   │
   ├─ 1. ACQUIRE      fingerprint, page census, per-page class (digital | scanned | mixed)
   │                  → documents.extraction_plan
   │
   ├─ 2. EXTRACT      per-page strategy: text-layer / OCR / vision
   │                  layout → reading order → blocks (prose|table|figure|formula|list)
   │                  → document_blocks  (+ extraction_quality score)
   │
   ├─ 3. STRUCTURE    heading tree, section paths, semantic chunking with overlap
   │                  → document_chunks  (each with page, bbox, section_path)
   │
   ├─ 4. COMPREHEND   map-reduce over chunks → concepts, claims, procedures,
   │                  relationships, misconceptions, worked examples, scope
   │                  → document_maps    ← THE DIFFERENTIATOR
   │
   ├─ 5. GENERATE     blueprint (concept × Bloom × type) → summary → items
   │                  → summaries, quizzes, questions (unverified)
   │
   └─ 6. VERIFY       deterministic gates → LLM critic → repair loop
                      → questions.verified = true, quality jsonb, rejects logged
```

**The load-bearing idea is stage 4.** Everything that makes a quiz good — coverage, non-trivial distractors, application-level items, sensible difficulty ordering — comes from having a structured model of the document *before* any question is written. Today the model reads 60k characters of soup and improvises. A document map turns quiz generation from "write questions about this text" into "write an assessment for this syllabus", which is a different and far easier problem.

**Where each stage runs.** Stages 1–3 belong in Python (`quiz-engine`), where PyMuPDF already lives. Stages 4–6 belong in the Next.js app, next to the model clients and the database. This resolves **D2**: the TS side stops extracting entirely and calls `POST /extract`.

---

## 3. Stage 1 — Acquire & classify

**In:** PDF bytes. **Out:** `documents.extraction_plan` jsonb, `page_count`.

```python
# quiz-engine/acquire.py
{
  "doc_sha256": "…",                    # dedupe: identical upload reuses extraction
  "page_count": 412,
  "encrypted": false,
  "pages": [
    {"n": 1,  "class": "digital", "chars": 3140, "images": 0, "coverage": 0.71, "rotation": 0},
    {"n": 47, "class": "scanned", "chars": 0,    "images": 1, "coverage": 0.0,  "rotation": 0},
    {"n": 48, "class": "mixed",   "chars": 210,  "images": 2, "coverage": 0.06, "rotation": 90}
  ],
  "strategy": {"digital": 380, "ocr": 28, "vision": 4},
  "estimated_seconds": 95
}
```

Rules:

- **Classify per page, never per document.** Mixed documents are the norm: a born-digital report with scanned appendices, a textbook chapter with a photographed problem set.
- `coverage` = extracted char area ÷ page area, using span bboxes. A page with `chars < 100` **and** an image covering >50% of the page is `scanned`. A page with text but `coverage < 0.15` and a large image is `mixed` (caption-only text layer over a scanned scan).
- Detect and normalise `rotation` before anything else; a 90° page destroys column detection.
- Reject encrypted PDFs with a clear message; do not attempt decryption.
- `doc_sha256` is a cache key. Re-uploading the same file must never re-extract.
- Return `estimated_seconds` so the UI can show a real progress expectation instead of a spinner.

**Gate:** if `strategy.ocr + strategy.vision > 0` and OCR is unavailable in the deployment, fail *loudly and specifically* — "28 of 412 pages are scanned images; OCR is not enabled on this deployment" — not the current generic "Not enough readable text". (**D5**)

---

## 4. Stage 2 — Extract (the reading layer)

**In:** PDF + extraction plan. **Out:** `document_blocks[]`, `extraction_quality`.

This stage decides the ceiling on everything downstream. A question generated from a scrambled sentence is worthless no matter how good the prompt is.

### 4.1 Block model

```python
Block = {
  "id": "b_0047_03",
  "page": 47,
  "bbox": [72.0, 118.4, 523.1, 244.9],   # PDF points, origin top-left
  "kind": "prose" | "heading" | "list" | "table" | "figure" | "formula" | "caption" | "footnote" | "header" | "footer",
  "level": 2,                             # headings only
  "text": "…",                            # for table: markdown; for figure: caption + VLM description
  "reading_index": 312,                   # global order after column resolution
  "confidence": 0.97,                     # OCR/vision confidence; 1.0 for clean text layer
  "source": "text_layer" | "ocr" | "vision",
  "font": {"size": 10.5, "bold": false, "family": "Minion Pro"}
}
```

### 4.2 Born-digital pages

Use `page.get_text("dict")`, not `"blocks"` and not `"text"`. The dict form gives spans with font, size, flags and bbox — which is what heading detection, footnote detection and column detection all need.

**Column detection and reading order (fixes D4).** Replace `pdf.py:35` entirely:

1. Collect block bboxes, discard header/footer bands (top 8% / bottom 8%) for the purposes of this analysis only.
2. Build a vertical projection: for each x from page-left to page-right in 2pt steps, count blocks whose x-range covers it.
3. A **gutter** is a contiguous x-band ≥ 12pt wide with zero coverage, extending across ≥ 60% of the body height, positioned between 25% and 75% of page width (for 2-col) or at the 1/3 and 2/3 marks (3-col).
4. If gutters found → partition blocks into columns, sort each column top-to-bottom, concatenate columns left-to-right. Otherwise sort top-to-bottom, then left-to-right within a 6pt band (the current behaviour, which is correct for single-column).
5. **Full-width blocks** (spanning ≥ 85% of body width — figures, tables, section headings) break the column flow: emit everything above them in column order, then the full-width block, then resume. Skipping this is the classic failure where a figure caption lands 3 pages later in the text stream.
6. Fall back to a recursive XY-cut if the projection is ambiguous (heavy figure overlap).

Emit a `reading_order_confidence` per page: 1.0 for clean single-column, 0.9 for cleanly-gutter-detected multi-column, 0.6 when XY-cut fallback ran, 0.4 when blocks overlap irreconcilably.

**Heading detection.** Compute the body font size as the modal span size across the document. A block is a heading if any of: size ≥ 1.15 × body **or** (bold **and** size ≥ body **and** line count ≤ 2 **and** no terminal period) **or** it matches a numbering pattern (`^\d+(\.\d+)*\s`, `^[IVX]+\.\s`, `^(Chapter|Section|Appendix)\s`). Map distinct heading sizes to levels 1..4 by descending size. This tree is the backbone of stage 3 and the section summaries in §7.2.

**Footnotes.** Blocks in the bottom 20% band with size ≤ 0.85 × body, often preceded by a horizontal rule. Tag as `footnote`; keep them, but exclude them from the main reading flow and never generate questions from them alone.

**Headers/footers.** Keep the existing `_strip_running_headers` approach but move it from line-index to bbox-band + repetition: a block is a running header if its normalised text (digits → `#`) appears in the same band on ≥ 40% of pages. Store rather than delete — they often carry the chapter title, which is useful section metadata.

**Text normalisation** (extend `clean_text()`):
- Unicode NFKC; ligatures `ﬁ ﬂ ﬀ ﬃ ﬄ` → ASCII; smart quotes preserved, soft hyphen `­` removed.
- De-hyphenation across line breaks — already present, keep it — but do **not** join when the second fragment starts with a capital or the joined form isn't a plausible word (`well-\nKnown` must stay hyphenated).
- Drop-cap merge: a single large glyph at paragraph start belongs to the following word.
- Preserve list markers (`•`, `1.`, `a)`) as structure. The current `clean_text()` converts bullets to newlines, which loses the fact that the following lines are a *set* — and sets are what ordering and matching items are built from.

### 4.3 Scanned pages (fixes D5)

1. Rasterise at 300 DPI (`page.get_pixmap(dpi=300)`); 400 DPI if median glyph height < 8px.
2. Deskew: estimate rotation via Hough transform on horizontal projections; correct if |θ| > 0.3°.
3. Denoise + adaptive threshold. Dewarp only if page-curl is detected (photographed book spine).
4. OCR with per-word confidence. Retain word bboxes — they feed the same layout logic as 4.2, so column detection works identically on OCR'd pages.
5. **Escalate to a vision model** when mean page confidence < 0.75, or when the page is classed `formula`- or `table`-dense. Prompt it to transcribe, not to summarise (prompt P1, §12).
6. Store `confidence` per block. **Blocks below 0.60 are excluded from question generation** but retained for search and for the summary's "unclear regions" note.

If the Render memory budget is the blocker (the stated reason OCR was removed), the correct fix is to run OCR as a separate worker with its own memory tier, or to route scanned pages directly to a vision model and skip the local OCR dependency entirely. Do not silently reject scanned documents.

### 4.4 Tables (fixes D6)

1. `page.find_tables()` (PyMuPDF ≥ 1.23) with both `lines` and `text` strategies; take the higher-scoring result.
2. Convert to Markdown with the header row preserved. Store the cell grid in `block.data` as well as the Markdown in `block.text`.
3. **Merged / spanning cells and borderless tables** are where rule-based detection fails. When `find_tables()` returns a grid with > 15% empty cells or inconsistent column counts, crop the table bbox to an image and send it to a vision model for structured transcription (prompt P2).
4. **Multi-page tables:** if a table block starts within 15% of the page top on page *n+1* and its column count and header text match a table ending near the bottom of page *n*, stitch them into one block spanning both pages.
5. A table's caption (nearest text block above or below matching `^(Table|TABLE)\s*\d`) attaches to the block and is indexed with it.

Tables are high-value quiz material — they encode comparisons, thresholds and classifications, which are exactly what good application items test. Losing them costs disproportionately.

### 4.5 Figures (fixes D6)

1. Extract image bboxes and vector-drawing clusters. Ignore anything < 2% of page area (rules, logos, bullets).
2. Associate the caption: nearest text block within 80pt vertically matching `^(Figure|Fig\.|Chart|Diagram|Plate)\s*\d`.
3. Send the cropped image + caption + surrounding paragraph to a vision model for a **description written as source text** (prompt P3): what it shows, the axes/labels, the trend or relationship, the values a reader is meant to take away. 60–150 words.
4. Store as a `figure` block whose `text` is `caption + "\n" + description`. It is now first-class quizzable content.

Cap: describe at most 60 figures per document, prioritised by area × caption presence, to bound cost.

### 4.6 Formulas

Detect math by font family (`CM*`, `*Math*`, `MT Extra`, `Symbol`) or by a high ratio of math operators to letters within a block. Route to a vision model for LaTeX transcription (prompt P4). Store LaTeX in `block.data.latex` and a plain-language rendering in `block.text` ("the rate constant equals the pre-exponential factor times e to the minus activation-energy-over-RT").

Without this, formula-heavy pages produce blocks like `= 2 () + 3` and the generator will happily build questions from them.

### 4.7 Extraction quality score

```
extraction_quality = 0.35 · text_coverage
                   + 0.25 · mean(reading_order_confidence)
                   + 0.25 · mean(block.confidence)
                   + 0.15 · table_figure_recovery
```

Surface it. `documents.extraction_quality` and a per-document note the UI shows before generation:

> Read at 94% confidence. 28 of 412 pages were scanned and processed with OCR; 3 pages had unclear regions and were excluded. 14 tables and 22 figures were recovered.

**Gate:** `extraction_quality < 0.55` → do not generate silently. Tell the user what went wrong and offer to proceed anyway with an explicit warning. A quiz built on bad extraction is worse than no quiz, because the user can't tell.

---

## 5. Stage 3 — Structure & chunk

**In:** blocks. **Out:** `document_chunks[]`.

Fixed-size character windows are the wrong unit for assessment. A chunk should be a *thing the document is about*, because that is what a question is about.

**Chunking rules:**

1. Start from the heading tree. A chunk begins at a heading and runs to the next heading of equal or higher level.
2. If a section exceeds ~1,200 tokens, split at paragraph boundaries into near-equal parts, each carrying **one paragraph of overlap** with the previous part. Never split mid-sentence, mid-table or mid-list.
3. If a section is under ~120 tokens, merge it forward into its sibling. Orphan headings produce trivial questions.
4. Tables, figures and formulas are **their own chunks**, tagged by kind, with the surrounding two paragraphs attached as `context` (not as `text`). A question generated from a table cites the table, not the prose near it.
5. Every chunk carries `section_path`: `["3. Thermodynamics", "3.2 Entropy", "3.2.1 The Second Law"]`. This is what makes coverage reporting and "review this section" navigation possible.

```ts
interface DocumentChunk {
  id: string;
  document_id: string;
  ordinal: number;
  kind: "prose" | "table" | "figure" | "formula" | "list";
  section_path: string[];
  page_start: number;
  page_end: number;
  bbox: [number, number, number, number][];   // one per page spanned
  text: string;
  context: string | null;
  token_count: number;
  confidence: number;                          // min block confidence in the chunk
}
```

**This is the fix for D1 and D3.** There is no truncation, because generation never sees "the document" — it sees selected chunks. And every chunk has a page and a bbox, so every downstream artifact can cite.

---

## 6. Stage 4 — Comprehend (the document map)

**In:** chunks. **Out:** one `document_maps` row.

Map-reduce. **Map:** for each chunk (batched ~6 chunks per call), extract structured knowledge. **Reduce:** merge, deduplicate by concept name similarity, resolve prerequisite links, rank importance.

```ts
interface DocumentMap {
  document_id: string;
  title: string;
  doc_type: "textbook_chapter" | "lecture_slides" | "research_paper" | "manual" | "notes" | "mixed";
  thesis: string;                    // one sentence: what this document establishes
  outline: OutlineNode[];            // heading tree with a one-line abstract per node

  concepts: {
    id: string;
    name: string;
    definition: string;              // in the document's own terms
    aliases: string[];
    importance: 1 | 2 | 3 | 4 | 5;   // 5 = the document is largely about this
    prerequisites: string[];         // concept ids
    related: string[];
    citations: Citation[];
  }[];

  claims: {                          // testable factual assertions
    id: string;
    statement: string;
    qualifiers: string | null;       // "under standard conditions", "in mammals"
    concept_ids: string[];
    citations: Citation[];
  }[];

  procedures: {
    id: string; name: string;
    steps: string[];                 // ordered
    preconditions: string[];
    citations: Citation[];
  }[];

  relationships: {
    kind: "causes" | "part_of" | "contrasts_with" | "depends_on" | "example_of" | "increases" | "decreases";
    from: string; to: string;        // concept ids
    note: string | null;
    citations: Citation[];
  }[];

  misconceptions: {                  // gold for distractors — see Appendix B, type 1
    id: string;
    wrong_belief: string;
    why_wrong: string;
    concept_ids: string[];
    citations: Citation[];
  }[];

  worked_examples: {                 // gold for scenario items
    id: string; setup: string; method: string; result: string;
    concept_ids: string[]; citations: Citation[];
  }[];

  quantities: {                      // numbers, thresholds, units, constants
    id: string; label: string; value: string; unit: string | null;
    condition: string | null; citations: Citation[];
  }[];

  scope_note: string;                // what this document explicitly does NOT cover
  coverage_gaps: string[];           // regions with low confidence or thin content
}

type Citation = { chunk_id: string; page: number; quote: string };  // quote ≤ 200 chars, verbatim
```

**Map-stage rules:**
- Extract only what is *in the chunk*. No world knowledge, no inference beyond what the text states.
- Every entry carries at least one citation with a verbatim quote. The reduce stage **drops any entry whose quote is not found in the cited chunk** (exact match after whitespace normalisation). This is a cheap, deterministic hallucination filter, and it catches a surprising amount.
- Misconceptions come from the document's own hedges: "a common error is", "note that X is not Y", "students often assume", "contrary to", "it is tempting to". Instruct the extractor to look for these markers explicitly.

**Reduce-stage rules:**
- Merge concepts whose names match after normalisation or whose definitions have > 0.85 embedding similarity; union their citations and aliases.
- `importance` = f(citation count, heading-level appearance, definitional treatment, appearance in the outline). A concept that gets its own subsection outranks one mentioned in passing.
- Build the prerequisite DAG; break cycles by citation order. This gives the *teaching order*, which is the correct order for quiz questions.
- Flag `coverage_gaps` where extraction confidence was low, so the summary can say so.

**Cost:** roughly 1 call per 6 chunks + 1 reduce call. A 400-page textbook ≈ 250 chunks ≈ 42 map calls. Cache aggressively — the map is keyed on `doc_sha256` and is reusable for every quiz, summary, flashcard deck and study plan the document ever produces. **Generate it once; amortise it forever.** This is what makes the rest of the pipeline affordable.

---

## 7. Stage 5 — Generate

### 7.1 The blueprint (do this before writing any item)

Real assessment programmes build a *table of specifications* before writing items. Almost no AI quiz tool does, which is why AI quizzes cluster on whatever the model found interesting in the first few pages.

```ts
interface Blueprint {
  quiz_id: string;
  total_items: number;
  cells: {
    concept_id: string;
    bloom: "remember" | "understand" | "apply" | "analyze" | "evaluate";
    kind: "mcq" | "short" | "scenario";
    count: number;
    source_chunks: string[];
  }[];
}
```

Construction:

1. Select concepts by `importance`, weighted so that section coverage is proportional to section length. A chapter that is 40% of the page count gets ~40% of the items.
2. Enforce **spread**: no more than 25% of items from any one `section_path[0]`, and every level-1 section with ≥ 5% of the pages gets ≥ 1 item.
3. Apply the Bloom distribution for the requested difficulty:

| Difficulty | remember | understand | apply | analyze | evaluate |
|---|---|---|---|---|---|
| easy | 30% | 40% | 25% | 5% | 0% |
| medium | 10% | 30% | 40% | 15% | 5% |
| hard | 0% | 15% | 40% | 30% | 15% |

**At no difficulty does pure recall exceed 30%.** This single constraint does more for perceived quality than any prompt wording. Today's `difficulty` string (**D12**) becomes this table.

4. Map Bloom to type: `remember`/`understand` → MCQ or short; `apply`/`analyze` → scenario or MCQ built on a worked example; `evaluate` → short answer with rubric.
5. Prefer cells whose concepts have `misconceptions` (better distractors) or `worked_examples` (better scenarios) available.

The blueprint is stored. It is what lets the UI say *"12 questions across 5 sections; 60% application-level"* and what lets a user regenerate only the weak cells.

### 7.2 Summaries

Not one blob. Four layers, each independently useful:

1. **Thesis** — one sentence. What the document establishes. No meta-language ("This document discusses…"); state the content.
2. **Key points** — 5–10 bullets, each ≤ 25 words, each with a citation. Ordered by the document's own structure, not by importance, so the summary is navigable against the source.
3. **Section abstracts** — 2–3 sentences per level-1 (and level-2 for long docs) heading, generated from that section's chunks only. This is the layer students actually re-read.
4. **Key terms** — from `concepts` where `importance ≥ 3`, definition in the document's own words, with page reference.

Plus two things almost nobody ships and everyone needs:

5. **Scope note** — "This chapter covers X and Y; it does not address Z, which is deferred to chapter 9." Prevents the classic failure where a student assumes the summary is exhaustive.
6. **Open questions / caveats** — hedges, disputed points, and any `coverage_gaps` from extraction ("pages 214–216 were scanned and partially unclear").

**Quality rules for summary prose:**
- No sentence may introduce a fact absent from its cited chunk.
- Compression targets: thesis ≤ 40 words; key points ≈ 1 per 8 pages, floor 5, ceiling 12; section abstracts ≤ 60 words each.
- Preserve the document's own terminology and casing. Do not paraphrase a defined term into a synonym — a student searching the PDF must find the word.
- Preserve quantifiers and hedges exactly: "most", "in most cases", "approximately 40%" must not become "all" or "40%". This is the most common faithfulness failure in summarisation and it is invisible to the reader.
- Numbers, units and named entities are copied, never regenerated.

### 7.3 MCQ generation

One item per model call *or* small batches of 3 sharing a concept — never 20 in one response (**D7**). Each call receives: the target blueprint cell, the concept record, its citations' full chunk text, related misconceptions, and the sibling concepts (for distractor material). Nothing else.

Output contract:

```ts
interface MCQItem {
  kind: "mcq";
  concept_id: string;
  bloom: Bloom;
  stem: string;
  options: { text: string; correct: boolean; rationale: string; distractor_type?: DistractorType; misconception_id?: string }[];
  explanation: string;          // why the key is right, in 1-2 sentences, teaching-voice
  citations: Citation[];
  difficulty_estimate: 1 | 2 | 3 | 4 | 5;
}
```

**Rules — these are non-negotiable and belong verbatim in the prompt (Appendix A is the full list):**

- The stem is a **complete question or a complete problem**, ending in `?` or a clear directive. Never a sentence fragment completed by the options.
- **Cover-the-options test:** a competent reader must be able to answer the stem with the options hidden. If the stem is "Which of the following is true about entropy?" it fails — that is a scan-the-options task, not a question.
- **One defensibly best answer.** If a distractor can be argued correct under any reading, the item is broken.
- **Homogeneous options:** same category (all are causes, or all are values, or all are procedures), same grammatical form, same tense, parallel construction.
- **Length homogeneity:** longest option ≤ 1.6 × shortest, measured in words. Across a quiz, the key must not be the longest option more than 35% of the time. Test-wise students exploit the length tell relentlessly.
- **Never** "All of the above", "None of the above", "Both A and B", "A and C only".
- **No negative stems** ("Which is NOT…") unless the concept is genuinely a set of exclusions; if used, mark `NOT` in caps and cap them at 10% of the quiz.
- No absolutes ("always", "never", "all", "only") in distractors — students are trained to eliminate them, so they carry no information.
- No **clang association**: a distinctive word from the stem must not appear in the key alone.
- No **convergence cueing**: don't construct options from combinations of two attributes such that the key is the one sharing the most elements with the others.
- Options ordered logically — numeric ascending, chronological, or alphabetical. Never with the key in a fixed position; randomise key position with a per-quiz balance check (each position gets 25% ± 10%).
- The stem must not be a verbatim sentence from the source with a word removed. That is a lookup task, not comprehension. Deterministic gate G10 enforces this.
- For `apply`-level items, the stem presents a **situation the source does not literally contain**, requiring the source's rule to be applied. Take the rule from `claims` or `procedures`; take the situation's shape from `worked_examples`.

Every distractor carries a `distractor_type` from Appendix B and a `rationale` explaining specifically why a student who holds that misunderstanding would choose it. **A distractor whose rationale is "this is incorrect" is rejected.** Forcing the rationale is what stops the model producing three throwaway options.

### 7.4 Short answer with rubric

```ts
interface ShortAnswerItem {
  kind: "short";
  concept_id: string;
  bloom: Bloom;
  prompt: string;                 // states the expected scope: "In 2-3 sentences, explain…"
  expected_length: string;        // "2-3 sentences" | "a single term" | "a numeric answer with units"
  rubric: {
    total_points: number;         // 3-5
    criteria: {
      id: string;
      description: string;        // "Identifies entropy as a state function"
      points: number;
      required: boolean;          // a required criterion missing caps the score
      evidence_examples: string[];// phrasings that satisfy it
    }[];
    acceptable_synonyms: Record<string, string[]>;  // "state function": ["path-independent", "depends only on endpoints"]
    common_wrong_answers: { answer: string; feedback: string }[];
  };
  anchors: {                      // calibration examples the grader is shown
    full: string;                 // an answer earning full marks
    partial: string;              // an answer earning ~half, with the reason
    zero: string;                 // a plausible but wrong answer
  };
  citations: Citation[];
}
```

Rules:
- The prompt must state the expected length and the form of the answer. Unscoped short-answer prompts are unfair and ungradable.
- Criteria are **behavioural and checkable** — "identifies X", "relates X to Y", "gives a correct unit" — not "demonstrates understanding".
- 3–5 criteria. Fewer is coarse; more is noise.
- `acceptable_synonyms` is what fixes **D9**'s vocabulary problem: a student who answers correctly in their own words scores full marks.
- `common_wrong_answers` produce instant, specific feedback without a model call for the frequent cases.

### 7.5 Scenario / case-based items

The hardest to generate well and the most valuable. A scenario item tests *transfer*: can the student apply the source's principle to a situation they have not seen?

Structure:

1. **Vignette** — 60–120 words. A concrete, specific situation: named actors, real numbers, an explicit constraint, a decision point. Specificity is what makes it feel real; vagueness is what makes AI scenarios feel generated.
2. **Lead-in** — one question requiring the principle to be applied. "What will happen to…?" "Which action best…?" "What is the most likely cause of…?"
3. **Options** (if MCQ-form) are *decisions or outcomes*, never definitions.
4. **Resolution path** — a stored 2–4 step chain from the vignette's facts through the source's rule to the answer. This is what the verifier checks.

Hard constraints:
- The vignette must be **decidable from the cited chunks alone**. No outside knowledge, no ambiguity about which principle applies. The critic explicitly tests this (§8.2, check C4) — it is the single most common scenario failure mode.
- The vignette must **not** restate the principle it is testing. If the stem says "given that entropy always increases in an isolated system…", the item tests reading, not application.
- Numbers in the vignette must be consistent and must actually work out. Where the item involves calculation, the generator emits the arithmetic and a deterministic check re-runs it.
- Prefer transposing a `worked_example` into a new domain over inventing from scratch: same structure, different surface. This is how professional item writers work, and it is far more reliable than free invention.

### 7.6 Cross-item rules for the whole quiz

- **No two items testing the same claim.** Deduplicate by concept + claim id, and by trigram Jaccard > 0.65 on stems.
- **No item answering another.** A later stem must not contain the key to an earlier item. Check this deterministically over the assembled set (G11).
- Order: easy → hard within a section; sections in document order. A quiz that opens with its hardest item measures persistence, not knowledge.
- Balance key positions across MCQ items (25% ± 10% per position).
- The quiz carries a `coverage` report: which concepts and which sections were tested, and which were not.

---

## 8. Stage 6 — Verify & repair

Nothing reaches the user unverified. Two tiers: deterministic gates (free, instant) then an LLM critic (cheap, batched).

### 8.1 Deterministic gates

Run in code, in this order. A failure is either auto-repairable or a reject.

| Gate | Check | On failure |
|---|---|---|
| G1 | Exactly one option has `correct: true` | reject |
| G2 | `answer` string matches an option exactly (whitespace-normalised) | auto-repair |
| G3 | Option word count: max ≤ 1.6 × min | repair (regenerate the outlier) |
| G4 | No banned phrases: *all of the above*, *none of the above*, *both .. and ..*, *a and c* | reject |
| G5 | Negative stem (`\bnot\b`, `\bexcept\b`, `\bleast\b`) — allowed but counted; ≤ 10% of quiz | flag |
| G6 | Stem trigram Jaccard vs every other stem in the quiz < 0.65 | reject the later item |
| G7 | ≥ 1 citation, resolvable to a `document_chunks.id` on this document | reject |
| G8 | Citation `quote` appears verbatim in the cited chunk (whitespace-normalised) | reject |
| G9 | Stem 8–70 words; each option ≤ 25 words | repair |
| G10 | Stem is not a source sentence with ≥ 20 consecutive words copied | reject |
| G11 | No other stem in the quiz contains this item's key as a substring | reject the later item |
| G12 | Every distractor has a non-empty `rationale` ≥ 8 words and a `distractor_type` | repair |
| G13 | `a`/`an` agreement between stem tail and each option head; plural agreement | repair |
| G14 | For numeric items: the stated arithmetic re-computes to the key within tolerance | reject |
| G15 | Key position distribution across the quiz within 25% ± 10% | shuffle |

G8 alone eliminates most fabrication, and it costs nothing.

### 8.2 The LLM critic

A **separate call** with a **different prompt** and no access to the generator's reasoning. Input: the item + the full text of its cited chunks. Nothing else. Batch 5 items per call. Run at low effort with adaptive thinking (see §16) — `temperature` is rejected on the current models.

Checks:

| id | Check | Output |
|---|---|---|
| C1 | **Faithfulness** — is the key supported by the cited text? | `yes/no` + the supporting quote |
| C2 | **Unique answer** — can any distractor be defended as correct under a reasonable reading? | `yes/no` + which one + the argument |
| C3 | **Cover-the-options** — is the stem answerable with options hidden? | `yes/no` |
| C4 | **Decidability** (scenario items) — is the vignette answerable from the cited text alone, without outside knowledge? | `yes/no` + what's missing |
| C5 | **Distractor plausibility** — would a student with a partial understanding pick each distractor? Rate each 1–5. | per-option score |
| C6 | **Actual Bloom level** vs the blueprint's target | level + agreement flag |
| C7 | **Difficulty estimate** 1–5, with the reason | int + reason |
| C8 | **Language quality** — ambiguity, double negatives, unnecessary jargon, cultural assumptions | list of issues |
| C9 | **Fairness** — does the item require knowledge the document doesn't provide? | `yes/no` |

Verdict: `accept` | `repair` (with a specific instruction) | `reject` (with a reason code).

Reject if: C1 = no, C2 = yes, C9 = yes, or mean C5 < 2.0.
Repair if: C3 = no, C6 disagrees by ≥ 2 levels, C8 non-empty, or one distractor scores C5 = 1.

### 8.3 Repair loop

- Max **2** repair attempts per item, each with the critic's specific instruction fed back to the generator.
- After 2 failures, drop the item and generate a replacement for the same blueprint cell using a different concept or chunk.
- After 3 consecutive failures on one cell, drop the cell and rebalance the blueprint.
- Log every reject with its reason code to `question_rejects`. **The reject-reason histogram is your prompt-tuning signal** — it tells you exactly which rule the generator keeps breaking, which is far more actionable than a quality score.

Publish the acceptance rate as an internal metric. A healthy pipeline sits around 70–85% first-pass acceptance. Above 95% means the critic is too lenient; below 50% means the generator prompt needs work.

---

## 9. Grading (fixes D9)

### 9.1 MCQ / multi-select
Deterministic, unchanged. Multi-select scores partial credit: `max(0, (correct_selected − incorrect_selected) / total_correct)`.

### 9.2 Short answer

A dedicated grader call. The grader sees **only** `{prompt, rubric, anchors, student_answer}` — deliberately **not** the source document, so it cannot award marks for statements that are true but not responsive.

```ts
interface GradeResult {
  criteria: { id: string; met: boolean; evidence: string | null }[];  // evidence = the student's own words
  points: number;
  max_points: number;
  feedback: string;        // ≤ 40 words, second person, specific, actionable
  confidence: number;      // 0-1
  flag_for_review: boolean;
}
```

Rules:
- Deterministic-as-possible settings (§16.1 — note `temperature` is **not** a valid parameter on Opus 5 / Sonnet 5 / Fable 5; it returns a 400). Cache the grade by `hash(question_id, normalised_answer)` so a repeated identical answer never re-grades and can never score differently.
- Grade **each criterion independently**, then sum. Do not ask for a holistic score — holistic LLM scores are noisy and unexplainable.
- `evidence` must quote the student's own words. If a criterion is marked met with no quotable evidence, the grader is confabulating; force `met: false`.
- Check `acceptable_synonyms` and `common_wrong_answers` **in code first**. An exact match against a common wrong answer returns its stored feedback with no model call.
- `confidence < 0.7` → `flag_for_review: true`. Show the student a provisional score and an "I think this is wrong" button. Route disputes into `question_reviews`.
- Feedback names what was missing, never just "incorrect". "You identified entropy as increasing but didn't connect it to the system being isolated" is worth more than the score.
- Keep the existing `shortAnswerCorrect` heuristic in `QuizRunner.tsx` as the **offline/no-key fallback only**, clearly labelled in the UI as approximate.

### 9.3 Scenario items
Graded as MCQ when option-form. When free-response, use the short-answer grader with the stored `resolution_path` steps as rubric criteria — this credits correct reasoning that reaches a wrong final answer, which is exactly the distinction a good assessment makes.

### 9.4 Item statistics (fixes D11)

Record per-item outcomes, not just quiz scores. After each attempt, upsert into `item_stats`:

- **p-value** = proportion correct. Target band 0.30–0.85.
- **Point-biserial discrimination** = correlation between getting this item right and total quiz score. Target ≥ 0.20.
- **Distractor analysis** — selection rate per option. A distractor chosen by < 5% of students is dead weight; one chosen more than the key signals a miskeyed item.

Rules that follow automatically once you have this:
- `p > 0.95` → too easy, deprioritise in future quizzes on this document.
- `p < 0.20` **and** discrimination < 0.10 → probably broken or miskeyed. Auto-flag for review.
- Discrimination < 0 → the item punishes strong students. Retire it immediately.

This is the feedback loop that separates a quiz *platform* from a quiz *generator*. It costs one table and a trigger.

---

## 10. Schema changes

New migration `quizai/supabase/migrations/005_quality_pipeline.sql`. Idempotent, matching the style of `003_multi_select.sql`.

```sql
-- ============================================================================
-- 005 — Quality pipeline: provenance, document map, item metadata, item stats
-- ============================================================================

-- ---------- documents: extraction telemetry ----------
alter table public.documents add column if not exists doc_sha256 text;
alter table public.documents add column if not exists extraction_method text;   -- 'text_layer'|'ocr'|'vision'|'mixed'
alter table public.documents add column if not exists extraction_quality numeric;
alter table public.documents add column if not exists extraction_plan jsonb;
alter table public.documents add column if not exists extraction_notes jsonb default '[]';
create index if not exists documents_sha_idx on public.documents(user_id, doc_sha256);

-- widen the status machine (§11)
alter table public.documents drop constraint if exists documents_status_check;
alter table public.documents add constraint documents_status_check
  check (status in ('uploaded','extracting','mapping','generating','verifying','ready','failed'));

-- ---------- document_chunks ----------
create table if not exists public.document_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  ordinal      int  not null,
  kind         text not null default 'prose'
               check (kind in ('prose','table','figure','formula','list')),
  section_path jsonb not null default '[]',
  page_start   int  not null,
  page_end     int  not null,
  bbox         jsonb,
  text         text not null,
  context      text,
  token_count  int,
  confidence   numeric not null default 1.0,
  created_at   timestamptz not null default now()
);
create index if not exists chunks_doc_idx on public.document_chunks(document_id, ordinal);

-- ---------- document_maps ----------
create table if not exists public.document_maps (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  version      int  not null default 1,
  doc_type     text,
  thesis       text,
  outline      jsonb not null default '[]',
  concepts     jsonb not null default '[]',
  claims       jsonb not null default '[]',
  procedures   jsonb not null default '[]',
  relationships jsonb not null default '[]',
  misconceptions jsonb not null default '[]',
  worked_examples jsonb not null default '[]',
  quantities   jsonb not null default '[]',
  scope_note   text,
  coverage_gaps jsonb not null default '[]',
  created_at   timestamptz not null default now(),
  unique (document_id, version)
);

-- ---------- questions: quality metadata ----------
alter table public.questions add column if not exists bloom text
  check (bloom is null or bloom in ('remember','understand','apply','analyze','evaluate'));
alter table public.questions add column if not exists item_difficulty int;      -- 1-5, generator estimate
alter table public.questions add column if not exists concept_id text;
alter table public.questions add column if not exists citations jsonb default '[]';
alter table public.questions add column if not exists option_meta jsonb;        -- per-option rationale + distractor_type
alter table public.questions add column if not exists rubric jsonb;             -- short-answer only
alter table public.questions add column if not exists anchors jsonb;
alter table public.questions add column if not exists resolution_path jsonb;    -- scenario only
alter table public.questions add column if not exists verified boolean not null default false;
alter table public.questions add column if not exists quality jsonb;            -- critic output C1-C9
alter table public.questions add column if not exists retired boolean not null default false;

alter table public.questions drop constraint if exists questions_kind_check;
alter table public.questions add constraint questions_kind_check
  check (kind in ('mcq','tf','short','match','order','flashcard','multi','scenario'));

-- ---------- blueprints ----------
alter table public.quizzes add column if not exists blueprint jsonb;
alter table public.quizzes add column if not exists coverage jsonb;
alter table public.quizzes add column if not exists generator_version text;

-- ---------- summaries: layered + cited ----------
alter table public.summaries add column if not exists thesis text;
alter table public.summaries add column if not exists sections jsonb default '[]';
alter table public.summaries add column if not exists scope_note text;
alter table public.summaries add column if not exists caveats jsonb default '[]';
alter table public.summaries add column if not exists citations jsonb default '[]';

-- ---------- per-item responses (§9.4) ----------
create table if not exists public.attempt_items (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  response    text,
  correct     boolean,
  points      numeric,
  max_points  numeric,
  grader      text,                    -- 'deterministic' | 'rubric_llm' | 'fallback_heuristic'
  grade_detail jsonb,
  ms_spent    int,
  created_at  timestamptz not null default now()
);
create index if not exists attempt_items_q_idx on public.attempt_items(question_id);

create table if not exists public.item_stats (
  question_id   uuid primary key references public.questions(id) on delete cascade,
  n             int not null default 0,
  n_correct     int not null default 0,
  p_value       numeric,
  discrimination numeric,
  option_rates  jsonb,
  updated_at    timestamptz not null default now()
);

-- ---------- rejects + disputes ----------
create table if not exists public.question_rejects (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  stage       text not null,           -- 'gate' | 'critic'
  code        text not null,           -- 'G8' | 'C2' | ...
  detail      jsonb,
  payload     jsonb,                   -- the rejected item, for prompt tuning
  created_at  timestamptz not null default now()
);

create table if not exists public.question_reviews (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  reason      text,
  status      text not null default 'open' check (status in ('open','upheld','rejected')),
  created_at  timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.document_chunks   enable row level security;
alter table public.document_maps     enable row level security;
alter table public.attempt_items     enable row level security;
alter table public.item_stats        enable row level security;
alter table public.question_rejects  enable row level security;
alter table public.question_reviews  enable row level security;
-- Policies mirror the existing "user owns the row" pattern in schema.sql;
-- item_stats is aggregate — expose read-only to the question's owner.
```

Also update `quizai/lib/types.ts` to mirror every one of these. The existing file explicitly documents itself as mirroring the schema — keep that true.

---

## 11. Job model & API (fixes D10)

The 120s `maxDuration` ceiling cannot hold this pipeline. Move to a job.

**State machine on `documents.status`:**
`uploaded → extracting → mapping → generating → verifying → ready` (any state → `failed`)

**Endpoints:**

| Route | Change |
|---|---|
| `POST /api/documents/[id]/extract` | Kicks off stage 1–3. Calls the Python `POST /extract`. Writes `document_chunks`. Idempotent on `doc_sha256`. |
| `POST /api/documents/[id]/map` | Stage 4. Writes `document_maps`. Idempotent — returns the cached map if `version` exists. |
| `POST /api/generate` | **Rewritten.** Requires a map. Builds the blueprint, generates, verifies, writes. Returns a job id immediately. |
| `GET /api/jobs/[id]` | Progress: stage, percent, items generated, items rejected. |
| `POST /api/questions/[id]/grade` | Short-answer / scenario grading (§9.2). |
| `POST /api/questions/[id]/review` | Student dispute → `question_reviews`. |

**Python side — new endpoint, replacing the TS extraction path entirely (fixes D2):**

```
POST /extract   (multipart: file)
 → { doc_sha256, page_count, extraction_plan, extraction_quality,
     blocks: Block[], chunks: DocumentChunk[], notes: string[] }
```

`app/api/generate/route.ts` stops importing `unpdf`. `lib/pdfClient.ts` keeps `unpdf` only for the browser-local "My AI" path, where a server round-trip isn't wanted — and that path should be labelled in the UI as reduced-fidelity.

**Progress reporting.** Write stage transitions to `documents.status` and a `progress` jsonb; `components/RealtimeRefresh.tsx` already subscribes, so the UI updates for free. Show real stage names — "Reading pages 240–412", "Building the concept map", "Writing question 7 of 12", "Checking answers" — not a spinner. A 4-minute wait with visible progress reads as thorough; 90 seconds of spinner reads as broken.

**Failure policy.** Every stage is retryable independently. If generation fails after extraction succeeded, the user does not re-upload and does not re-pay for extraction. If the LLM path fails entirely, fall back to the deterministic engine and **say so** in the UI.

---

## 12. Prompts

Verbatim, ready to paste. All use structured output — see §16.2 for which mechanism (`output_config.format` vs. forced tool use) applies where, and §16.1 for effort/thinking settings per stage. **Do not pass `temperature`**: it was removed on Opus 5, Sonnet 5 and Fable 5 and returns a 400.

### P1 — Vision transcription (scanned page)

```
You are transcribing a scanned page for a study application. Reproduce the page's
text exactly as it appears.

Rules:
- Transcribe, never summarise, correct, or complete. If a word is illegible, write [?].
- Preserve reading order. If the page has columns, transcribe the left column fully,
  then the right column. Mark column breaks with [COLUMN BREAK].
- Preserve headings, list markers and numbering exactly.
- Render tables as Markdown tables. Preserve every cell, including empty ones.
- Render mathematics as LaTeX between $ delimiters.
- For figures: write [FIGURE: <caption text as printed>] — do not describe the image here.
- Mark headers/footers/page numbers as [HEADER: ...] / [FOOTER: ...].
- Output only the transcription.
```

### P2 — Table transcription (vision fallback)

```
Transcribe this table exactly. Output a Markdown table plus a JSON grid.

Rules:
- Every cell of the printed table appears in the output, including blanks (use "").
- A cell spanning multiple columns is repeated in each column it spans; note it in "merges".
- Preserve the header row(s) verbatim, including units and footnote markers.
- Never infer, complete, or reformat a value. Copy the characters printed.
- If a row is cut off at the page edge, set "truncated": true.

Return: { "markdown": "...", "grid": [[...]], "merges": [...], "truncated": bool, "caption": "..." }
```

### P3 — Figure description

```
Describe this figure so a student who cannot see it can still answer questions about it.

You are given the figure image, its printed caption, and the paragraph that references it.

Write 60-150 words covering:
- What kind of figure it is and what it depicts.
- Axes, units, scales, and the range shown (for plots).
- Labelled components and their relationships (for diagrams).
- The specific trend, comparison or value the reader is meant to take away.

Rules:
- Describe only what is visible. Do not explain the underlying theory.
- Copy numbers, labels and units exactly as printed.
- No hedging language ("appears to", "seems"). If something is unreadable, say so plainly.
- Do not begin with "This figure shows".
```

### P4 — Formula transcription

```
Transcribe the mathematical content of this image region as LaTeX, then state it in
plain language.

Return: { "latex": "...", "plain": "...", "variables": [{"symbol":"k","meaning":"rate constant"}] }

Rules:
- The LaTeX must compile. Use \frac, \sum, \int, subscripts and superscripts correctly.
- "plain" reads the equation aloud in words a student would use.
- "variables" lists only symbols whose meaning is stated in the surrounding text. Never guess.
```

### P5 — Document map, MAP stage

```
You are building a structured knowledge map of a document, one section at a time.
You will be given <chunk> blocks with ids, page numbers and section paths.

Extract, using ONLY what these chunks state:

concepts      — named ideas the document defines or develops. Give the definition in the
                document's own words. Include aliases used interchangeably.
claims        — testable factual assertions. Preserve every qualifier exactly ("in most
                cases", "under standard conditions", "approximately"). A claim stripped of
                its qualifier is a fabrication.
procedures    — ordered step sequences, with any stated preconditions.
relationships — causes / part_of / contrasts_with / depends_on / example_of / increases /
                decreases, between named concepts.
misconceptions— errors the document explicitly warns about. Look for: "a common error",
                "note that X is not Y", "students often", "contrary to", "it is tempting to",
                "unlike", "should not be confused with".
worked_examples— setup, method and result of any example the document works through.
quantities    — numbers, thresholds, constants and units, with the condition they hold under.

Rules:
- Every entry carries at least one citation: {chunk_id, page, quote}. The quote must be
  VERBATIM from the chunk, at most 200 characters. Entries whose quote cannot be found in
  the source will be discarded.
- Extract nothing that is not in these chunks. Not from your own knowledge, not by
  inference beyond what the text states.
- If a chunk is a table or figure, extract the comparisons and values it encodes.
- Prefer fewer, well-cited entries over many thin ones.
```

### P6 — Blueprint (deterministic in code; model only for the type/Bloom sanity pass)

Build the blueprint in TypeScript per §7.1. Use the model only to sanity-check that a chosen concept can support the requested Bloom level, and to swap in an alternative when it cannot.

### P7 — MCQ generation

```
You are a professional assessment item writer producing exam-quality multiple-choice
questions from source material. You are given one concept, its citations' full text, any
misconceptions the document records about it, and the target cognitive level.

Write {n} multiple-choice item(s) at the {bloom} level testing this concept.

STEM RULES
- The stem is a complete question or problem, ending in "?" or a clear directive.
- COVER-THE-OPTIONS TEST: a knowledgeable reader must be able to answer the stem with the
  options hidden. If your stem is "Which of the following is true about X?", rewrite it.
- 8-70 words. Include all information needed to answer.
- Never copy 20 or more consecutive words from the source. A question the reader can answer
  by pattern-matching against the text tests searching, not knowing.
- For "apply" or higher: present a situation NOT literally in the source, which requires the
  source's rule to resolve.
- Avoid negative stems. If the concept genuinely concerns exclusions, write NOT in capitals.

OPTION RULES
- Exactly 4 options. Exactly one is defensibly correct.
- Homogeneous: same category, same grammatical form, same tense, parallel construction.
- Similar length. The longest option may not exceed 1.6x the shortest in word count.
- Order logically: numeric ascending, chronological, or alphabetical.
- FORBIDDEN: "All of the above", "None of the above", "Both A and B", "A and C only".
- No absolutes ("always", "never", "only", "all") in distractors.
- No word from the stem may appear in the correct option alone.

DISTRACTOR RULES — each distractor uses one of these strategies, and you must name it:
  misconception        a specific wrong belief the document warns about
  wrong_scope          right concept, wrong magnitude, unit, or range
  sibling_term         an adjacent term from the same taxonomy
  true_but_irrelevant  a true statement that does not answer this question
  neighbouring_answer  the correct answer to a closely related question
  partial              necessary but insufficient
  reversal             cause and effect inverted, or the relationship's direction flipped
  overgeneralization   a conditional rule stated without its condition
  step_error           a plausible mis-step in a procedure or calculation

For every distractor, write a rationale explaining what a student would have to believe to
choose it. "This is incorrect" is not a rationale and the item will be rejected.

EXPLANATION
- 1-2 sentences, addressed to the student, explaining why the key is right. Teach; do not
  restate the option.

CITATIONS
- Every item cites the chunk(s) supporting the key, with a verbatim quote.
```

### P8 — Short answer + rubric

```
Write {n} short-answer item(s) at the {bloom} level testing this concept, each with a
scoring rubric a grader can apply without seeing the source document.

PROMPT RULES
- State the expected form and length: "In 2-3 sentences, explain...", "Give the value with
  units...", "List the three stages, in order...".
- Ask for something with a determinable answer. "Discuss X" is not an item.

RUBRIC RULES
- 3-5 criteria, each worth whole points, totalling 3-5 points.
- Each criterion is behavioural and checkable: "identifies X as Y", "connects X to Z",
  "gives the correct unit". Never "demonstrates understanding" or "shows insight".
- Mark a criterion required:true when its absence should cap the score regardless of the rest.
- evidence_examples: 2-3 different phrasings that satisfy the criterion.
- acceptable_synonyms: for each key term, the alternative wordings a correct student might
  use. This is what prevents penalising correct answers phrased differently.
- common_wrong_answers: 2-4 answers students actually give, each with specific feedback.

ANCHORS
- full: an answer earning every point.
- partial: an answer earning roughly half, with the reason it falls short.
- zero: a plausible-sounding answer that earns nothing, with the reason.
```

### P9 — Scenario / case-based

```
Write a case-based item testing whether a student can APPLY this material to a situation
they have not seen.

VIGNETTE — 60-120 words
- A concrete situation: specific actors, specific numbers, an explicit constraint, a decision
  point. Specificity is what makes it real; generic scenarios read as filler.
- It must be resolvable using ONLY the cited source material. No outside knowledge.
- It must NOT restate the principle being tested. If the vignette tells the student the rule,
  the item tests reading.
- Any numbers must be internally consistent and must actually work out.

LEAD-IN — one question requiring the principle to be applied: what will happen, which action
is best, what is the most likely cause.

OPTIONS — decisions or outcomes, never definitions. Same 4-option rules as P7.

RESOLUTION PATH — 2-4 steps from the vignette's facts, through the source's rule, to the
answer. This is checked by a verifier; make each step explicit.

Prefer transposing a worked example from the source into a different surface context over
inventing a situation from nothing.
```

### P10 — Critic

```
You are reviewing a quiz item for defects. You are given the item and the FULL TEXT of the
source it cites. Judge only against that text.

You did not write this item. Assume it contains a defect and look for it.

Answer each check:
C1 faithfulness   — Is the keyed answer supported by the cited text? Quote the support, or
                    state that none exists.
C2 unique answer  — Can any distractor be defended as correct under a reasonable reading?
                    If yes, name it and give the argument.
C3 cover-the-options — Could a knowledgeable reader answer the stem with the options hidden?
C4 decidability   — (scenario items) Is the vignette answerable from the cited text alone?
                    If not, name what outside knowledge it requires.
C5 distractors    — Rate each distractor 1-5 on whether a student with a partial understanding
                    would plausibly choose it. 1 = nobody would pick this.
C6 bloom          — What cognitive level does this item ACTUALLY test?
C7 difficulty     — 1-5, with your reason.
C8 language       — List ambiguities, double negatives, unnecessary jargon, or cultural
                    assumptions. Empty list if none.
C9 fairness       — Does answering require knowledge the source does not provide?

Then: verdict = accept | repair | reject.
- repair: give ONE specific instruction that would fix the item.
- reject: give the reason code.

Be strict. An item you accept goes to a student as a graded question.
```

### P11 — Short-answer grader

```
Grade this student response against the rubric. You are NOT given the source document —
grade only what the rubric asks for. A statement that is true but does not satisfy a
criterion earns nothing.

For each criterion, decide met/not-met and quote the words in the student's response that
satisfy it. If you cannot quote evidence, the criterion is not met.

Then: total the points, and write feedback of at most 40 words addressed to the student.
Name what was missing or wrong specifically. Never write only "incorrect".

Also return a confidence between 0 and 1. Use below 0.7 when the response is ambiguous,
off-topic in a way the rubric does not anticipate, or arguably correct in a way the criteria
do not capture. A low-confidence grade is reviewed by a human — that is the correct outcome
for a genuinely borderline answer.
```

---

## 13. Evaluation

You cannot improve what you don't measure, and "the quiz looks good" is not a measurement. Build the harness before the second iteration of prompts.

### 13.1 Golden set

10–15 documents in `quiz-engine/eval/corpus/`, chosen to hit every failure mode:

| # | Document | Tests |
|---|---|---|
| 1–2 | Two-column research papers | column reading order, references handling |
| 3–4 | Textbook chapters with figures and worked examples | figure description, scenario generation |
| 5 | Scanned lecture notes (photographed) | OCR, deskew, confidence gating |
| 6 | Slide deck exported to PDF | sparse text, title/bullet structure |
| 7 | Document with multi-page tables | table stitching |
| 8 | Math-heavy chapter | formula transcription |
| 9 | Mixed digital + scanned appendix | per-page routing |
| 10 | Very long document (300+ pages) | chunking, coverage spread, cost |
| 11 | Non-English or heavily accented text | normalisation |
| 12 | Badly OCR'd document (deliberately poor) | quality gate correctly refuses |

For 3 of them, hand-transcribe 5 pages each as ground truth. That is a few hours of work and it pays for itself on the first regression.

### 13.2 Extraction metrics

| Metric | How | Target |
|---|---|---|
| Character F1 vs. hand transcription | normalised char-level alignment | ≥ 0.97 digital, ≥ 0.90 OCR |
| Reading-order Kendall τ | vs. hand-ordered block sequence | ≥ 0.95 |
| Table cell F1 | cell-by-cell against hand-built grid | ≥ 0.90 |
| Figure recall | figures detected ÷ figures present | ≥ 0.95 |
| Heading tree edit distance | vs. the document's real outline | ≤ 2 operations |

### 13.3 Generation metrics

| Metric | How | Target |
|---|---|---|
| Gate pass rate | § 8.1, automatic | ≥ 90% first pass |
| Critic accept rate | § 8.2, automatic | 70–85% first pass |
| Citation validity | quote found verbatim in cited chunk | 100% (it is a hard gate) |
| Coverage | distinct level-1 sections tested ÷ sections present | ≥ 0.8 |
| Bloom conformance | actual (critic C6) vs. blueprint target | ≥ 75% within 1 level |
| Duplicate rate | stem Jaccard > 0.65 pairs | 0 |
| Key position balance | χ² across 4 positions | p > 0.05 |
| **Expert rating** | a human rates 30 sampled items 1–5 on "would I put this on a real exam" | mean ≥ 4.0 |

The expert rating is the only one that actually matters; the rest are proxies that let you iterate between expert reviews. Do 30 items after every substantive prompt change.

### 13.4 Grading metrics

Collect 100 real student short answers across 10 items. Have a human grade them. Then measure:

- **Exact agreement** with the human grader: target ≥ 85%.
- **Within-1-point agreement**: target ≥ 97%.
- **Systematic bias**: mean(model − human). Should be within ±0.15 points. A grader that is consistently generous is worse than one that is noisy, because it is invisible.
- **Calibration**: among items graded at confidence < 0.7, human disagreement should be materially higher than among confident ones. If it isn't, the confidence signal is decorative.

### 13.5 CI

Run extraction metrics on the golden set on every PR touching `quiz-engine/`. Run generation gates (not the LLM critic — too slow and costly for CI) on 3 documents on every PR touching prompts or `lib/generate.ts`. Fail the build on a regression greater than 2% on any hard metric.

---

## 14. Model choice, cost and latency

### 14.1 Model tiering

Current model IDs and first-party API pricing (per million tokens):

| Model | ID | Context | Input | Output |
|---|---|---|---|---|
| Claude Opus 5 | `claude-opus-5` | 1M | $5.00 | $25.00 |
| Claude Sonnet 5 | `claude-sonnet-5` | 1M | $3.00 | $15.00 |
| Claude Haiku 4.5 | `claude-haiku-4-5` | 200K | $1.00 | $5.00 |

The repo currently pins `claude-sonnet-5` in `lib/anthropic.ts:9`. Recommended assignment — **use `claude-opus-5` for the stages where quality compounds**, and treat any downgrade as a deliberate cost decision, not a default:

| Stage | Model | Why |
|---|---|---|
| Vision transcription (P1–P4) | `claude-opus-5` | Errors here poison everything downstream and are invisible later |
| Document map (P5) | `claude-opus-5` | Built once per document, cached forever, and determines every artifact's quality. The highest-leverage call in the system |
| Generation (P7–P9) | `claude-opus-5` | Item quality is the product |
| Critic (P10) | `claude-opus-5` | A critic weaker than the generator cannot catch the generator's mistakes — this is the one place where downgrading is actively counterproductive |
| Grading (P11) | `claude-opus-5` | Grades are shown to students as fact |
| Summary section abstracts | `claude-sonnet-5` acceptable | Lower stakes, high volume |

The 1M context window on Opus 5 and Sonnet 5 removes any architectural need for the 60,000-character truncation in `lib/generate.ts:157` — but do not respond by dumping whole documents into the prompt. Chunk-and-map still wins on quality (targeted context beats buried context), on cost (caching), and on citability.

### 14.2 Prompt caching — the main cost lever

The generation and verification stages send the same large prefix over and over: the document map, plus the chunks for a given section. Cache it.

- Caching is a **prefix match**: order is `tools` → `system` → `messages`. Put the stable content first (system prompt, tool definitions, document map, chunk text) and the volatile content (this item's blueprint cell, this student's answer) *after* the last `cache_control` breakpoint.
- Minimum cacheable prefix is ~1024 tokens; shorter prefixes silently don't cache. Max 4 breakpoints per request.
- Verify with `usage.cache_read_input_tokens`. If it is zero across repeated calls, something in the prefix is varying — a timestamp, an unsorted JSON key order, a per-request id. Serialise the document map with sorted keys and no timestamps.
- Practical effect: generating 12 items from one document map goes from 12 full-price prefix reads to 1, and the critic pass re-reads the same cached chunks.

### 14.3 Batch API

Item generation and verification are not latency-sensitive once the pipeline is a job (§11). The Message Batches API runs asynchronously at **50% cost**. Submit all blueprint cells as one batch, poll until `processing_status == "ended"`, then key results by `custom_id` — results arrive in **any order**, so never match by position.

Reserve synchronous calls for the interactive paths: short-answer grading and single-item regeneration.

### 14.4 Rough budget, 300-page textbook

| Stage | Calls | Notes |
|---|---|---|
| Extraction | 0 LLM (digital) / ~30 vision (scanned+figures+tables) | The dominant cost on scanned documents |
| Document map | ~50 map + 1 reduce | **Once per document**, cached and reused forever |
| Blueprint | 0 | Code |
| Summary | ~8 | One per level-1 section + one reduce |
| Generation | ~12 (1 per item) | Batched at 50% |
| Verification | ~3 (5 items per call) | Batched |
| **Second quiz on the same document** | **~15** | Map and extraction are already paid for |

The shape to internalise: **the expensive part is paid once per document; every subsequent quiz, summary, flashcard deck and practice set is cheap.** That is what makes the quality pipeline economically viable, and it is the argument for building the map even though it looks like an extra step.

### 14.5 Latency

Target: 60–90s for a 30-page document, 3–5 minutes for a 300-page one. This is acceptable **only** with real progress reporting (§11). Stream nothing to the user until extraction quality is known; then show the extraction summary immediately — it gives the user something true to read while generation runs.

---

## 15. Rollout

Ordered by (quality gained ÷ effort). Each phase ships independently.

**Phase 0 — stop the bleeding (1–2 days).** Fixes D1, D2.
- Remove the 60,000-char truncation. Chunk instead; if you do nothing else, chunk and generate per-section.
- Delete the `unpdf` extraction from `app/api/generate/route.ts`; call the Python engine's extraction for both paths.
- Tell the user when a document was truncated or partially read. Honesty before capability.
- Raise `max_tokens` from 4096 — it is a hard cap that truncates output mid-item.

**Phase 1 — reading quality (3–5 days).** Fixes D4, D5, D6.
- Column detection and reading order (§4.2). Highest single quality gain per line of code.
- Blocks with page + bbox; chunks with `section_path` (§5). Unlocks citations.
- OCR path for scanned pages (§4.3).
- Tables and figures (§4.4, §4.5).
- `extraction_quality` score, surfaced in the UI (§4.7).

**Phase 2 — the document map (3–4 days).** The differentiator.
- `document_maps` table, map-reduce extraction (§6), verbatim-quote validation.
- Blueprint construction (§7.1).
- Re-point summary generation at the map (§7.2).

**Phase 3 — item quality (4–6 days).** Fixes D7, D8.
- Per-item generation with P7/P8/P9.
- Distractor taxonomy with required rationales.
- Deterministic gates (§8.1) — cheap, and they catch a lot on their own.
- LLM critic and repair loop (§8.2, §8.3).

**Phase 4 — grading and feedback (2–3 days).** Fixes D9.
- Rubric generation, rubric grading, confidence flagging, dispute path.
- Scenario items with resolution-path checking.

**Phase 5 — the learning loop (2–3 days).** Fixes D11, D12.
- `attempt_items`, `item_stats`, p-value and discrimination.
- Auto-flag broken items; retire negative-discrimination items.
- Feed measured difficulty back into the blueprint so "hard" means measured-hard.

**Phase 6 — study features that the map makes nearly free.**
- Spaced repetition over `concepts` weighted by measured weakness.
- "Explain this to me" grounded in the cited chunks.
- Practice sets targeting a student's specific missed concepts.
- Prerequisite-aware ordering from the concept DAG.

Phases 0 and 1 alone will produce a visible step change. Phase 2 is where the product stops being a wrapper.

---

## 16. Anthropic API specifics

The repo already uses `@anthropic-ai/sdk`. Several patterns in `lib/generate.ts` predate the current API surface — correct them while you are in there.

### 16.1 Request settings

- **`temperature` is removed** on `claude-opus-5`, `claude-sonnet-5` and `claude-fable-5` — passing it returns a **400**. Any "temperature 0" instinct from other providers must be dropped. Control depth with `output_config: { effort: "low" | "medium" | "high" | "xhigh" | "max" }` instead (default `high`).
- **Thinking:** use `thinking: { type: "adaptive" }`. `budget_tokens` is rejected on the current models. On Opus 5 thinking is on by default; do not disable it.
- Suggested per stage: critic and grading at `effort: "high"` (correctness matters, output is short); generation at `"high"`; map extraction at `"medium"`; bulk figure captioning at `"low"`.
- **`max_tokens`:** the current `4096` (`lib/generate.ts:165`) is too low and silently truncates. Use ~16,000 for non-streaming calls, ~64,000 when streaming. Stream anything with a large `max_tokens` to avoid HTTP timeouts, and use `.finalMessage()` to collect the result.
- Assistant **prefill is removed** on these models (400). Use structured output to constrain format.

### 16.2 Structured output

Two mechanisms; pick per stage.

- **`output_config: { format: { … } }`** is the current structured-output parameter (the older top-level `output_format` is deprecated). Prefer `client.messages.parse()`, which validates the response against your schema.
- **Forced tool use** — what `lib/generate.ts` does today via `tool_choice: { type: "tool", name: "emit_study_pack" }` — still works and is the right choice where you also want document citations (below). Add `strict: true` as a **top-level field on the tool definition** (not on `tool_choice`), with `additionalProperties: false` and a complete `required` list, to guarantee the input validates.

Replace the single monolithic `emit_study_pack` tool with one tool per stage: `emit_document_map_fragment`, `emit_blueprint`, `emit_mcq_items`, `emit_short_answer_items`, `emit_scenario_item`, `emit_critique`, `emit_grade`. One tool per call, forced. Small schemas produce better adherence than one large one.

### 16.3 Native PDF input and citations — evaluate as a complement

Claude accepts PDFs directly: a `document` content block with `source: { type: "base64", media_type: "application/pdf", data: … }` placed **before** the text block (limits: 32 MB per request, 600 pages). The model sees the page images as well as the text, which means figures, tables and layout are understood without a separate extraction step.

Setting `citations: { enabled: true }` on a document block makes the response carry citation objects with `page_location` (`start_page_number` / `end_page_number`, 1-indexed) — provenance straight from the API.

**Where this fits.** It does not replace the extraction pipeline: you still need chunks for caching, for retrieval, for coverage measurement and for regeneration without re-reading, and 600 pages is a real ceiling. But it is an excellent **second opinion on hard pages** — send a page whose extraction confidence is low as a native PDF page and compare. It is also the fastest possible path for short documents (< 30 pages), and worth an A/B against the full pipeline for that segment.

**Constraint to respect:** citations are **incompatible with `output_config.format`** (returns a 400). If you want both structure and citations, use forced tool use for the structure and read the citation blocks from the response — do not try to combine citations with the structured-output parameter.

### 16.4 Errors

Catch a chain, most specific first — `NotFoundError` → `RateLimitError` → `APIStatusError` → `APIConnectionError` — not one broad `APIError`. Retryable (429, 5xx, connection) and non-retryable (400, 404) failures need different handling, and the existing `fetchEngine` retry logic in `lib/quizEngine.ts` is the right shape to mirror for model calls.

Note also: server-tool errors return **HTTP 200** with an error object inside the result block rather than raising. If you add web search or web fetch later, branch on the result content shape.

---

## Appendix A — Item-writing rulebook

The rules professional item writers work to. Ship them verbatim in the generator prompt (P7) and enforce the mechanical ones in code (§8.1).

**Stem**

1. The stem poses a complete question or problem. It is answerable with the options covered.
2. Include everything needed to answer; exclude everything not needed. No decorative context.
3. Put the question at the end of the stem, not buried in the middle.
4. Avoid "Which of the following statements is true/correct?" — that is a scanning task.
5. Avoid negatives. If unavoidable, capitalise NOT / EXCEPT and cap at 10% of the quiz.
6. No double negatives, ever.
7. No "trick" wording, no deliberately misleading punctuation, no reliance on a single overlooked word.
8. State units, conditions and assumptions explicitly.
9. Do not lift a source sentence verbatim and blank a word. That tests recognition of the text, not of the idea.

**Options**

10. Exactly one defensibly best answer. If a subject expert could argue for two, the item is broken.
11. Homogeneous in content, grammar, tense and length.
12. Longest option ≤ 1.6 × shortest, by word count.
13. Across a quiz, the key is not disproportionately the longest, the most detailed, or the most hedged option.
14. Grammatically consistent with the stem — every option, including a/an and singular/plural agreement.
15. No "All of the above", "None of the above", "Both A and B", "A and C only".
16. No absolutes in distractors ("always", "never", "only", "all", "none").
17. No overlapping ranges (`0–10`, `10–20` — which contains 10?).
18. Ordered logically: numeric ascending, chronological, or alphabetical.
19. Key position balanced across the quiz.
20. No option repeats a distinctive stem word that no other option uses (clang association).
21. No convergence cueing: don't build options from attribute combinations where the key is the most "central" one.
22. Every distractor is wrong for a *specific, statable* reason, and that reason is recorded.

**Cognitive level**

23. At most 30% pure recall, at any difficulty setting.
24. `apply` and above require a situation not literally present in the source.
25. The item must be answerable by someone who understands the material and unanswerable by someone who has merely read it.

**Fairness**

26. No knowledge required beyond the source document.
27. No cultural, regional, or demographic assumptions.
28. No dependence on another item in the same quiz.
29. Plain language; jargon only where the source establishes it.
30. Every item carries a citation to the source span that justifies its key.

---

## Appendix B — Distractor taxonomy

Every distractor names one of these. This is what separates an exam item from a flashcard with padding.

| Type | What it exploits | Where to source it | Example shape |
|---|---|---|---|
| `misconception` | A specific documented wrong belief | `document_map.misconceptions` — the document's own "note that…", "a common error is…" | Doc says heavier objects don't fall faster; distractor says they do |
| `wrong_scope` | Right concept, wrong magnitude / unit / range | `document_map.quantities` — perturb the value, swap the unit, shift the order of magnitude | Key "2.4 kJ/mol"; distractor "2.4 J/mol" |
| `sibling_term` | Confusion between neighbours in a taxonomy | `document_map.concepts` with a shared parent or high `related` weight | Key "mitosis"; distractor "meiosis" |
| `true_but_irrelevant` | Recognition of a true statement without reading the question | Another true `claim` about the same concept | Key answers *why*; distractor states a true *what* |
| `neighbouring_answer` | Answering the adjacent question instead | The key of a nearby blueprint cell | Asks for the cause; distractor gives the effect |
| `partial` | Stopping at the first correct-seeming component | A necessary-but-insufficient element of the key | Key: "increased pressure and reduced volume"; distractor: "increased pressure" |
| `reversal` | Inverted causality or direction | `document_map.relationships` — flip `from`/`to`, or swap `increases`/`decreases` | Key "A causes B"; distractor "B causes A" |
| `overgeneralization` | Dropping the condition on a conditional rule | A `claim` with a `qualifier`, stated without it | Key "in isolated systems, entropy increases"; distractor "entropy always increases" |
| `step_error` | A plausible mis-step in a procedure or calculation | `document_map.procedures` — reorder, skip, or mis-apply one step | Right method, one sign error |
| `outdated_or_superseded` | An older model the document mentions and supersedes | Historical framing in the source | The pre-revision threshold value |

**Composition rule for a 4-option MCQ:** one `misconception` or `overgeneralization` (the strong distractor), one `sibling_term` or `wrong_scope` (the near miss), one `partial` or `true_but_irrelevant` (the plausible filler). Never three fillers.

**Rejection rule:** if the generator cannot name the type and write a specific rationale, the distractor is a filler and the item goes back for repair.

---

## Appendix C — Anti-pattern checklist

Reject on sight. Most of these are what makes AI-generated quizzes recognisable.

**Question anti-patterns**
- [ ] "Which of the following best describes…?" with four paraphrases of the same idea
- [ ] "What is the main purpose of X?" where the source states it in one sentence
- [ ] "All of the above" / "None of the above" in any form
- [ ] Three obviously wrong options and one obviously right one
- [ ] The correct answer is visibly the longest and most qualified
- [ ] The stem is a source sentence with one word removed
- [ ] Two options are synonyms (so both must be wrong — a free elimination)
- [ ] The question tests the *document's* structure, not its content ("What does section 3 discuss?")
- [ ] Trivia: a date, a name or a number with no conceptual weight
- [ ] The answer is in the stem of another question in the same quiz
- [ ] "According to the passage…" — this is reading comprehension, not subject knowledge
- [ ] Absolutes in distractors that make them trivially eliminable

**Summary anti-patterns**
- [ ] "This document discusses…" / "The author explains…" — meta-language instead of content
- [ ] Hedges dropped: "most" → "all", "may" → "will", "approximately 40%" → "40%"
- [ ] A defined term paraphrased into a synonym the student can't find in the PDF
- [ ] Bullets that restate the heading
- [ ] Uniform bullet length regardless of the underlying content's weight
- [ ] Claims with no citation
- [ ] An exhaustive-sounding summary of a partially-read document

**Pipeline anti-patterns**
- [ ] Silent truncation *(this is D1 — the current behaviour)*
- [ ] Silent OCR failure
- [ ] A quiz generated from an extraction the system knows is bad
- [ ] Generating and verifying in the same call
- [ ] One model call producing 20 items
- [ ] Grading with the source document in the grader's context
- [ ] Reporting a score with no per-item record
- [ ] Any user-visible claim about the document that the system cannot cite

---

## Appendix D — Definition of done

A document is processed to spec when:

1. Every page is accounted for, with a per-page method and confidence.
2. `extraction_quality` is computed, stored and shown to the user.
3. Every chunk has a page, a bbox and a section path.
4. A document map exists, and every one of its entries has a verbatim quote that resolves in the cited chunk.
5. The quiz has a stored blueprint, and coverage is reported against it.
6. Every item has passed all 15 deterministic gates and the LLM critic.
7. Every item cites at least one chunk, and every citation quote resolves.
8. Every distractor has a named type and a specific rationale.
9. Short-answer items have a rubric with 3–5 checkable criteria, synonyms and anchors.
10. Nothing shown to the user is unsourced, and nothing the system is unsure about is presented as certain.
