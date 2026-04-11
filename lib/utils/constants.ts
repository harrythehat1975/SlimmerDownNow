export const ACTIVITY_LEVELS = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Light (1-3 days/week)",
  moderate: "Moderate (3-5 days/week)",
  active: "Active (6-7 days/week)",
  very_active: "Very Active (intense daily exercise)",
};

export const FITNESS_LEVELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const DIETARY_STYLES = {
  omnivore: "Omnivore (no restrictions)",
  vegetarian: "Vegetarian",
  pescatarian: "Pescatarian",
};

export const MEAL_TYPES = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const WORKOUT_TYPES = {
  strength: "Strength Training",
  cardio: "Cardio",
  mobility: "Mobility & Recovery",
  mixed: "Mixed",
};

export const SUBSCRIPTION_PLANS = {
  free_trial: {
    name: "Free Trial",
    duration_days: 7,
    price_usd: 0,
  },
  monthly: {
    name: "Monthly",
    price_usd: 9.99,
    billing_period: "month",
  },
  annual: {
    name: "Annual",
    price_usd: 99,
    billing_period: "year",
  },
};

export const DEFAULT_HYDRATION_LITERS = 2.5;
export const CALORIE_MINIMUM = 1200;
export const MIN_AGE = 18;
export const MAX_AGE = 120;

// Pagination
export const PAGINATION_DEFAULTS = {
  limit: 50,
  offset: 0,
};

export const PAGINATION_MAX_LIMIT = 100;
