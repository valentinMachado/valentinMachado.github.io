---
name: phased-delivery
description: >-
  How a long task is delivered in this repository: one phase per session,
  carried to the commit, then a hand-off prompt for a fresh session. Use
  whenever a task has phases (a phased plan in a backlog file, a feature too large
  for one sitting, a run of backlog items), when a phase has just been
  implemented and checked, or when the user says "commit", "on valide", "phase
  suivante" or asks what is left. The user must never have to remind you of any
  step below.
---

# Phased delivery

A task too large for one session is cut into phases. Each session delivers
**one** phase, all the way to the commit, and ends by handing the user a prompt
that a cold session can start from. The user asked for this loop and should not
have to ask for any step of it again.

## The loop

1. **Name the phases.** At the start, list them briefly in chat. When the user
   asked for a written plan, it lives in a backlog file under `management/`
   (gitignored, e.g. `management/backlog.md`), never in a tracked plan file.
   **A plan the user details, write down as soon as it outgrows a hand-off
   prompt**: their own words and every decision, the asides they add mid-phase
   ("and also…") included, go into a section of its own in that backlog file, kept up
   to date as decisions land. A design too long for that section gets a file
   of its own beside it in `management/`, which the section points at.
   The hand-off prompt then points at that section
   rather than summarising it: a summary loses the grain, and a cold session
   only knows what was written.
   **Estimate the model every phase needs**, each time a track is planned,
   and write it in every phase heading of the plan (`### P1. … (Fable)`,
   `### P2. … (Sonnet)`, `### P3. … (Opus)`), with the reason in a few words
   when it is not Opus. Sonnet for a phase that is mechanical or follows a
   pattern already in the code (a rule applied to more places, a sibling
   copied, docs brought up to date); Opus by default; Fable for a phase that
   needs a design nobody has written yet or reasoning across many parts. The
   hand-off prompt names the model of the next phase and of each one after
   it.
2. **Do the current phase only.** Do not start the next one, even if it looks
   small. A run of backlog items counts too: after two or three committed items,
   when the next one is heavier, propose switching sessions yourself.
3. **Finish it.** Following CLAUDE.md: `npm test`, `npm run lint` and
   `npm run format:check` clean; `npm run build` if `src/` was touched (the
   committed `dist/` must match, never copied from `dist-dev/`); docs
   (`docs/ARCHITECTURE.md`, `README.md`) brought up to date. Any change of
   behaviour is checked in a real browser with the scenario of CLAUDE.md's
   _Vérification navigateur_. Say what was not verified in a browser.
4. **Ask for validation, then commit when the user says so.** Present what
   shipped and what was not verified; when the user validates ("commit", "ok",
   "valide"), stage files explicitly and commit on `master`, one commit per
   type of change (Conventional Commits). Never push without explicit
   agreement. A validation asked for up front ("on valide avec commit") counts
   once the checks are green.
5. **Clean the backlog.** The delivered item leaves its backlog file and the
   phase leaves the plan: deleted, never ticked. Update CLAUDE.md or
   `docs/ARCHITECTURE.md` if the phase changed what they say.
6. **Hand off.** End the session's last message with the prompt for the next
   phase, unprompted.

## A management session

Some sessions write no code: the user calls them **management sessions**. You
discuss the architecture (how a feature will work), the plan or the backlog,
and settle them together. Such a session is a phase of its own, and its
deliverable is what was settled, written down — not code:

- Read the code it bears on (delegate wide searches) and write the design or
  the plan in `management/` (a file of its own for a long design), with the user's
  decisions in their words, the options weighed, and what is left to decide.
- **No code, no test run, no commit**: `management/` is gitignored, so steps
  3 to 5 of the loop do not apply. Only a tracked file the discussion changed
  (CLAUDE.md, `docs/`, this skill) is committed, when the user says so.
- Open questions are asked as they come; the session ends when the user
  validates the design, or says what is still to settle.
- It still hands off: the prompt names the next session — another round of
  management if questions remain, else the first implementation phase and
  its model.

## The hand-off prompt

A fenced block the user pastes into a new session. The model is picked
before the session starts, so the prompt cannot pick it: **the line just
above the block names the model to open the next session with** (« Session
suivante : Opus »), and the block's first line says it again. The block
must stand alone:

- the goal of the whole task in one or two sentences;
- what earlier phases shipped, with the commit hashes;
- **no list of decisions.** A decision taken with the user is written where it
  belongs the moment it is taken: the plan's section in the backlog file for a
  decision about the task, CLAUDE.md for a rule of how the work is done,
  the JSDoc or `docs/ARCHITECTURE.md` for one about the code. The prompt
  points at those places; a decision found only in the previous prompt is
  written down before handing off, then dropped from it;
- the next phase, its steps and where it lands, pointing at the plan in the
  backlog file rather than copying it when the plan is written there (and it
  should be, once it is detailed: see step 1);
- the model the next phase needs (Sonnet, Opus or Fable), and why when it is
  not Opus;
- the phases after it, one line each, each with its model;
- the instruction to follow this skill (`phased-delivery`) for that phase.

Write it in the language the user writes to you in.
