# Type To Calendar

Type To Calendar turns one event per line of natural-language text into editable Google Calendar drafts. Users can review, correct, select, and create multiple events independently, with blocked drafts and Google Calendar failures shown directly in the review flow.

## Tech stack

- React 19 and TypeScript
- Vite
- Tailwind CSS
- Supabase Auth for Google OAuth and session restoration
- Google Calendar API
- `chrono-node` for natural-language date and time parsing
- Vitest and Testing Library

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com/).
2. Open **Authentication > Providers** and enable Google.
3. Copy the project URL and anon key from **Project Settings > API**.
4. Copy `.env.example` to `.env.local` and set:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Never put a Supabase service-role key in this frontend application.

### 3. Configure Google OAuth

In Google Cloud Console:

1. Create or select a Google Cloud project.
2. Enable the **Google Calendar API**.
3. Configure the OAuth consent screen as an **External** app.
4. Add the app name, support email, and developer contact email.
5. Add the scopes `openid`, `userinfo.email`, `userinfo.profile`, and `calendar.events`.
6. While the app is in **Testing** mode, add every account that needs to sign in under **Test users**.
7. Create a Web OAuth client.
8. Add the Supabase callback URL as an authorized redirect URI:

```text
https://<your-project-ref>.supabase.co/auth/v1/callback
```

The `calendar.events` scope is sensitive. Publishing the app for unrestricted Google accounts may require Google's OAuth verification process.

### 4. Configure Supabase URLs

In **Authentication > URL Configuration**, add the local development URL to the allowed redirect URLs:

```text
http://localhost:5173
```

For a deployed app, also add its HTTPS URL. Keep the Supabase callback URL configured in the Google OAuth client.

### 5. Start the app

```bash
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`.

## Available scripts

- `npm run dev` starts the Vite development server.
- `npm run build` type-checks and builds the production bundle.
- `npm run lint` runs ESLint.
- `npm test` runs the test suite once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run preview` serves the production build locally.

## Known Limitations

- Google OAuth refresh tokens issued while the OAuth consent screen is in **Testing** mode expire after 7 days. Users may need to authorize the app again until the app is published and, where required, verified.
- The app creates events in the signed-in user's primary calendar only.
- Token refresh and server-side token handling are not implemented.
- Duplicate retry idempotency, existing-event editing/deletion, multiple calendar selection, and browser-extension support are not included in v1.
