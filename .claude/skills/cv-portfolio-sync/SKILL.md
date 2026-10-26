---
name: cv-portfolio-sync
description: >-
  Keeps the CV (the `cv` step of index.html and its PDF print) consistent with
  the portfolio carousels. Use whenever the CV is edited, a project is added to
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

## Where things live

- **CV**: `#cv` in `index.html` (`.cv_sheet`): `.job` articles under
  _Expérience_ and _Projets personnels_, side tags, _Parcours_.
  `assets/pdf/CV_Valentin_Machado.pdf` is its print.
- **Portfolio**: two carousels in `index.html`, each item backed by a
  `<id>_preview_content` (name, one-line pitch, dates) and a `<id>_step`
  detail page; ids listed in `detailStepIds` (`src/globalParameters.js`).
  - `#projects` (« Réalisations professionnelles »): work done as an
    employee, freelance or founder.
  - `#about` (« Créations personnelles »): personal projects and hobbies.

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
5. **Report** a table in chat: CV entry → portfolio location → status
   (covered / missing / mismatch), then the soft checks.

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

- **CV touched**: regenerate the PDF (command in `docs/DEPLOY.md`, « Le CV »)
  and check it is still **one page**.
- **Portfolio touched**: follow CLAUDE.md (`npm test`, `npm run lint`,
  `npm run build` when `src/` changed, browser check of the new carousel
  item and detail page).
- Rerun the audit until every CV entry is covered.
