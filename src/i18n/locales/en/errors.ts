// Sprint [1.5.175] — global error UX namespace.
// Used by ErrorBoundary (full-screen + feature-level fallback) and the
// defensive log-meal handler. Symmetry with ES is validated by
// `npm run check:i18n`.
const errors = {
  errors: {
    boundary: {
      title: 'Something went wrong',
      message: 'An unexpected error occurred.',
      featureMessage: 'There was a problem loading {feature}.',
      retryAction: 'Try again',
      goHomeAction: 'Back to home',
      reloadAction: 'Reload app',
      detailsToggle: 'What happened?',
      retryExhausted: 'The error persists. Try going home or reloading.',
    },
    logMealFailed: "We couldn't log this meal. Please try again.",
  },
};

export default errors;
