// Sprint [1.5.175] — global error UX namespace.
// Used by ErrorBoundary (full-screen + feature-level fallback) and the
// defensive log-meal handler. Symmetry with EN is validated by
// `npm run check:i18n`.
const errors = {
  errors: {
    boundary: {
      title: 'Algo salió mal',
      message: 'Ha ocurrido un error inesperado.',
      featureMessage: 'Hubo un problema cargando {feature}.',
      retryAction: 'Reintentar',
      goHomeAction: 'Volver al inicio',
      reloadAction: 'Recargar app',
      detailsToggle: '¿Qué pasó?',
      retryExhausted: 'El error persiste. Intenta volver al inicio o recargar.',
    },
    logMealFailed: 'No pudimos registrar la comida. Intenta de nuevo.',
  },
};

export default errors;
