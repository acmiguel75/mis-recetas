
export enum Difficulty {
  BASIC = 'Básico',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado'
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked?: boolean;
}

export interface Step {
  id: string;
  description: string;
  durationSeconds?: number;
  completed?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  sourceUrl: string;
  thumbnail: string;
  category: string;
  ingredients: Ingredient[];
  steps: Step[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: Difficulty;
  notes: string;
  tags: string[];
  servings: number;
  createdAt: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
  recipeId?: string;
}

export interface MealPlan {
  id: string;
  date: string; // ISO format
  recipeId: string;
  mealType: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
}
