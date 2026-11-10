# Techie Teacher's Tribe Trust — End-to-End Interactivity, Cloud Persistence & RBAC Overhaul

An exhaustive platform audit and upgrade that replaces every static stub, browser prompt, hardcoded metric, and disconnected handler across the website with real Firestore-backed operations, downloadable study packs and invoices, interactive live classrooms, and strict role-based permissions for students, verified faculty, and Trust admins.

## User Review & Critical Decisions

> [!IMPORTANT]
> All core architectural choices from our alignment session are locked in below. Review before clicking **Proceed** so implementation preserves your exact preferences.

- **Confirmed Decision 1 — Full Cloud Firestore Sync**: Beyond existing user, teacher, course, order, and verification request collections, **Daily News**, **Course Reviews**, **Contact / SOS Queries**, **Site Content (CMS)**, **Live Class Sessions**, and **Student Profile Goals & Weekly Study Logs** will all persist and synchronize live via Cloud Firestore with schema-validated security rules.
- **Confirmed Decision 2 — Real File Downloads & Interactive Module Tracking**: Clicking **PDF / Notes Download** or **Download Invoice** will generate and save real client-side downloadable files (course study packs formatted from syllabus/notes content, uploaded notes files, and official GST-ready receipts), while the Study Reader tracks per-module completion checkboxes and computes true course completion percentages dynamically.
- **Confirmed Decision 3 — In-App Toasts & Interactive Confirmation Modals**: Every legacy browser `confirm()` and `alert()` call across admin deletions, teacher catalog actions, CMS resets, and news management will be replaced with an accessible in-app **Confirmation Modal** (supporting keyboard `Escape` and loading spinners) and **Toast Feedback System** (success, warning, and error states).
- **Confirmed Decision 4 — Interactive Live Classroom & Schedule Sync**: Hardcoded live session cards on the Student Dashboard will be backed by a Firestore **Live Sessions** collection manageable by verified faculty and admins; students clicking **Join Live Classroom** open an interactive **Live Classroom Modal** with session agenda, external meeting room launch link, live check-in attendance toggle, and study-hour auto-logging.
- **Recommended Default — Role-Based Course Ownership**: Teachers in the Faculty Command Suite can edit, toggle live status, and delete **their own uploaded courses** (enforced both in the UI and Firestore security rules), while Super Admins retain full platform-wide moderation across all listings.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the entire Techie Teacher's Tribe Trust web application into a cohesive, zero-stub educational platform where every button, link, form, filter, modal, download, notification bell, profile editor, and admin tool performs a genuine, feedback-driven action backed by Firebase Auth and Cloud Firestore.
- **Target Audience & Personas**:
  - **Students / Visitors**: Browse verified teachers and approved courses, filter/sort dynamically, apply synchronized collab promo codes at checkout, study module-by-module in an interactive reader, download study packs and receipts, log study hours, manage profile/SGPA targets, submit verified-graduate reviews, and join live classrooms.
  - **Verified Teachers (Faculty)**: Authenticate via Firebase Email/Password or Google (gated by Admin email verification), publish/edit/delete their own courses with custom syllabus builders and note attachments, publish/edit Daily News bulletins, and schedule Live Class sessions.
  - **Trust Super Admin**: Manage faculty verification requests, verified teacher public profiles, student SOS queries, platform-wide courses, breaking news, live sessions, and full Site Content CMS copy with one-click cloud seeding and live sync.
- **Key Value**: Eliminates dead UI affordances, hardcoded vanity stats, and role leaks—delivering predictable loading states, offline/permission-denied resilience, and comfortable mobile tap targets across every screen.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Public Discovery & Navigation**: Visitors navigate seamlessly via a crisp sticky header with active **Notifications Popover** (displaying Breaking Exam Alerts, pending teacher/account notices, and quick navigation actions), mobile drawer with $\ge 44\text{px}$ tap targets, and a Footer where **Terms of Trust**, **Student Code of Ethics**, **Refund Policy**, **Phone (`tel:`)**, **Email (`mailto:`)**, and **Telegram Community** all open real modals or valid actions.
  2. **Course & Teacher Exploration**: Home, Courses, Quick Learning, Team, and Verified Teachers pages show only **Admin-approved** courses publicly; Team faculty cards deep-link into either the corresponding Verified Teacher Profile detail view or pre-filtered Catalog search; users can share course links (`Copy Link` / `navigator.share`), filter, sort, and reset filters cleanly.
  3. **Cart & Razorpay Checkout**: Coupon codes (`TRIBE10`, `TRIBE100`, `EXAMREADY`, `BLINKTRIBE`, `ZEPTOTRIBE`) work consistently across Collabs promo copy buttons and Cart checkout; checkout validates required payment fields (UPI ID format, card digits/expiry/CVV, or selected bank), disables double-clicks during processing, resets cleanly on reopen, writes orders and enrollments to Firestore, and shows a downloadable invoice receipt.
  4. **Student Study Workspace**: Dynamic KPIs calculate real average completion, active track count, editable **Target SGPA & Profile Settings**, editable **Mon–Sun Study Hours Tracker**, interactive **Module-by-Module Study Reader** (marking modules complete recalculates `%` in real time), real `.html` / `.txt` study-booklet download, **Live Classroom Modal**, and completed-course verified reviews.
  5. **Faculty & Admin Portals**: Strict role separation hides admin/teacher management buttons from students. Destructive operations (delete course, delete news, delete query, delete teacher request, reset CMS defaults) trigger a dedicated **Confirmation Modal** with spinner state until Firestore confirms.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Retains the signature high-contrast monochrome editorial brutalist academic aesthetic—crisp pure black canvas (`#000000`), elevated slate-black cards (`bg-zinc-950`), sharp zero-radius/minimal-radius `2px` white structural borders, and stark inverted white-on-black primary CTAs with crisp offset shadows.
  - *Color Palette & Semantic Clarity*: 60% obsidian canvas (`#000000`), 30% elevated zinc surfaces (`#09090B` / `#18181B`), 10% pure white primary ink and functional accents. Semantic status (Verified, Pending, Error/Breaking, Live Session) pairs accessible color contrast (emerald, amber, red) with explicit uppercase text labels and crisp icons—never hue alone.
  - *Typography & Tabular Discipline*: Uses `Space Grotesk` for tight architectural headings, `Plus Jakarta Sans` for readable prose, and `JetBrains Mono` with `tabular-nums` (`font-mono-numbers`) for prices, countdowns, ratings, course codes, and analytics charts.
  - *Spatial & Mobile Touch Standards*: Enforces comfortable $\ge 44\text{px}$ interactive button/icon targets on mobile viewports, non-wrapping single-line header navigation controls with responsive drawer overflow, accessible `focus-visible` outlines, and modal `Escape`-key dismissal.

- **Interactive Feedback & Resilience**:
  - Every async submission (`Contact SOS Form`, `Auth Forms`, `Course Save/Delete`, `CMS Save`, `Query Status Update`, `Review Submit`) shows inline loading indicators, disables repeat clicks while running, displays clear success or actionable error toast banners, and degrades gracefully if offline or lacking permissions.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Client-Generated Print-Ready Study Packs & Uploaded File Support**
  - *Chosen Approach*: Generate clean, formatted study booklets (`.html` printable / `.txt` study sheet downloads) directly from each course's syllabus, learning outcomes, and attached instructor notes, while supporting genuine file selection (`<input type="file">`) or external resource URLs for teacher uploads.
  - *Why*: Eliminates broken dummy filenames and guarantees every "Download Notes" and "Download Invoice" button immediately downloads a usable document in any browser without requiring external paid storage buckets.
  - *Alternatives Considered*: Requiring Firebase Storage billing setup for binary PDFs, which would block local/unconfigured deployments.

- **Decision 2 — Hybrid Cloud Firestore Sync + Instant Local Reactivity**
  - *Chosen Approach*: Store all operational collections (`courses`, `verifiedTeachers`, `teacherAccessRequests`, `orders`, `users`, `news`, `reviews`, `queries`, `liveSessions`, `siteContent`) in Firestore with real-time `onSnapshot` listeners, maintaining safe fallback defaults only when a cloud collection has not yet been seeded by Admin.
  - *Why*: Prevents empty screens on first boot while ensuring Admin's "Sync All Data to Cloud" seeds the entire database cleanly and all live updates propagate across sessions and roles.
  - *Alternatives Considered*: Deleting all initial seed catalogs completely before cloud seeding, which would greet first-time visitors with blank pages.

- **Decision 3 — Strict RBAC UI + Server-Enforced `firestore.rules`**
  - *Chosen Approach*: Align client visibility strictly with verified security rules—only Admins can read/moderate PII-containing `queries` and `verifiedTeachers` whitelists or edit global `siteContent`; verified teachers can create/edit/delete only courses tagged with their `teacherUid` plus manage news & live classes; students can update only their own `users/{uid}` study progress, study hours, and profile goals, and submit validated orders/reviews/queries.
  - *Why*: Satisfies PII isolation and ownership invariants so tampered client requests are rejected at the Firestore layer as well as hidden in the UI.
  - *Alternatives Considered*: Client-only route hiding with permissive database rules, which leaves data exposed to direct SDK queries.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                     CLOUD FIRESTORE & FIREBASE AUTH                        │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐ ┌─────────────────┐  │
│  │ Auth Session │ │ Core Catalog │ │ User Workspace │ │ Operations/CMS  │  │
│  │ · Email/Pass │ │ · courses    │ │ · users/{uid}  │ │ · queries (PII) │  │
│  │ · Google SSO │ │ · teachers   │ │ · orders       │ │ · news          │  │
│  │ · Email Ver. │ │ · reviews    │ │ · studyHours   │ │ · liveSessions  │  │
│  └──────┬───────┘ └──────┬───────┘ │ · targetSgpa   │ │ · siteContent   │  │
│         │                │         └───────┬────────┘ └────────┬────────┘  │
└─────────┼────────────────┼─────────────────┼───────────────────┼───────────┘
          │                │                 │                   │
          ▼                ▼                 ▼                   ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                  REAL-TIME SYNC ENGINE & FILE EXPORT UTILITIES             │
│  · Typed Firestore subscriptions + schema-bounded sanitization/mutations   │
│  · Error boundary wrapper (`handleFirestoreError`) + actionable toast bus  │
│  · Client Blob generators (Printable Course Study Pack + Official Invoice) │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌───────────────────┐     ┌───────────────────────┐   ┌──────────────────────┐
│ GLOBAL CHROME     │     │ PUBLIC DISCOVERY      │   │ ROLE-GATED PORTALS   │
│ · Header + Cart   │     │ · Home + News Modal   │   │ · Student Dashboard  │
│ · Notifications   │     │ · Courses (Filter/    │   │   + Study Reader     │
│   Popover         │     │   Sort/Share/Details) │   │   + Profile/StudyLog │
│ · Footer + Legal  │     │ · Quick Learning SOS  │   │   + Live Classroom   │
│   Policy Modals   │     │ · Verified Teachers   │   │ · Teacher Portal     │
│ · ConfirmModal    │     │   + Team Deep-Links   │   │   (Own Courses/News/ │
│   & Toast Stack   │     │ · Contact SOS Form    │   │    Live Classes)     │
│                   │     │ · Collabs & Cart/Pay  │   │ · Admin Suite        │
└───────────────────┘     └───────────────────────┘   │   (CMS/All CRUD/Sync)│
                                                      └──────────────────────┘
```

### Data Model & State

- **Expanded Entities**:
  - `UserAccount`: `uid`, `name`, `email`, `college`, `semester`, `department`, `targetSgpa` (`number`), `weeklyStudyHours` (bounded 7-day map/array Mon–Sun), `enrolledCourses` (including `completedModules` array, `lastAccessedModule`, `progressPercent`, `notesDownloaded`), timestamps.
  - `CourseRecord`: Adds strict `teacherUid` ownership alongside `teacherEmail`, structured `syllabus` modules with topics/durations, optional notes resource/attachment metadata (`notesContent` / `pdfNotesUrl`), and `isApproved` publication state.
  - `DailyNewsItem`: `id`, `title`, `category`, `summary`, `content`, `date`, `readTime`, `author`, `authorRole`, `authorUid`, `isBreaking`, `isPinned`, `tags`, timestamps.
  - `CourseReview`: `id`, `courseId`, `studentId`, `studentName`, `studentCollege`, `studentBranch`, `rating`, `comment`, `gradeReceived`, `examType`, `createdAt`, `verifiedCompletion`, `helpfulCount`, `helpfulVoterIds` (bounded/deduped vote guard).
  - `QuerySubmission`: `id`, `studentName`, `contactNumber`, `email`, `query`, `timestamp`, `status` (`Received` | `In Review` | `Answered`), `submitterUid` (optional), timestamps. Strictly readable/writable by Admin (and public validated `create`).
  - `LiveSession`: `id`, `courseCode`, `courseTitle`, `hostName`, `hostEmail`, `teacherUid`, `scheduledLabel`, `startTimeIso`, `meetingUrl`, `agenda`, `status` (`UPCOMING` | `LIVE` | `COMPLETED`), timestamps.
  - `SiteContent` (`siteContent/main`): Centralized JSON-schema-validated document storing all Home, About, Team, Collabs, Quick Learning, Contact, and Footer copy/gallery selections managed by Admin CMS.

### Interactive Component & State Mapping

- **Global App & Toast / Confirmation Layer**: Holds a unified `ConfirmDialogState` and `Toast` queue (supporting `success`, `error`, `info`). Any delete, revoke, or factory reset action opens the in-app **ConfirmModal** (`Escape` to cancel, loading spinner while async Firestore mutation executes).
- **Navigation & Footer**: Header houses a working **Notifications Menu** showing live unread Breaking Exam Alerts, user verification updates, and live classroom reminders with "Mark all read" and direct page jumps. Footer wires **Terms of Trust**, **Student Code of Ethics**, and **Refund Policy** to an accessible **Legal & Policy Reader Modal**, plus clickable `tel:` / `mailto:` / Telegram links.
- **Public Pages**:
  - Filter public course listings cleanly by `isApproved === true` across Home, Courses, Quick Learning, and Teachers views.
  - **Team Directory** instructor CTA navigates directly to the instructor's Verified Teacher Profile when verified, or pre-fills the Courses search bar for non-verified team mentors so every click shows relevant courses.
  - **Collabs & Course Details** unify promo code (`TRIBE10`, `TRIBE100`, `EXAMREADY`, `BLINKTRIBE`, `ZEPTOTRIBE`) validation and copy-to-clipboard / `navigator.share` with resilient fallback toasts.
  - **Contact SOS Form** validates inputs, sets `isSubmitting`, awaits Firestore `queries` write, displays reference ID on success, and surfaces explicit error recovery if offline.
- **Cart & Checkout**: Coupon input supports applying/removing all valid promo codes; Razorpay modal validates chosen method details (valid VPA format for UPI, 16-digit card + MM/YY + 3/4-digit CVV for Card, bank selection for NetBanking), resets internal state whenever reopened, and persists confirmed orders + enrollments atomically.
- **Student Dashboard**:
  - Replaces hardcoded `"2 Active Exam Tracks"`, `"64%"`, `"9.2+"`, and static `[2.5..3.0]` weekly hours with computed values from `enrolledCourses` and editable Firestore-backed `targetSgpa` & `weeklyStudyHours`.
  - **Profile & Study Goals Modal**: Allows updating Name, College, Semester, Department, and Target SGPA directly to Firestore.
  - **Weekly Study Tracker**: Interactive quick-log `+0.5h` / edit per-day study logger synchronized to Firestore.
  - **Interactive Study Reader Modal**: Module selector list, interactive topic checklist, "Mark Module Done / Undo" per module (auto-recomputing `progressPercent` from exact ratio of completed modules), built-in study timer (`Play` / `Pause`), and "Download Study Pack".
  - **Live Classroom Modal**: Displays real Firestore `liveSessions`, session agenda, countdown/status, external Google Meet / Zoom link launcher, and "Check In & Log 1h Study" interactive attendance action.
  - **Order Invoice Modal**: Print button plus genuine "Download Invoice (.html)" file download.
- **Teacher Portal & Admin Suite**:
  - **Teacher Ownership Scoping**: Verified teachers view/manage their own courses (or courses without `teacherUid` matching their email only when Admin), edit full **Syllabus Modules** + attach real study files (`<input type="file">` `.txt`/`.md`/`.pdf` metadata/link), publish Daily News, and schedule/manage **Live Classes**.
  - **Teacher KPIs**: Computed live from actual enrolled student counts, approved/pending course counts, and verified student reviews.
  - **Admin Executive Suite**: Expanded **Sync All Seed Data to Cloud** seeds courses, verified teachers, news, reviews, live sessions, queries, and CMS `siteContent` safely; includes full **Live Sessions** and **Contact Queries** moderation synced live to Firestore.

### Key Sequences & Integrations

1. **Firebase Rules & Blueprint Alignment**:
   - Update `firebase-blueprint.json` with `DailyNewsRecord`, `CourseReviewRecord`, `QuerySubmissionRecord`, `LiveSessionRecord`, `SiteContentRecord`, and extended `UserAccount` fields.
   - Regenerate strict `firestore.rules` enforcing:
     - Default-deny catch-all, valid ID regexes, bounded string/array lengths, exact allowed field whitelists (`hasAll` + `hasOnly`), and `affectedKeys().hasOnly(...)` on every update.
     - PII isolation: `users` scoped to owner/admin; `orders` scoped to owner/admin; `queries` strictly readable/updatable/deletable ONLY by `isAdmin()`, while allowing schema-validated public submission (`create`).
     - Course write isolation: `isAdmin()` or `isVerifiedTeacher()` owning `teacherUid == request.auth.uid`; News and LiveSessions writable by `isAdmin()` or `isVerifiedTeacher()` (`authorUid`/`teacherUid == request.auth.uid`).
     - Reviews readable publicly; `create`/`update` limited to signed-in user owning `studentId == request.auth.uid`; helpful upvote constrained to signed-in or verified-safe counter updates without tampering with review text/rating.
   - Validate rules with `npx eslint firestore.rules` and deploy via `DeployRules` RPC before completing verification.
2. **End-to-End Verification & Checklist Delivery**:
   - After building cleanly (`compile_applet` + `lint_applet`) and testing interactive flows in the running app, produce the exhaustive button-by-button checklist and remaining Firebase Console setup checklist in the final summary.
