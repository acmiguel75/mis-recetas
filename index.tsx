
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES ---
enum Difficulty {
  BASIC = 'Básico',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado'
}

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked?: boolean;
}

interface Step {
  id: string;
  description: string;
  durationSeconds?: number;
  completed?: boolean;
}

interface Recipe {
  id: string;
  title: string;
  sourceUrl: string;
  thumbnail: string;
  category: string;
  ingredients: Ingredient[];
  steps: Step[];
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  notes: string;
  tags: string[];
  servings: number;
  createdAt: number;
}

interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
  recipeId?: string;
}

// --- SERVICES ---
const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY || '' });

const parseRecipeFromUrl = async (url: string): Promise<Partial<Recipe>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analiza este enlace de receta: ${url}. Extrae título, ingredientes, pasos, tiempos y categoría. Responde en JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          prepTime: { type: Type.NUMBER },
          cookTime: { type: Type.NUMBER },
          difficulty: { type: Type.STRING, enum: Object.values(Difficulty) },
          servings: { type: Type.NUMBER },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING },
                unit: { type: Type.STRING }
              },
              required: ["name", "amount", "unit"]
            }
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                durationSeconds: { type: Type.NUMBER }
              },
              required: ["description"]
            }
          },
          notes: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          thumbnail: { type: Type.STRING }
        },
        required: ["title", "ingredients", "steps"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return { ...data, sourceUrl: url, createdAt: Date.now() };
};

// --- COMPONENTS ---

const CookingMode = ({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const currentStep = recipe.steps[currentStepIdx];

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => (prev !== null ? prev - 1 : 0)), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-orange-600">Modo Cocina</h2>
        <button onClick={onClose} className="text-slate-400"><i className="fa-solid fa-xmark text-2xl"></i></button>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-orange-500 font-bold text-xs mb-2">PASO {currentStepIdx + 1} DE {recipe.steps.length}</p>
        <h3 className="text-2xl font-bold text-slate-800 mb-8">{currentStep.description}</h3>
        {currentStep.durationSeconds && (
          <div className="bg-orange-50 p-6 rounded-3xl text-center">
            <div className="text-4xl font-mono font-bold text-orange-600 mb-4">
              {Math.floor((timeLeft ?? currentStep.durationSeconds) / 60)}:{( (timeLeft ?? currentStep.durationSeconds) % 60).toString().padStart(2, '0')}
            </div>
            <button onClick={() => { setTimeLeft(timeLeft ?? currentStep.durationSeconds); setIsActive(!isActive); }} className="bg-orange-500 text-white px-8 py-2 rounded-full font-bold">
              {isActive ? 'Pausar' : 'Iniciar'}
            </button>
          </div>
        )}
      </div>
      <div className="flex space-x-4 mt-8">
        <button disabled={currentStepIdx === 0} onClick={() => setCurrentStepIdx(currentStepIdx - 1)} className="flex-1 py-4 border rounded-2xl disabled:opacity-30">Anterior</button>
        <button onClick={() => currentStepIdx < recipe.steps.length - 1 ? setCurrentStepIdx(currentStepIdx + 1) : onClose()} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold">
          {currentStepIdx === recipe.steps.length - 1 ? 'Finalizar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
};

const RecipeDetails = ({ recipe, onClose, onUpdate, onAddToShopping }: any) => {
  const [servings, setServings] = useState(recipe.servings);
  const [showCooking, setShowCooking] = useState(false);
  const scale = servings / recipe.servings;

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col overflow-y-auto pb-24">
      <div className="relative h-64 shrink-0">
        <img src={recipe.thumbnail || `https://picsum.photos/seed/${recipe.id}/800/600`} className="w-full h-full object-cover" />
        <button onClick={onClose} className="absolute top-6 left-6 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full text-white"><i className="fa-solid fa-chevron-left"></i></button>
      </div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{recipe.title}</h1>
        <div className="flex justify-between mb-8 bg-slate-50 p-4 rounded-xl">
          <div className="text-center"><p className="text-[10px] text-slate-400 font-bold">PREP</p><p className="font-bold">{recipe.prepTime}m</p></div>
          <div className="text-center"><p className="text-[10px] text-slate-400 font-bold">COCINA</p><p className="font-bold">{recipe.cookTime}m</p></div>
          <div className="text-center"><p className="text-[10px] text-slate-400 font-bold">PORCIONES</p><p className="font-bold">{servings}</p></div>
        </div>
        <h2 className="text-lg font-bold mb-3">Ingredientes</h2>
        <ul className="space-y-2 mb-8">
          {recipe.ingredients.map((ing: any) => (
            <li key={ing.id} className="flex items-center text-sm">
              <i className="fa-solid fa-circle text-[6px] mr-2 text-orange-400"></i>
              <span className="font-bold mr-1">{(parseFloat(ing.amount) * scale).toFixed(1)} {ing.unit}</span> {ing.name}
            </li>
          ))}
        </ul>
        <button onClick={() => onAddToShopping(recipe.ingredients)} className="w-full py-3 bg-slate-100 rounded-xl font-bold text-slate-600 mb-8">Añadir a la lista</button>
        <button onClick={() => setShowCooking(true)} className="fixed bottom-6 left-6 right-6 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl">Comenzar Cocina</button>
      </div>
      {showCooking && <CookingMode recipe={recipe} onClose={() => setShowCooking(false)} />}
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [tab, setTab] = useState('home');
  const [recipes, setRecipes] = useState<Recipe[]>(() => JSON.parse(localStorage.getItem('recipes') || '[]'));
  const [shopping, setShopping] = useState<ShoppingItem[]>(() => JSON.parse(localStorage.getItem('shopping') || '[]'));
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => localStorage.setItem('recipes', JSON.stringify(recipes)), [recipes]);
  useEffect(() => localStorage.setItem('shopping', JSON.stringify(shopping)), [shopping]);

  const handleImport = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    try {
      const data = await parseRecipeFromUrl(importUrl);
      const newRecipe: Recipe = {
        id: Math.random().toString(36).substr(2, 9),
        title: data.title || 'Receta Importada',
        sourceUrl: importUrl,
        thumbnail: data.thumbnail || '',
        category: data.category || 'General',
        ingredients: (data.ingredients || []).map((i: any) => ({ ...i, id: Math.random().toString(36).substr(2, 9) })),
        steps: (data.steps || []).map((s: any) => ({ ...s, id: Math.random().toString(36).substr(2, 9) })),
        prepTime: data.prepTime || 15,
        cookTime: data.cookTime || 20,
        difficulty: data.difficulty as Difficulty || Difficulty.BASIC,
        notes: data.notes || '',
        tags: data.tags || [],
        servings: data.servings || 2,
        createdAt: Date.now()
      };
      setRecipes([...recipes, newRecipe]);
      setImportUrl('');
      setTab('home');
    } catch (e) { alert("Error al importar"); }
    finally { setIsImporting(false); }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pt-safe pb-20">
      <header className="p-6 bg-white border-b sticky top-0 z-30">
        <h1 className="text-2xl font-black text-slate-800">Mi Recetario</h1>
      </header>

      <main className="flex-1 p-6">
        {tab === 'home' && (
          <div className="grid grid-cols-2 gap-4">
            {recipes.map(r => (
              <div key={r.id} onClick={() => setSelectedRecipe(r)} className="bg-white rounded-2xl overflow-hidden border shadow-sm">
                <img src={r.thumbnail || `https://picsum.photos/seed/${r.id}/300/200`} className="h-24 w-full object-cover" />
                <div className="p-3"><h3 className="font-bold text-xs truncate">{r.title}</h3></div>
              </div>
            ))}
            {recipes.length === 0 && <p className="col-span-2 text-center text-slate-400 mt-20">No hay recetas. ¡Importa una!</p>}
          </div>
        )}

        {tab === 'capture' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border shadow-sm text-center">
              <i className="fa-solid fa-wand-magic-sparkles text-3xl text-orange-500 mb-4"></i>
              <h2 className="font-bold text-xl mb-2">Importar con IA</h2>
              <input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="URL de TikTok o YouTube" className="w-full border-b-2 p-2 outline-none mb-4" />
              <button onClick={handleImport} disabled={isImporting} className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold">
                {isImporting ? 'Analizando...' : 'Procesar Enlace'}
              </button>
            </div>
          </div>
        )}

        {tab === 'shopping' && (
          <div className="space-y-2">
            <h2 className="text-xl font-bold mb-4">Lista de la Compra</h2>
            {shopping.map(item => (
              <div key={item.id} onClick={() => setShopping(shopping.map(s => s.id === item.id ? {...s, checked: !s.checked} : s))} className="flex items-center p-4 bg-white rounded-xl border">
                <i className={`fa-solid ${item.checked ? 'fa-check-circle text-green-500' : 'fa-circle text-slate-200'} mr-3`}></i>
                <span className={item.checked ? 'line-through text-slate-400' : ''}>{item.name} ({item.amount} {item.unit})</span>
              </div>
            ))}
            <button onClick={() => setShopping([])} className="text-red-500 font-bold text-xs mt-4">Borrar todo</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around h-16 items-center z-50">
        <button onClick={() => setTab('home')} className={tab === 'home' ? 'text-orange-500' : 'text-slate-400'}><i className="fa-solid fa-house"></i></button>
        <button onClick={() => setTab('capture')} className={tab === 'capture' ? 'text-orange-500' : 'text-slate-400'}><i className="fa-solid fa-plus-circle text-2xl"></i></button>
        <button onClick={() => setTab('shopping')} className={tab === 'shopping' ? 'text-orange-500' : 'text-slate-400'}><i className="fa-solid fa-cart-shopping"></i></button>
      </nav>

      {selectedRecipe && (
        <RecipeDetails 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)}
          onAddToShopping={(items: any) => {
            setShopping([...shopping, ...items.map((i: any) => ({...i, id: Math.random().toString(36).substr(2, 9), checked: false}))]);
            setTab('shopping');
            setSelectedRecipe(null);
          }}
        />
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
