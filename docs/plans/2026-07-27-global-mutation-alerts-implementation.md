# Global Mutation Alerts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add consistent, contextual success and error feedback to every data-changing flow in `apps/web`.

**Architecture:** A global Zustand store owns one active alert, while a root-level client provider renders the existing alert primitive. Zustand domain stores publish mutation feedback for shared operations; views publish feedback for direct API calls. A shared error normalizer converts Laravel, Axios, native Error, and string failures into readable messages.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, Tailwind CSS 4, existing `components/ui/alert.tsx`.

---

### Task 1: Alert state and error normalization

**Files:**
- Create: `apps/web/src/store/useAlertStore.ts`
- Create: `apps/web/src/lib/get-error-message.ts`

1. Define the failing lifecycle expectations for replacement, success expiry, persistent errors, and manual dismissal.
2. Verify the expectations fail because no shared alert API exists.
3. Implement `showAlert`, `showSuccess`, `showError`, and `dismissAlert`.
4. Implement Laravel/Axios/Error/string normalization.
5. Verify lifecycle and normalization behavior.

### Task 2: Global alert renderer

**Files:**
- Create: `apps/web/src/components/ui/app-alert-provider.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/components/ui/alert.tsx`

1. Define renderer expectations for dynamic content, icons, dismissal, dark mode, and accessibility.
2. Render one fixed viewport alert using the existing alert primitives.
3. Add a success variant and accessible close button.
4. Mount the provider once in the root layout.
5. Verify responsive positioning and lifecycle behavior.

### Task 3: Shared Zustand mutations

**Files:**
- Modify: `apps/web/src/store/useAuthStore.ts`
- Modify: `apps/web/src/store/useSalesStore.ts`
- Modify: `apps/web/src/store/useLearningStore.ts`
- Modify: `apps/web/src/store/useFinanceStore.ts`
- Modify: `apps/web/src/store/useThemeStore.ts`

1. Add contextual success messages for create, update, delete, submit, and status changes.
2. Add persistent normalized error messages before rethrowing or storing errors.
3. Resolve entity labels from payload or current store state.
4. Avoid alerts for read-only fetch operations.

### Task 4: Direct API mutation views

**Files:**
- Modify: `apps/web/src/components/admin/views/Users/view.tsx`
- Modify: `apps/web/src/components/admin/views/MenuManagement/view.tsx`
- Modify: `apps/web/src/components/admin/views/RolesPermissions/view.tsx`
- Modify: `apps/web/src/components/admin/views/CMSPosts/view.tsx`
- Modify: `apps/web/src/components/dashboard/ScheduleManagerModal.tsx`
- Modify: `apps/web/src/app/exams/session/[attemptId]/page.tsx`

1. Replace mutation-related native alerts with global contextual alerts.
2. Add success feedback to direct API calls.
3. Keep destructive confirmation prompts unchanged.
4. Keep forms open on errors where practical.

### Task 5: Verification

**Files:**
- Inspect: `apps/web/src/**/*.{ts,tsx}`

1. Search for remaining mutation-related `window.alert()` or `alert()` calls.
2. Run TypeScript validation.
3. Run the frontend production build.
4. Exercise representative success/error flows for users, mentors, programs, finance, roles, menus, curriculum, schedules, theme, CMS, checkout, auth, and exams.
5. Review the final diff for missing context, duplicate alerts, and unrelated changes.

