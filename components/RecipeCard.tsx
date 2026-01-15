
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      onClick={() => onClick(recipe)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="relative h-32 w-full bg-slate-200">
        <img 
          src={recipe.thumbnail || `https://picsum.photos/seed/${recipe.id}/400/300`} 
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
          {recipe.cookTime + recipe.prepTime} min
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm line-clamp-2 text-slate-800 leading-tight mb-1">
          {recipe.title}
        </h3>
        <div className="flex items-center text-slate-400 text-[10px] space-x-2">
          <span>{recipe.category}</span>
          <span>•</span>
          <span>{recipe.difficulty}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
