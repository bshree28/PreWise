
export interface Nutrition {
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
}

export interface Recipe {
  name: string;
  description: string;
  category: 'Main' | 'Snack' | 'Sweet';
  ingredients: string[];
  steps: string[];
  nutrition: Nutrition;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  imageUrl?: string;
}

export interface AnalysisResponse {
  detectedIngredients: string[];
  recipes: Recipe[];
  shoppingList: string[];
}

export type AppState = 'IDLE' | 'CAMERA_PREVIEW' | 'SCANNING' | 'GENERATING_IMAGES' | 'RESULTS';
