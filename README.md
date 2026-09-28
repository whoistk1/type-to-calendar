# Type To Calendar

Type To Calendar turns one event per line of natural-language text into editable Google Calendar drafts.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the values from your Supabase project.
4. Enable the Google provider in Supabase Auth.
5. Configure the Google OAuth client with the Supabase callback URL shown in the Supabase provider settings.
6. Enable the Google Calendar API in the same Google Cloud project.
7. Add the local app URL, usually `http://localhost:5173`, to the allowed redirect URLs in Supabase.
8. Start the app with `npm run dev`.

The app requests the least-privilege Google scope `calendar.events` and creates events in the signed-in user's primary calendar.

## Commands

- `npm run dev` starts the Vite development server.
- `npm test` runs parser, Calendar API, and component tests.
- `npm run build` type-checks and builds the production bundle.
- `npm run lint` runs ESLint.
