<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/823d6e0b-6e7b-4f04-9643-add9b849e68b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Shared guest links with Supabase

The app can use Supabase so guest records imported by an admin are available to guests opening their personal links on other devices.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/setup.sql`](./supabase/setup.sql).
3. In Supabase Authentication, create the admin user and disable public sign-ups.
4. Add that user's auth UUID to the admin allowlist in the SQL Editor:

   ```sql
   insert into public.wedding_admins (user_id)
   values ('YOUR_AUTH_USER_UUID');
   ```

5. Copy `.env.example` to `.env.local`, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project's API settings. Use the publishable/anon key only; never put a `service_role` key in frontend environment variables.
6. Set `VITE_APP_URL` to the deployed site's public HTTPS URL, rebuild, and deploy the app.
7. Sign in to the admin panel with the Supabase admin user's email and password, then import the guest CSV. New imports are saved to Supabase and their QR codes and links can be opened on guests' phones.

Guest lists imported before Supabase is configured exist only in that browser. Export that list to CSV first, connect Supabase, then import it again. Wedding changes must be published from the editor to be visible to guests.

Without Supabase environment variables, the app keeps using browser-local storage. In that mode, guest records and RSVP responses do not sync between devices.
