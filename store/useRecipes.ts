
import { useState, useEffect, useCallback } from 'react';
import { Recipe, ShoppingItem, MealPlan } from '../types';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes');
    const savedShopping = localStorage.getItem('shopping');
    const savedPlans = localStorage.getItem('plans');
    
    if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
    if (savedShopping) setShoppingList(JSON.parse(savedShopping));
    if (savedPlans) setMealPlans(JSON.parse(savedPlans));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('plans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => [...prev, recipe]);
  }, []);

  const updateRecipe = useCallback((id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleIngredientInRecipe = useCallback((recipeId: string, ingredientId: string) => {
    setRecipes(prev => prev.map(r => {
      if (r.id === recipeId) {
        return {
          ...r,
          ingredients: r.ingredients.map(ing => ing.id === ingredientId ? { ...ing, checked: !ing.checked } : ing)
        };
      }
      return r;
    }));
  }, []);

  const addToShoppingList = useCallback((items: ShoppingItem[]) => {
    setShoppingList(prev => [...prev, ...items]);
  }, []);

  const toggleShoppingItem = useCallback((id: string) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  }, []);

  const clearShoppingList = useCallback(() => setShoppingList([]), []);

  const addMealPlan = useCallback((plan: MealPlan) => {
    setMealPlans(prev => [...prev, plan]);
  }, []);

  return {
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleIngredientInRecipe,
    shoppingList,
    addToShoppingList,
    toggleShoppingItem,
    clearShoppingList,
    mealPlans,
    addMealPlan
  };
};
