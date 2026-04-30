// Auto-generated composer for ES locale.
// Edit individual domain files (./common.ts, ./home.ts, etc.) — not this index.
import common from './common';
import nav from './nav';
import home from './home';
import food from './food';
import recipes from './recipes';
import planner from './planner';
import social from './social';
import wellness from './wellness';
import profile from './profile';
import settings from './settings';
import onboarding from './onboarding';

const es = {
  ...common,
  ...nav,
  ...home,
  ...food,
  ...recipes,
  ...planner,
  ...social,
  ...wellness,
  ...profile,
  ...settings,
  ...onboarding,
};

// Deep-string type so EN can use looser literal types per key.
type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : T[K] extends string[] ? string[] : DeepString<T[K]>;
};
export type Translations = DeepString<typeof es>;

export default es;
