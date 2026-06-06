export interface ProfileData {
  userId: string;
  age: number;
  weight: number;
  height: number;
  country: string;
  diet: string;
  physicalActivity: string;
  history: string;
  goal: string;
  healthScore: number;
  diabetesRisk: string;
  hypertensionRisk: string;
  dietQuality: string;
  recommendations: string;
  createdAt: any; // Firestore Timestamp
  language?: 'fr' | 'en';
}

export interface MealData {
  id?: string;
  userId: string;
  mealName: string;
  calories: number;
  nutritionalValue: string;
  localIngredients: string;
  suggestions: string;
  createdAt: any; // Firestore Timestamp
  imagePreview?: string; // Image base64 facultative pour rendu immédiat
}
