export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string; // ISO string
  status: 'Optimal' | 'Stable' | 'Sluggish' | 'Recovering';
  sleep: number; // hours
  stress: number; // 1-100 scale or similar
  symptoms: string[];
}

export interface ToleranceLog {
  id: string;
  userId: string;
  date: string;
  food: string;
  reaction: 'Severe' | 'Moderate' | 'Mild';
  symptoms: string;
}
