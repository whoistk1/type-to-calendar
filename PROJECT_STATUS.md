# Type To Calendar Project Status

## Current State

Type To Calendar is a functional React/Vite application that turns multiline natural-language input into Google Calendar event drafts.

Implemented:

- React 19, TypeScript, Vite, Tailwind CSS, and Vitest.
- Supabase Google OAuth authentication and session restoration.
- Landing/sign-in view for signed-out users.
- Multiline input split into non-empty lines.
- One `EventDraft` produced per input line through `parseLine`.
- Natural-language parsing with `chrono-node`.
- Explicit weekdays and hyphenated ranges such as `Friday 8pm-9pm`.
- `ready` and `blocked` draft states with human-readable blocking reasons.
- One-hour default duration when only a start time is provided.
- Editable title, start, and end fields in review cards.
- Ready/blocked counts, selection controls, and draft removal.
- Independent creation of selected drafts through the Google Calendar API.
- Per-draft pending, success, failure, and retry states.
- One shared Google Calendar link after at least one draft succeeds.
- Missing provider-token errors are surfaced on the affected draft.
- Environment-based Supabase configuration with an `.env.example` template.
- Safe Google API status and error details on failed drafts.
- Automated parser, Calendar API, and EventEntry component tests.
- Automated session restoration and signed-out rendering tests.

## Current Application Flow

1. `Landing` renders `SignIn` for unauthenticated users.
2. Supabase restores or changes the session and sends it to `App`.
3. `EventEntry` accepts multiline input and splits it into non-empty lines.
4. `parseLine` converts each line into a ready or blocked `EventDraft`.
5. `Review` renders editable cards and prevents blocked drafts from being selected.
6. Selected ready drafts are created independently, preserving successes when another creation fails.
7. Failed drafts can be retried individually.

## Remaining Gaps

- The local Supabase configuration references port `3000`, while Vite normally runs on `5173`.
- A real Google OAuth sign-in/sign-out smoke test still requires configured `.env.local` credentials and provider settings.

## Validation

- `npm test`: 15 tests passed.
- `npm run build` passes.
- `npm run lint` passes with no reported errors.

## Recommended Next Milestone

Verify the authenticated session lifecycle in the configured Supabase/Google environment and align the local Supabase port documentation with the Vite development port.
