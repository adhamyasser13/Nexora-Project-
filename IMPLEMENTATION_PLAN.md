# CareerX — Implementation Plan

Oct 18, 2026 · @Adham

This plan turns the Project Spec and PRD into a build sequence. Scope of v1: Front End only (HTML, CSS, JS, React). Backend is optional bonus.

---

## 1. Goal of v1

A student can complete this path without errors, twice before the demo:

Landing → Discover track (or pick from list) → Result → Roadmap → Stage → Video → Quiz → Next stage unlocks → Dashboard

**Must ship:** FR-1 through FR-9, 8 tracks, responsive UI, loading / error / empty states.

**Do not cut:** those 9 features or UI quality.

**Cut last if time is short:** (1) nice-to-haves, (2) lighter-track quizzes down to 2 questions, (3) lighter tracks from 4 stages to 3.

---

## 2. Decisions to lock before coding (Day 1–2)

Do not start collecting content or building pages until these are fixed. Changing them later breaks everyone’s work.

| Decision | Proposed default | Owner |
| --- | --- | --- |
| JSON schema | Spec shape (`id`, `stages`, `videos`, `quiz`, `project`) | Whole team |
| Tooling | Vite + React Router + Context/`useReducer` + CSS Modules | Whole team |
| UI language | English | Whole team |
| Storage | LocalStorage behind `api.js` | Adham |
| Quiz gate | Quiz available only after all stage videos are completed | Adham (open in PRD) |
| Track ownership | Spec table | Confirm in first meeting |
| Figma owner | TBD | First meeting |
| Delivery deadline | TBD | Adham |

---

## 3. Repo and app skeleton

```
careerx/
  public/
  src/
    api/
      api.js                 # only data access layer
    context/
      ProgressContext.jsx    # unlock + progress + quiz results
    data/
      tracks/
        frontend.json
        software-engineering.json
        backend.json
        data-analysis.json
        ui-ux.json
        mobile-flutter.json
        cybersecurity.json
        networking.json
      discovery.json         # 8–10 questions + scoring
    components/              # shared: Button, Card, ProgressBar, ...
    pages/
      LandingPage/
      TracksPage/
      DiscoveryPage/
      DiscoveryResultPage/
      RoadmapPage/
      StagePage/
      QuizPage/
      DashboardPage/
    styles/                  # tokens / CSS variables from Figma
    App.jsx
    main.jsx
  IMPLEMENTATION_PLAN.md
```

**Rules**

- UI never reads JSON or LocalStorage directly. Always `api.js`.
- One UI for all tracks. Adding a track is a JSON file, not a new page.
- Git: one branch per feature, PR, second-person review before merge.

---

## 4. Phases

### Phase 0 — Kickoff (Days 1–2)

- Confirm 8 tracks and owners.
- Freeze JSON schema and tooling.
- Create repo, branch rules, PR rules.
- Scaffold Vite + React + React Router.
- Build shared primitives: `Button`, `Card`, `ProgressBar`, layout shell.
- Implement `api.js` stubs: `getTracks()`, `getTrack(id)`, `getProgress()`, `saveProgress()`, `getDiscoveryQuestions()`.
- Implement `ProgressContext` + `useReducer`: stage lock/unlock, video complete, quiz pass/fail, persist via `api.js`.
- Start Figma in parallel (max 5 days for all screens). Code does not wait for pixel-perfect Figma; it waits for tokens (colors, type, spacing) as soon as they exist.

**Exit:** app boots, routes exist as empty pages, progress saves and reloads.

---

### Phase 1 — Design system + landing (Days 2–5)

**FR-1 Landing Page**

- One screen: problem, promise, tagline.
- CTA: Browse tracks, Take discovery quiz.
- Responsive desktop + mobile.

**Design**

- Mood board from the 60–90 min design meeting.
- Tokens in CSS (colors, fonts, radii, spacing).
- Shared components match Figma.

**Exit:** landing is demo-ready on mobile and desktop.

---

### Phase 2 — Content pipeline (starts Day 2, runs in parallel)

Each owner fills their JSON using the frozen schema.

| Track | Depth | Owner | Reviewer |
| --- | --- | --- | --- |
| Frontend Development | 6–8 stages | Adham | Other teammate |
| Software Engineering | 6–8 stages | Adham | Other teammate + external |
| Backend Development | 6–8 stages | Menna | Other teammate + external |
| Data Analysis | 4 stages | Menna | Other teammate + external |
| UI/UX Design | 4 stages | Nada | Other teammate |
| Mobile (Flutter) | 4 stages | Nada | Other teammate |
| Cybersecurity | 4 stages | Shedid | Other teammate + external |
| Networking | 4 stages | Seif | Other teammate + external |

Per stage:

- 1 clear goal (“what the student can do after”).
- 2–4 videos **or** 1 playlist, ~6 hours max.
- Video: last 3 years when the topic changes, level-fit, practical, free, embed allowed, language tagged `ar` | `en`.
- Two candidates per slot; reviewer picks one.
- Quiz: 3–5 MCQs (4 options, one correct), `passingScore: 70`, each question has `videoRef` + `explanation`. AI-generated, owner-reviewed.
- Project: title + description only (no upload in v1).

**Discovery file:** 8–10 questions; each option scores one or more tracks.

**Mandatory last check:** every YouTube id plays as embed, is not private/deleted.

**Exit:** 3 full tracks high quality; 5 lighter tracks at 4 stages (or 3 if time-cut).

---

### Phase 3 — Catalog + discovery (Days 4–8)

**FR-2 Tracks list**

- Render 8 tracks from JSON: title, description, level, stage count.
- Show progress if the student already started.
- Click → roadmap.

**FR-3 Discovery**

- 8–10 questions, one at a time.
- Score from `discovery.json`.
- Result: top 2 or 3 tracks with percentages.
- Student picks; they are not auto-enrolled.
- Retake allowed.

**FR-9** on both pages: loading, error, empty.

**Exit:** student can choose a track from the list or from discovery and land on a roadmap route.

---

### Phase 4 — Learning loop (Days 6–12) — core product

**FR-4 Roadmap**

- Stages in `order`.
- Stage 1 unlocked; later stages locked until previous is complete.
- Each stage: goal, estimated hours, status (locked / in progress / completed).

**FR-5 Stage**

- YouTube embeds in order.
- Language badge per video.
- Mark complete automatically on video end (YouTube IFrame API).
- Player error state if embed fails.

**FR-6 Quiz**

- 3–5 questions, one correct option.
- Pass ≥ 70% completes the stage and unlocks the next.
- Fail shows score, allows unlimited retake.
- Explanations after submit.

**FR-8 Persistence**

- Video completions, quiz scores, unlocked stages survive refresh.

**Exit:** full learning loop works on at least one real track (Frontend).

---

### Phase 5 — Dashboard + polish (Days 10–14)

**FR-7 Dashboard**

- For every started track: % complete (completed stages / total), current stage, quiz results.
- Continue CTA to last incomplete stage.

**FR-9 everywhere**

- Loading / error / empty on every data page.
- Responsive pass.
- Keyboard-usable shared controls, sufficient contrast.

**Nice-to-have only after Must is stable**

- Name-only “login”
- Project URL field
- Dark mode
- Search

**Exit:** demo journey works end-to-end on all 8 tracks.

---

### Phase 6 — Freeze, QA, demo (last 3–4 days)

**Feature freeze.** After this: bugfix, content link check, demo rehearsal only.

QA checklist:

- [ ] Full journey twice, no errors
- [ ] Unlock rules: cannot skip stages
- [ ] Quiz pass/fail/retake
- [ ] Progress survives reload
- [ ] All video embeds checked by hand
- [ ] Mobile + desktop
- [ ] Loading / error / empty
- [ ] Three full tracks look demo-grade

Demo script follows the same 9-step journey.

---

## 5. Feature ownership (code)

Suggested split so each person owns a vertical (page + related track content):

| Person | Features | Track content |
| --- | --- | --- |
| Adham | Scaffold, `api.js`, ProgressContext, Stage + YouTube, shared components | Frontend, Software Engineering |
| Menna | Tracks list, Roadmap | Backend, Data Analysis |
| Nada | Landing, Dashboard, Figma pages (if assigned) | UI/UX, Mobile |
| Shedid | Discovery + result | Cybersecurity + UI review |
| Seif | Quiz page | Networking + UI review |

Adjust after the first meeting. Adham has final call on disagreements.

---

## 6. State model (progress)

Stored in LocalStorage, keyed per browser. Shape is owned by `api.js`.

```json
{
  "tracks": {
    "frontend": {
      "currentStageId": "html-css",
      "completedStageIds": [],
      "stages": {
        "html-css": {
          "completedVideoIds": ["abc123"],
          "quiz": { "bestScore": 80, "passed": true, "attempts": 2 }
        }
      }
    }
  }
}
```

**Unlock rule:** stage `n` unlocks when stage `n-1` is complete.

**Stage complete:** all videos marked complete **and** quiz passed (≥ 70%).  
(If the team decides quiz is always open, still require a passing quiz to complete the stage.)

---

## 7. Routing

| Path | Page |
| --- | --- |
| `/` | Landing |
| `/tracks` | Track list |
| `/discover` | Discovery questions |
| `/discover/result` | Top 2–3 tracks |
| `/tracks/:trackId` | Roadmap |
| `/tracks/:trackId/stages/:stageId` | Stage + videos |
| `/tracks/:trackId/stages/:stageId/quiz` | Quiz |
| `/dashboard` | Dashboard |

---

## 8. Risks (build order already mitigates them)

| Risk | Mitigation in this plan |
| --- | --- |
| Too much content | Data-driven UI; 3 deep + 5 light; cut order frozen |
| JSON changes mid-build | Freeze schema Days 1–2 |
| Inconsistent UI | Shared components + tokens first |
| Bad / dead videos | Dual candidates + manual embed check in Phase 6 |
| Weak quizzes | `videoRef` + owner review |
| LocalStorage-only progress | Accepted for v1; backend is bonus |

---

## 9. Open questions (do not block Phase 0)

- Actual delivery deadline and week-by-week calendar (Adham).
- Who designs in Figma (one person vs Design System + pages).
- Named external reviewers for SE, Backend, Data, Cyber, Networking.
- Quiz locked until videos complete vs always available.
- Confirm track assignment table.

---

## 10. Definition of done

v1 is done when:

1. FR-1 … FR-9 pass their PRD acceptance criteria.
2. The 9-step student journey works twice with no errors.
3. Eight tracks are in the app; three full tracks are demo-grade.
4. Every video link was checked by hand.
5. UI is English, responsive, and uses course-required React stack.
6. Feature freeze held for the last 3–4 days.
