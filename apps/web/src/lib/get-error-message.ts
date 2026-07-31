type ErrorWithDetails = {
  message?: unknown;
  errors?: Record<string, unknown>;
  response?: {
    data?: {
      message?: unknown;
      error?: unknown;
      errors?: Record<string, unknown>;
    };
  };
};

function firstValidationMessage(errors?: Record<string, unknown>): string | null {
  if (!errors) return null;

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && typeof value[0] === 'string') {
      return value[0];
    }

    if (typeof value === 'string') {
      return value;
    }
  }

  return null;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const details = error as ErrorWithDetails;
  const responseData = details.response?.data;

  return (
    firstValidationMessage(details.errors) ||
    firstValidationMessage(responseData?.errors) ||
    (typeof responseData?.message === 'string' ? responseData.message : null) ||
    (typeof responseData?.error === 'string' ? responseData.error : null) ||
    (typeof details.message === 'string' ? details.message : null) ||
    fallback
  );
}
