# Google Integration Tutorial (OAuth Setup)

Follow these steps to enable Google Login/Signup in your development and production environments.

## 1. Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **New Project** and name it "Arkanin".
3. Navigate to **APIs & Services > Credentials**.

## 2. Configure OAuth Consent Screen

1. Click **OAuth consent screen**.
2. Choose **External** user type.
3. Fill in required App Information (Logo, Support Email, Developer Email).
4. Add the scope: `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
5. Under **Test Users**, add your personal email for testing.

## 3. Create OAuth 2.0 Client ID

1. Go back to **Credentials**.
2. Click **Create Credentials > OAuth client ID**.
3. Choose **Web application**.
4. **Authorized JavaScript origins**:
   - `http://localhost:3000` (Frontend)
5. **Authorized redirect URIs**:
   - `http://localhost:8000/api/v1/auth/google/callback` (Backend API URL)
6. Click **Create** and copy your **Client ID** and **Client Secret**.

## 4. Update Backend Environment Variables

Add these to your `apps/api/.env` file:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

> [!IMPORTANT]
> - `GOOGLE_REDIRECT_URI` must exactly match the URI registered in the Google Cloud Console.
> - `FRONTEND_URL` is used by the backend to redirect the user after Google authentication.

## 5. OAuth Flow Overview

The Google OAuth flow works as follows:

```
Frontend                     Backend                      Google
   │                            │                            │
   │ 1. GET /auth/google        │                            │
   │ ─────────────────────────► │                            │
   │   ◄── redirect_url ─────── │                            │
   │                            │                            │
   │ 2. window.location = url   │                            │
   │ ──────────────────────────────────────────────────────► │
   │                            │                            │
   │                            │  3. Google callback + code │
   │                            │ ◄────────────────────────── │
   │                            │                            │
   │ 4. Redirect to frontend    │                            │
   │   /auth/google/callback    │                            │
   │   ?token=xxx               │                            │
   │ ◄────────────────────────── │                            │
   │                            │                            │
   │ 5. Store token, fetch user │                            │
   │ ──► localStorage + /me ──► │                            │
   │ ◄── user profile ───────── │                            │
   │                            │                            │
   │ 6. Redirect to dashboard   │                            │
   │                            │                            │
```

### Key design decisions:

- **Backend redirects to frontend** (step 4): The backend does NOT return JSON. It performs a `302 Redirect` to `/auth/google/callback?token=xxx` on the frontend. This prevents the raw JSON from being displayed in the browser.
- **Token in query string**: The token is passed as a URL query parameter. The frontend callback page immediately reads it, stores it in `localStorage`, clears it from the URL, and fetches the user profile.
- **Error handling**: If authentication fails on the backend, the redirect includes `?error=...` instead of `?token=...`.

## 6. Verification Steps

1. Start your backend: `php artisan serve --port=8000`.
2. Start your frontend: `npm run dev`.
3. Go to the **Login** or **Register** page.
4. Click the **Google** button.
5. You should be redirected to the Google account selection screen.
6. After selecting an account, you will see a processing animation and be redirected to the appropriate dashboard.

## 🔍 Troubleshooting

- **JSON displayed in browser**: Ensure `FRONTEND_URL` is set in `apps/api/.env`. The backend must redirect to the frontend, not return JSON.
- **403 Access Denied**: Ensure your email is added as a **Test User** in the OAuth Consent Screen.
- **Redirect URI Mismatch**: Double-check that the URI in `.env` matches the one in GCP Console (especially the trailing slash).
- **Token not stored**: Check the browser console for errors on the `/auth/google/callback` page. Ensure `NEXT_PUBLIC_API_URL` points to the correct backend URL.
- **CORS Errors**: The current implementation uses a direct redirect (`window.location.href`). Ensure the API Sanctum stateful domains include your frontend domain.
