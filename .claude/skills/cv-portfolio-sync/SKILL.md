---
name: cv-portfolio-sync
description: >-
  Keeps the CV (the `cv` step of index.html and en/index.html, and their PDF
  prints) consistent with the portfolio carousels of the same language. Use whenever the CV is edited, a project is added to
  or changed in the portfolio, or the user asks to check, align or "raccorder"
  the CV and the portfolio. Rule: everything on the CV must be on the
  portfolio; the portfolio may hold more than the CV.
---

# CV ↔ portfolio sync

The CV must fit on one A4 page, so it is a **selection** of the portfolio,
never the other way round:

- **Everything the CV names must exist on the portfolio**: each experience,
  project, product and claim it makes, with the same name, dates and link.
- **The portfolio may hold more**: a project absent from the CV is fine and is
  never reported as a gap.

## Two languages

The site has two hand-written pages with the same structure: `index.html`
(French) and `en/index.html` (English, British spelling). Each page holds its
own CV and its own portfolio, so the audit runs **once per language**: the
French CV against the French page, the English CV against the English page.
On top of that, the two CVs must say the same thing (same entries, dates,
links), the English one being a translation; `tests/parity.test.js` already
checks they share their structure. A change to one CV is carried to the
other, translated, unless the user says otherwise.

## Where things live

- **CV**: `#cv` in each page (`.cv_sheet`): `.job` articles under
  _Expérience_ / _Experience_ and _Projets personnels_ / _Personal projects_,
  side tags, _Parcours_ / _Education_. Its print is
  `assets/pdf/CV_Valentin_Machado.pdf` (French) or
  `assets/pdf/CV_Valentin_Machado_EN.pdf` (English); its
  `valentinmachado.github.io` link points at the page of its language.
- **Portfolio**: two carousels in each page, each item backed by a
  `<id>_preview_content` (name, one-line pitch, dates) and a `<id>_step`
  detail page; ids listed in `detailStepIds` (`src/globalParameters.js`).
  - `#projects` (« Réalisations professionnelles »): work done as an
    employee, freelance or founder.
  - `#about` (« Créations personnelles »): personal projects and hobbies.
  A new portfolio page is written in both pages (ARCHITECTURE.md, « Deux
  langues, deux pages »).

## The audit

1. **List every CV entry**: each `.job` and each `<li>`/`<b>` naming a
   project, product or contribution (e.g. ud-viz, iTowns, Popup Builder,
   NodaLab, Subtitle Game, Guess It).
2. **Map it to the portfolio**. An entry is covered when:
   - a project or product has its own carousel item and detail step, or
   - a sub-claim (a contribution, a library, a publication) is stated in the
     detail step of a covering project (ud-viz and iTowns live in
     `open_source_contributions_step`, the article in `ud_imuv_step`).
3. **Compare the details**: name spelling, dates (preview `<p>` vs CV
   `.dates`), URLs, role. A mismatch is a gap too.
4. **Soft checks**, reported but not blocking: a side tag (three.js, ffmpeg,
   Godot…) that no portfolio page shows in use; a job with no project of its
   own on the portfolio (e.g. Freelance, beyond Souk and Covidjam).
5. **Compare the two CVs**: every entry, date and link of one is in the
   other. A difference is a gap.
6. **Report** a table in chat per language: CV entry → portfolio location →
   status (covered / missing / mismatch), then the differences between the
   two CVs, then the soft checks.

## Closing a gap

- **Fix it on the portfolio side.** Never drop a CV entry to make the audit
  pass unless the user asks.
- **Ask the user before writing** a new portfolio page: its carousel
  (professional or personal), its text, its media and its 3D model. Draft the
  text from the CV and the project's public page, but do not invent facts,
  figures or dates.
- Add the project with « Ajouter un projet à un carrousel » in
  `docs/ARCHITECTURE.md` (5 places sharing one id, plus `itemIds` and
  `carouselModels`). Images are needed in
  `assets/img/carousel/<carousel>/<id>.png`: ask for them if they are missing.
- For a mismatch, settle with the user which side holds the truth, then
  align the other one.

## After a change

- **CV touched**: regenerate the PDF of each CV that changed (commands in
  `docs/DEPLOY.md`, « Le CV ») and check each is still **one page**.
- **Portfolio touched**: follow CLAUDE.md (`npm test`, `npm run lint`,
  `npm run build` when `src/` changed, browser check of the new carousel
  item and detail page).
- Rerun the audit until every CV entry is covered.
