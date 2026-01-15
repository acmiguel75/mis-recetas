
import React, { useState } from 'react';
import { Recipe, Ingredient, Step } from '../types';
import CookingMode from './CookingMode';

interface RecipeDetailsProps {
  recipe: Recipe;
  onClose: () => void;
  onUpdate: (recipe: Recipe) => void;
  onAddToShopping: (ingredients: Ingredient[]) => void;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, onClose, onUpdate, onAddToShopping }) => {
  const [servings, setServings] = useState(recipe.servings);
  const [showCookingMode, setShowCookingMode] = useState(false);

  const toggleIngredient = (id: string) => {
    const newIngredients = recipe.ingredients.map(ing => 
      ing.id === id ? { ...ing, checked: !ing.checked } : ing
    );
    onUpdate({ ...recipe, ingredients: newIngredients });
  };

  const toggleStep = (id: string) => {
    const newSteps = recipe.steps.map(s => 
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    onUpdate({ ...recipe, steps: newSteps });
  };

  // Logic for scaling ingredients
  const scale = servings / recipe.servings;

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col">
      <div className="relative h-64">
        <img 
          src={recipe.thumbnail || `https://picsum.photos/seed/${recipe.id}/800/600`} 
          className="w-full h-full object-cover"
          alt={recipe.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="absolute bottom-6 left-6 right-6">
          <span className="bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded mb-2 inline-block">
            {recipe.category}
          </span>
          <h1 className="text-2xl font-bold text-white leading-tight">{recipe.title}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-t-3xl -mt-6 relative px-6 pt-8 pb-32">
        <div className="flex justify-between items-center mb-8 p-4 bg-slate-50 rounded-2xl">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Prep</p>
            <p className="font-bold text-slate-700">{recipe.prepTime}m</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Cocción</p>
            <p className="font-bold text-slate-700">{recipe.cookTime}m</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Dificultad</p>
            <p className="font-bold text-slate-700">{recipe.difficulty}</p>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-slate-800">Ingredientes</h2>
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >-</button>
              <span className="text-xs font-bold text-slate-700">{servings} raciones</span>
              <button 
                onClick={() => setServings(servings + 1)}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >+</button>
            </div>
          </div>
          <ul className="space-y-3">
            {recipe.ingredients.map(ing => (
              <li key={ing.id} className="flex items-center space-x-3 group">
                <button 
                  onClick={() => toggleIngredient(ing.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    ing.checked ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300 text-transparent'
                  }`}
                >
                  <i className="fa-solid fa-check text-[10px]"></i>
                </button>
                <div className={`flex-1 text-sm ${ing.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  <span className="font-medium">
                    {isNaN(parseFloat(ing.amount)) ? ing.amount : (parseFloat(ing.amount) * scale).toFixed(1)} {ing.unit}
                  </span> {ing.name}
                </div>
              </li>
            ))}
          </ul>
          <button 
            onClick={() => onAddToShopping(recipe.ingredients)}
            className="mt-6 w-full py-3 bg-slate-100 rounded-xl text-slate-600 text-sm font-bold flex items-center justify-center space-x-2"
          >
            <i className="fa-solid fa-cart-plus"></i>
            <span>Agregar a la lista de compras</span>
          </button>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Preparación</h2>
          <div className="space-y-6">
            {recipe.steps.map((step, idx) => (
              <div key={step.id} className="flex space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm">
                  {idx + 1}
                </div>
                <div className={`flex-1 text-sm leading-relaxed ${step.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {step.description}
                  {step.durationSeconds && (
                    <div className="mt-2 text-xs text-orange-600 font-medium flex items-center">
                      <i className="fa-regular fa-clock mr-1"></i>
                      {Math.floor(step.durationSeconds / 60)} min
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => toggleStep(step.id)}
                  className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center ${
                    step.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent'
                  }`}
                >
                   <i className="fa-solid fa-check text-[10px]"></i>
                </button>
              </div>
            ))}
          </div>
        </section>

        {recipe.notes && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Notas</h2>
            <p className="text-sm text-slate-500 bg-yellow-50 p-4 rounded-xl italic">
              {recipe.notes}
            </p>
          </section>
        )}
      </div>

      <div className="fixed bottom-20 left-6 right-6 z-50">
        <button 
          onClick={() => setShowCookingMode(true)}
          className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-200 flex items-center justify-center space-x-3 transform active:scale-95 transition-transform"
        >
          <i className="fa-solid fa-fire-burner"></i>
          <span>Comenzar Modo Cocina</span>
        </button>
      </div>

      {showCookingMode && (
        <CookingMode 
          recipe={recipe} 
          onClose={() => setShowCookingMode(false)} 
        />
      )}
    </div>
  );
};

export default RecipeDetails;
