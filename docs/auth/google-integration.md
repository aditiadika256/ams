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
```

> [!IMPORTANT]
> Ensure `GOOGLE_REDIRECT_URI` exactly matches the URI registered in the Google Cloud Console.

## 5. Verification Steps

1. Start your backend: `php artisan serve --port=8000`.
2. Start your frontend: `npm run dev`.
3. Go to the **Login** or **Register** page.
4. Click the **Google** button.
5. You should be redirected to the Google account selection screen.
6. After selecting an account, you will be redirected back to the Arkanin Dashboard.

## 🔍 Troubleshooting

- **403 Access Denied**: Ensure your email is added as a **Test User** in the OAuth Consent Screen.
- **Redirect URI Mismatch**: Double-check that the URI in `.env` matches the one in GCP Console (especially the trailing slash).
- **CORS Errors**: The current implementation uses a direct redirect (`window.location.href`). If you switch to an XHR-based login, ensure API Sanctum stateful domains are configured.
