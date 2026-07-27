# Global Mutation Alerts Design

## Objective

Provide consistent, contextual feedback for every data mutation in `apps/web` by using the existing `Alert`, `AlertTitle`, and `AlertDescription` primitives. Success alerts disappear automatically after five seconds. Error alerts remain visible until dismissed.

## Scope

The alert system covers create, update, delete, submit, and status-changing actions throughout `apps/web`, including admin, learning, finance, authentication, checkout, and examinations. Read-only loading errors may continue using their existing inline presentation unless a touched feature benefits from the shared system.

Native `window.alert()` calls used as mutation feedback will be replaced. Confirmation dialogs such as `confirm()` remain because they ask for approval before a destructive action rather than reporting its result.

## Architecture

Create a small global alert store with a single active notification. The store exposes an explicit parameterized API:

```ts
showAlert({
  type: 'success',
  title: 'Mentor berhasil ditambahkan',
  message: `${userName} sekarang terdaftar sebagai mentor.`,
});
```

Convenience actions `showSuccess`, `showError`, and `dismissAlert` keep feature handlers concise. A single `AppAlertProvider`, mounted in the root application layout, subscribes to the store and renders the notification with `components/ui/alert.tsx`.

The provider appears at the top of the viewport, above dialogs and page content, and supports light and dark themes. A new alert replaces the current alert to prevent notification stacks from obscuring the interface.

## Lifecycle

- Success alerts automatically dismiss after five seconds.
- Error alerts never dismiss automatically.
- Every alert includes an accessible manual close control.
- Replacing an alert cancels the previous success timer.
- Unmounting the provider clears any active timer.

## Mutation Data Flow

1. A feature form invokes its mutation handler.
2. The handler awaits the API or Zustand store operation.
3. On success, it resets or closes the form and calls `showSuccess` with a feature-specific title and message.
4. On failure, it keeps the form open where practical and calls `showError`.
5. The provider renders the latest alert independently of the form or dialog lifecycle.

Messages must use actual context where available, such as user name, mentor name, program title, role name, transaction reference, schedule title, or examination name.

## Error Normalization

Add a shared `getErrorMessage(error, fallback)` utility. It prioritizes:

1. Laravel validation messages;
2. Axios/API response messages;
3. native `Error.message`;
4. string errors;
5. the supplied feature-specific fallback.

This prevents generic alerts while remaining robust when a backend endpoint does not return a message.

## Testing

Tests will verify that:

- alert titles and messages are accepted dynamically;
- success alerts dismiss after five seconds;
- error alerts remain until dismissed;
- manual dismissal works;
- replacement cancels the previous timer;
- representative mutation handlers show contextual success and error feedback;
- mutation feedback no longer uses `window.alert()`;
- TypeScript validation and the frontend build succeed.

