# Type-to-Calendar TODOs

This checklist tracks the remaining work against the v1 PRD. The multiline draft review and independent creation flow is now implemented.

## P0: Required for v1 completion

- [x] Replace the single-event state with a collection of event drafts.
- [x] Parse each non-empty input line independently and preserve all detected drafts.
- [x] Extend the event model with `ready`/`blocked` status, a blocking reason, and duration-default metadata.
- [x] Block drafts when a date or time cannot be determined confidently.
- [x] Mark drafts with a start time but no end time as having a default one-hour duration.
- [x] Replace the read-only review output with editable cards for title, date, start time, and end time.
- [x] Add select/deselect controls, remove-draft controls, and a visible ready/blocked count.
- [x] Disable creation when there are no selected valid drafts.
- [x] Create selected drafts independently while keeping successful results when another draft fails.
- [x] Show per-draft pending, success, and failure states.
- [x] Add an individual retry action for failed drafts.
- [x] Render one shared Google Calendar link after at least one draft succeeds.
- [x] Change the Google OAuth scope in `src/components/SignIn.tsx` to the least-privilege `calendar.events` scope.
- [x] Surface missing `provider_token` and Google API failures in the affected draft state.

## P1: Finish the stated success criteria

- [x] Verify the original example inputs produce the expected drafts, including titles and date/time fields.
- [x] Verify `Meeting next week` is blocked rather than guessed.
- [x] Add a component test proving that editing a draft changes the payload sent to Google Calendar.
- [x] Add a component test proving mixed success/failure results support retrying only the failed draft.
- [x] Verify session restoration and signed-out rendering through automated auth-state tests.
- [x] Document the required Supabase Google provider setup and Calendar API configuration in `README.md`.

## P2: Small UX and robustness improvements

- [x] Add an explicit label and placeholder describing the accepted multiline input.
- [x] Make parse/creation loading and empty states clear and prevent duplicate batch submits.
- [x] Preserve the original input while the review queue is displayed.
- [x] Return useful Google API error details to the affected draft while avoiding sensitive token data in logs.
- [x] Add more accessible labels, descriptions, and keyboard behavior for draft controls.

## Explicitly deferred from v1

- [ ] Token refresh or server-side token handling.
- [ ] Idempotency protection for duplicate retries.
- [ ] Multiple calendar selection.
- [ ] Editing or deleting already-created events in the app.
- [ ] Chrome extension support.
- [ ] Deployment to Vercel.
