# Arkanin Authentication — Development Guide

This document outlines the architecture, data flow, and security measures of the Arkanin platform's authentication system.

## 🏗️ Architecture Overview

The system uses a **decoupled architecture**:
- **Backend (Laravel)**: Acts as a Stateless API using **Laravel Sanctum** for token management (Bearer tokens).
- **Frontend (Next.js)**: Manages authentication state via **Zustand** (`useAuthStore.ts`) and persists the token in `localStorage`.

### Key Components

- **AuthController**: Centralized logic for `login`, `register`, `me`, `googleRedirect`, and `googleCallback`.
- **Sanctum**: Handles token generation and validation. Tokens are stored in the `personal_access_tokens` table.
- **Socialite**: Handles the heavy lifting of the OAuth2 flow with Google.
- **Zustand (Store)**: Handles client-side state, persistence, and role-based access control (RBAC).

---

## 🔒 Security Measures

### 1. Rate Limiting (Throttle)
Auth routes are protected by the `throttle:10,1` middleware to mitigate brute-force and credential-stuffing attacks.
- Paths: `/api/v1/auth/login`, `/api/v1/auth/register`.

### 2. Validation Hardening
Backend validation ensures:
- **Email**: Unique and valid format.
- **Password**: Minimum 8 characters, requiring mixed case, letters, and numbers.

### 3. Middleware
- `auth:sanctum`: Ensures the user is authenticated for protected routes.
- `role:admin` / `permission:manage_users`: Spatie permissions for granular access control.

---

## 🔄 Authentication Data Flow

### Login/Register Process:
1. Frontend sends credentials to `/api/v1/auth/login` or `/register`.
2. Backend validates data and checks credentials.
3. On success, backend returns a JSON response:
   ```json
   {
     "success": true,
     "data": {
       "user": { ... },
       "token": "1|abc123..."
     }
   }
   ```
4. Frontend `useAuthStore` receives the token, stores it in `localStorage`, and updates the `isAuthenticated` state.
5. All subsequent requests include the `Authorization: Bearer <token>` header.

### Logout Process:
1. Frontend calls `apiClient.auth.logout()`.
2. Backend revokes the token from the database.
3. Frontend clears `localStorage` and resets the store.

---

## 🛠️ Adding New Auth Features

### Adding a New Social Provider
1. Install driver (if not in Socialite core).
2. Add columns to `users` table via migration (e.g., `github_id`).
3. Update `config/services.php` with credentials.
4. Add routes and methods in `AuthController` following the `google` pattern.

### Updating User Permissions
The system uses `spatie/laravel-permission`. To check permissions on the frontend:
```typescript
const { hasPermission } = useAuthStore();
if (hasPermission('edit_content')) {
  // Show UI
}
```
