# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Scaffolded, screens not built. Next.js 16.2 (App Router, `src/`) + React 19.2 + Tailwind v4 + shadcn/ui are installed; the feature-first skeleton, providers, and the AI abstraction (`src/services/ai`) exist. The 4 screens, PPTX/PDF services, storage, and Zod schemas are still TODO. The full product spec lives in the original `/init` request and is summarized below.

A personal web app that generates a weekly activity report, replacing manual editing of a PowerPoint. It builds a `.pptx` with `pptxgenjs` that must reproduce an existing template exactly, then converts it to `.pdf` via the LibreOffice CLI.

## Stack (mandatory)

Next.js 16 (App Router) · React 19 · TypeScript · TailwindCSS · shadcn/ui · React Hook Form · Zod · Zustand · TanStack Query (only if needed) · date-fns · pptxgenjs · OpenAI (behind an abstraction) · LibreOffice CLI for PDF.

## Architecture conventions

- **Feature-first** layout: group by feature (e.g. `features/report`, `features/dashboard`), not by technical type at the top level. Within a feature, separate `components/`, `hooks/`, `types/`, `utils/`.
- **AI behind an abstraction**: all AI calls go through `services/ai` exposing a provider-agnostic interface. OpenAI is the first implementation; Claude must be swappable later with no caller changes. Never call the OpenAI SDK directly from components or hooks.
- **PPTX/PDF generation runs server-side only** (Route Handlers / server actions). `pptxgenjs` output and the LibreOffice spawn must not be in client bundles. Keep the OpenAI key server-side.
- Reports persist as **JSON** (history must support reopen / edit / regenerate / export). Treat the report JSON shape as the single source of truth — define it once in Zod and derive TypeScript types from the schema.

## UI / data layer (implemented)
- `src/features/report/api.ts` — typed fetch client, Zod-validates responses; `downloadReport(id, "pptx"|"pdf")` triggers a browser download via an `<a>` (endpoints send attachment headers).
- `src/features/report/hooks/use-reports.ts` — TanStack Query hooks (`useReports`, `useReport`, `useCreateReport`, `useUpdateReport`, `useDeleteReport`) + `reportKeys` for cache invalidation.
- `src/features/dashboard/components/` — `WeekInfoCard` (current ISO week, computed client-side), `ReportList` (loading/error/empty states), `ReportListItem` (view / pptx / pdf / delete-with-confirm-dialog). Dashboard at `src/app/page.tsx`.
- `src/components/` — `SiteHeader` (in `layout.tsx`) + `ThemeToggle` (dark mode via next-themes).
- **Create/edit form** (`src/features/report/components/`): `ReportForm` (RHF + `zodResolver`) composed of `GeneralInfoFields` (+ "Préremplir la semaine"), `DayActionsField` (×5, `useFieldArray` over `days.N.blocks`), `ActionBlockField` (project/module + tasks), `TasksField` (add/remove + per-task & bulk AI rephrase). `ReportCreateView` / `ReportEditView` wrap it and are rendered by `app/reports/new` and `app/reports/[id]`.
- **AI rephrase** wired: `src/features/ai/api.ts` + `hooks/use-rephrase.ts` → `POST /api/ai/rephrase`. The Sparkles button rephrases one task; "Reformuler tout" rephrases a block.

### Form validation pattern (important)
- The form validates against **`reportFormSchema`** (lenient: blank project/module and empty task inputs allowed mid-edit), then `cleanReportFormValues` trims, drops empty tasks, and drops fully-empty blocks, and finally `reportInputSchema.safeParse` is the strict gate before submit (toast on failure). Partially-filled blocks are kept on purpose so the strict parse rejects them.
- `useForm` is typed `useForm<z.input<schema>, unknown, ReportFormValues>` — needed because Zod `.default()` makes resolver **input** fields optional while the **output** (submit values) are required. Reuse this 3-generic pattern for any RHF form over a schema with defaults.
- Lint trap: never name a variable `module` (Next `no-assign-module-variable`) — `useWatch` for a block's module is `moduleName`.

### Base UI component gotchas (carry into the form work)
- Button/triggers have **no `asChild`** — use the Base UI **`render` prop**: `<Button render={<Link href="…" />}>…</Button>`, `<DropdownMenuTrigger render={<Button…/>} />`, `<DialogClose render={<Button…/>} />`.
- Don't use `setState` inside `useEffect` (React 19 `react-hooks/set-state-in-effect` lint errors). For client-only "mounted" gates use `useSyncExternalStore(emptySubscribe, () => true, () => false)` (see `theme-toggle.tsx`).
- `DropdownMenuItem` supports `variant="destructive"`.

## Bonus features (implemented)
- **Templates** (`src/features/templates/`) — project/module presets in a Zustand `persist` store (`weekly-report-templates` in localStorage). `BlockTemplateMenu` (apply/save/delete) lives in each `ActionBlockField`.
- **Drag & drop** (`@dnd-kit`) — reorder action blocks within a day and move them across days. `DayActionsBoard` owns the `DndContext`; `DayColumn` is the droppable (`useFieldArray` with `keyName: "fieldId"` so our domain `id` survives for sortable ids); `SortableBlock` puts drag listeners on a grip handle only (inputs stay usable). Pure move logic in `utils/dnd.ts` (`relocateBlock`). Cross-day moves apply via `form.reset({...getValues(), days})` — `setValue` does **not** reliably refresh nested field arrays.
- **Git import** (`src/features/git/` + `src/services/git/log.ts`) — `POST /api/git/commits` runs read-only `git log` (`execFile`, no shell) over a user-supplied repo path; `ImportCommitsDialog` loads subjects for the week range, lets you select + optionally AI-rephrase them, and inserts them as a new block into a chosen day. Server-only; runs git against an arbitrary local path (acceptable for this personal/local tool).

## API layer (implemented)
Route Handlers under `src/app/api/`, all verified live:
- `GET/POST /api/reports` — list summaries / create (body = `reportInputSchema`).
- `GET/PUT/DELETE /api/reports/[id]` — fetch / update / delete (404 when missing, 204 on delete). Note: route `params` is a `Promise` in Next 16 — always `await params`.
- `GET /api/reports/[id]/pptx` and `/pdf` — generate on demand and stream as attachments (correct MIME + RFC-5987 `Content-Disposition`).
- `POST /api/ai/rephrase` — body = `rephraseRequestSchema` (`src/features/ai/types.ts`, client-safe); returns `{ results: string[] }`; 502 with a clean message when the provider/key is unavailable.
- `POST /api/git/commits` — body = `gitCommitsRequestSchema`; returns `{ commits: string[] }`; 400 on invalid repo path.
- Shared helpers in `src/lib/api.ts`: `parseBody` (Zod, 422 + `z.treeifyError` issues), `jsonError`, `attachment`.

Gotcha: `next build` finalization dies on `SIGPIPE` if you pipe it to `head`/`tail` (leaves `.next` without `prerender-manifest.json` and `next start` then crashes). Redirect build output to a file instead of truncating the pipe.

## PPTX/PDF services (implemented)
Strategy chosen: **template XML injection** (not pptxgenjs — the design lives in the slide master/layout/theme which pptxgenjs can't import). The committed asset `templates/weekly-report.pptx` carries the design; generation rewrites only the text bodies of named shapes.

- `src/services/pptx/` — `generatePptx(report)` → `{ buffer, filename }` (`server-only`). Reads the template with JSZip, regenerates each dynamic shape's `<a:p>` paragraphs and splices them in via `replaceShapeParagraphs` (keeps `<a:bodyPr>`/`<a:lstStyle>` so autofit/anchor/list-styles survive). `build-txbody.ts` holds the exact run/paragraph styles extracted from the template (Consolas; header sz1050 bold white + accent4 "(Semaine N)"; title sz1400; block headers sz1000 bold black with Wingdings "q" square bullet; tasks sz1000 accent5/lumMod with "•"). `xml.ts` = pure DrawingML string builders (escape, run, paragraph, bullets). `template.ts` = `TEMPLATE_PATH`, `SLIDE_ENTRY`, and the `SHAPE` name map. The right column = next-week forecast (free text); its header dates come from `getNextWeekInfo(weekStart)`.
- `src/services/pdf/` — `convertPptxToPdf(buffer)` spawns `soffice --headless --convert-to pdf` in a temp dir with a per-call `UserInstallation` profile (safe under concurrency). Binary overridable via `LIBREOFFICE_BIN`.
- **Editing the styles**: re-inspect a real `.pptx` (unzip → `ppt/slides/slide1.xml`); shape names there must match `SHAPE` in `template.ts`. If you swap the template asset, re-verify those names. Wingdings may render as a literal "q" under headless LibreOffice (font missing) — that's a viewer artifact, the markup matches the template.
- Verified end to end (report → pptx → pdf, XML well-formed, LibreOffice renders the full design).
- **Deploy note**: `templates/weekly-report.pptx` must ship with the server build (it's read from `process.cwd()`), and the host needs LibreOffice installed.

## PPT generation — match the template

Reference templates: `/home/kemogoha/Documents/Rapport d'activités ST2I/` (e.g. `year-Wnum_week_Weekly Report_name.pptx` is the blank template; `2026-W16_*.pptx` is a filled example). Each report is a **single slide**.

Observed text structure (must be reproduced):
- Header: `Actions de la semaine du DD/MM/YYYY au DD/MM/YYYY` with `(Semaine N)`, and a `(Semaine N+1)` block for next week's forecast dates.
- Per-day action blocks formatted as `[PROJET][MODULE] - <Jour>` followed by the task lines. Days: Lundi…Vendredi. Empty day → `Aucune tâche assignée sur la période.`
- Sections: `Non-conformités rencontrées et Prise de décisions` (free text, `RAS` when empty); `Département : …`; `Intervenant(s) : …`; `Comité Direction : DD/MM/YYYY`.

To inspect the exact layout/positioning, unzip a `.pptx` and read `ppt/slides/slide1.xml`:
```bash
unzip -o "<file>.pptx" -d /tmp/pptx && grep -o '<a:t>[^<]*</a:t>' /tmp/pptx/ppt/slides/slide1.xml
```

### Output filename
The example files on disk use a `_week_` infix:
`AAAA-WXX_week_Weekly Report_Prenom NOM.pptx` (e.g. `2026-W16_week_Weekly Report_Abdoulaye COULIBALY.pptx`).
The spec text omits `_week_`. Match the existing files unless told otherwise.

### PDF conversion
LibreOffice is installed (`/usr/bin/soffice`, `/usr/bin/libreoffice`). Convert headless:
```bash
soffice --headless --convert-to pdf --outdir <dir> <file>.pptx
```
Spawn this from the server after writing the pptx. It needs a writable working dir and no display.

## Week math
ISO week number, Monday and Friday of the current week, and the "Préremplir la semaine" action (auto-create Lundi…Vendredi) are core. Use `date-fns` ISO helpers; do not hand-roll week arithmetic.

## Commands
- `npm run dev` — dev server (Webpack; scaffolded with `--no-turbopack`).
- `npm run build` / `npm start` — production build / serve.
- `npm run lint` — ESLint (`eslint-config-next`).
- `npx tsc --noEmit` — typecheck (no dedicated script).
- Add shadcn components: `npx shadcn@latest add <name>` (Node 22, npm 10).

## shadcn / UI notes
This project uses the shadcn **Base UI** registry, not Radix — primitives come from `@base-ui/react`; icons come from `lucide-react`. The registry's `form` component fails to install non-interactively against this variant, so `src/components/ui/form.tsx` is a hand-written, Base-UI-compatible version (`FormControl` clones props onto its child instead of using a Slot). Match these when adding UI.

## Current scaffold layout
- `src/features/{dashboard,report,ai}/{components,hooks,types,utils}` — feature code.
- `src/services/{ai,pptx,pdf,storage}` — `ai` done (provider interface, `OpenAiProvider`, `getAiProvider()` factory gated by `AI_PROVIDER` env, `server-only`). `storage` done: filesystem JSON store at `data/reports/<id>.json` (gitignored), CRUD in `report-store.ts`, validates via Zod on read/write, `server-only`. `pptx`/`pdf` still empty.
- `src/features/report/types/report.schema.ts` — the Zod source of truth (`reportSchema`, `reportInputSchema`, `reportSummarySchema`); all report types derive from it. `src/features/report/utils/report-factory.ts` — `createEmptyReport()` / `emptyWeekDays()` back the create screen and "Préremplir la semaine".
- `src/lib/week.ts` — ISO week helpers (`getWeekInfo`, `getNextWeekInfo`, `formatWeekId` → "YYYY-WXX", `formatWeekRange`). Use these; don't hand-roll week math.
- `src/providers/` — `Providers` wraps `ThemeProvider` (next-themes) + `QueryProvider` (TanStack); wired in `app/layout.tsx` with `<Toaster>`.
- Env: copy `.env.example` → `.env.local`; `OPENAI_API_KEY` is server-only.

## Scope notes
Bonus features in spec (lower priority): Git commit import (`git log` → AI rewrite), drag & drop tasks between days, reusable project templates, dark mode, responsive. The non-negotiables are the 4 screens (Dashboard, Create, AI rephrase, PPT/PDF generation), exact template fidelity, and the AI abstraction layer.
