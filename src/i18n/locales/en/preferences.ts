// Preferences UI — Sprint E [1.5.219] Phase 5.
// To add/edit/remove a key, edit this file directly. Symmetry with ES is
// validated by `npm run check:i18n`.
const preferences = {
  preferences: {
    sectionTitle: 'Dashboard customisation',
    sectionDesc: 'Adjust the detail level for each section. Changes take effect immediately.',
    tiers: {
      simple: 'Simple',
      standard: 'Standard',
      advanced: 'Advanced',
    },
    sections: {
      'home.energy': 'Energy',
      'home.macros': 'Macronutrients',
      'home.activity': 'Activity',
      'home.hydration': 'Hydration',
      'home.wellness': 'Wellness',
      'home.meals': 'Meals',
      'nutrition.detail': 'Nutrition detail',
      'progress.charts': 'Progress charts',
    },
    applyToAll: 'Apply to all',
    panelToggle: 'Customise sections',
    reset: 'Reset',
  },
};

export default preferences;
