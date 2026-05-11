// Preferences UI — Sprint E [1.5.219] Phase 5.
// To add/edit/remove a key, edit this file directly. Symmetry with EN is
// validated by `npm run check:i18n`.
const preferences = {
  preferences: {
    sectionTitle: 'Personalización del dashboard',
    sectionDesc: 'Ajusta el nivel de detalle de cada sección. Los cambios son inmediatos.',
    tiers: {
      simple: 'Simple',
      standard: 'Estándar',
      advanced: 'Avanzado',
    },
    sections: {
      'home.energy': 'Energía',
      'home.macros': 'Macronutrientes',
      'home.activity': 'Actividad',
      'home.hydration': 'Hidratación',
      'home.wellness': 'Bienestar',
      'home.meals': 'Comidas',
      'nutrition.detail': 'Nutrición detallada',
      'progress.charts': 'Gráficos de progreso',
    },
    applyToAll: 'Aplicar a todas',
    panelToggle: 'Personalizar secciones',
    reset: 'Restablecer',
  },
};

export default preferences;
