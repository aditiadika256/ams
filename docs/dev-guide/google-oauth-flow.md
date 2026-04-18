# Developer Guide — Google OAuth Flow

Panduan teknis untuk developer yang bekerja pada fitur Google OAuth di Arkanin.

## Arsitektur Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend SPA  │     │   Backend API    │     │   Google OAuth   │
│   (Next.js)     │     │   (Laravel)      │     │   Server         │
└────────┬────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                       │                         │
    1. Click Google btn          │                         │
         │ GET /auth/google      │                         │
         │──────────────────────►│                         │
         │◄── JSON: redirect_url─│                         │
         │                       │                         │
    2. Redirect browser          │                         │
         │──────────────────────────────────────────────── │
         │                       │                         │
         │                  3. Google callback with code   │
         │                       │◄─────────────────────── │
         │                       │                         │
    4. 302 Redirect with token   │                         │
         │◄──/auth/google/       │                         │
         │   callback?token=xxx  │                         │
         │                       │                         │
    5. Store token + fetch /me   │                         │
         │──────────────────────►│                         │
         │◄── user profile ──────│                         │
         │                       │                         │
    6. Navigate to dashboard     │                         │
```

## File yang Terlibat

### Backend (Laravel)

| File | Fungsi |
|------|--------|
| `app/Domain/Auth/AuthController.php` | Method `googleRedirect()` dan `googleCallback()` |
| `config/app.php` | Config `frontend_url` untuk redirect target |
| `routes/api.php` | Route `GET auth/google` dan `GET auth/google/callback` |
| `.env` | Variable `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `FRONTEND_URL` |

### Frontend (Next.js)

| File | Fungsi |
|------|--------|
| `src/app/auth/google/callback/page.tsx` | Callback page — menerima token, simpan, redirect |
| `src/app/auth/login/page.tsx` | Handler `handleGoogleLogin()` |
| `src/app/auth/register/page.tsx` | Handler `handleGoogleSignup()` |
| `src/store/useAuthStore.ts` | Method `handleGoogleCallback(token)` |
| `src/lib/api.ts` | Method `apiClient.auth.googleRedirect()` |

## Detail Implementasi

### Backend — `googleCallback()`

```php
public function googleCallback()
{
    $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

    try {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $token = DB::transaction(function () use ($googleUser) {
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name'       => $googleUser->getName(),
                    'google_id'  => $googleUser->getId(),
                    'provider'   => 'google',
                    'avatar_url' => $googleUser->getAvatar(),
                ]
            );

            if ($user->wasRecentlyCreated) {
                $user->assignRole('student');
            }

            return $user->createToken('api-token')->plainTextToken;
        });

        // ✅ Redirect ke frontend — bukan return JSON
        return redirect()->to(
            $frontendUrl . '/auth/google/callback?' . http_build_query(['token' => $token])
        );
    } catch (\Exception $e) {
        return redirect()->to(
            $frontendUrl . '/auth/google/callback?' . http_build_query([
                'error' => 'Google authentication failed. Please try again.',
            ])
        );
    }
}
```

**Kenapa redirect, bukan JSON?**

Google memanggil callback URL langsung di browser (bukan via AJAX). Jika backend return JSON, user akan melihat raw JSON. Redirect memastikan SPA bisa menangani response.

### Frontend — Callback Page

Halaman `/auth/google/callback` memproses 3 skenario:

1. **`?token=xxx`** → Simpan token → Fetch user via `/auth/me` → Redirect ke dashboard
2. **`?error=xxx`** → Tampilkan error message + tombol kembali
3. **Tanpa parameter** → Tampilkan error "Token tidak ditemukan"

### Frontend — Auth Store

```typescript
handleGoogleCallback: async (token: string) => {
  // 1. Simpan token ke localStorage
  localStorage.setItem('token', token);
  set({ token });

  // 2. Fetch user profile menggunakan token baru
  const response = await apiClient.auth.me();

  // 3. Update auth state
  set({
    user: response.data,
    isAuthenticated: true,
  });
}
```

## Environment Variables

### Backend (`apps/api/.env`)

```env
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### Frontend (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/
```

## Testing

### Manual Testing

1. Jalankan backend dan frontend.
2. Buka `/auth/login` → klik **Google**.
3. Pilih akun Google → verifikasi redirect ke `/auth/google/callback`.
4. Verifikasi:
   - Token tersimpan di `localStorage` (key: `token`)
   - User berhasil di-fetch dan ditampilkan
   - Redirect ke dashboard sesuai role

### Edge Cases

- **User sudah ada** → `updateOrCreate` tidak membuat duplikat
- **Token invalid/expired** → Callback page menampilkan error + tombol kembali
- **Network error saat fetch /me** → Token dihapus, user diarahkan ke login
- **React Strict Mode** → `useRef` mencegah double-invocation
- **Next.js Suspense** → `useSearchParams` dibungkus `<Suspense>` (required by Next.js)

## Catatan Keamanan

- Token dikirimkan via query parameter. Pada production, pastikan menggunakan HTTPS untuk mencegah token leaking.
- Token langsung dihapus dari URL setelah diproses (browser history clean).
- Rate limiting diterapkan pada endpoint auth (`throttle:10,1`).
