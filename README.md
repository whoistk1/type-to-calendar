# Type To Calendar

Type To Calendar turns one event per line of natural-language text into editable Google Calendar drafts.

```text
Team sync tomorrow at 2pm
Planning workshop October 2 at 10am
```

Review, edit, select, and create multiple events independently. Invalid drafts stay visible with an explanation, and failed Calendar requests can be retried without creating duplicates.

## Features

- Natural-language date and time parsing with [`chrono-node`](https://github.com/wanasit/chrono).
- One event per line with independent review and selection.
- Editable title, start time, and end time.
- One-hour default duration when no end time is provided.
- Visible warnings for assumed dates and ambiguous date/time matches.
- Google OAuth through Supabase Auth.
- Idempotent Google Calendar creation using deterministic event IDs.
- Per-event success, failure, and retry states.

## Stack

- React 19 and TypeScript
- Vite
- Tailwind CSS
- Supabase Auth
- Google Calendar API
- Vitest and Testing Library
- Docker & Nginx (Multi-stage build & production hosting)
- GitHub Actions (Automated CI/CD pipeline)

## Running with Docker

### Local Development / Testing

Build and run using Docker Compose:
```bash
docker compose up --build
```
Access the application at [http://localhost:8080](http://localhost:8080).

Or build and run the Docker image directly:
```bash
docker build -t type-to-calendar .
docker run -p 8080:80 type-to-calendar
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/docker-ci-cd.yml`) automatically runs on pushes and pull requests to `main`:
1. **CI**: Lints (`eslint`), runs tests (`vitest`), and validates the production TypeScript/Vite build.
2. **Docker CD**: Builds the container image with multi-stage caching and publishes it to GitHub Container Registry (`ghcr.io`).

Optional GitHub Repository Secrets:
- `VITE_SUPABASE_URL`: Supabase project URL for production builds.
- `VITE_SUPABASE_ANON_KEY`: Supabase anon key for production builds.


## How it works

1. `AuthProvider` restores the Supabase session and subscribes to auth changes.
2. The user enters one event per line.
3. The parser creates ready or blocked drafts.
4. `useDrafts` manages parsing, editing, selection, and creation state with a reducer.
5. The Calendar API creates events in the signed-in user's primary calendar.
6. A deterministic event ID makes retries safe; Google `409 Conflict` responses are treated as successful duplicate-safe retries.

Authentication, parser, calendar, and draft state code live under [`src/features/`](./src/features/).

## Known limitations

- Events are created only in the signed-in user's primary calendar.
- Existing-event editing and deletion are not included.
- Multiple calendar selection is not included.
- Google OAuth refresh tokens issued while the consent screen is in Testing mode may expire after seven days.
- Supabase does not refresh the Google provider token used for direct Calendar API calls. A Calendar `401` starts Google reauthorization automatically.
- Server-side token handling, duplicate retry idempotency across separately recreated drafts, and browser-extension support are not included.
