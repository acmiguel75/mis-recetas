
import React, { useState, useMemo } from 'react';
import { useRecipes } from './store/useRecipes';
import { Recipe, Difficulty, Ingredient, ShoppingItem } from './types';
import { parseRecipeFromUrl } from './services/geminiService';
import BottomNav from './components/BottomNav';
import RecipeCard from './components/RecipeCard';
import RecipeDetails from './components/RecipeDetails';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const { 
    recipes, 
    addRecipe, 
    updateRecipe, 
    deleteRecipe,
    shoppingList,
    addToShoppingList,
    toggleShoppingItem,
    clearShoppingList
  } = useRecipes();

  const handleImport = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    try {
      const parsedData = await parseRecipeFromUrl(importUrl);
      const newRecipe: Recipe = {
        id: Math.random().toString(36).substr(2, 9),
        title: parsedData.title || 'Nueva Receta',
        sourceUrl: importUrl,
        thumbnail: parsedData.thumbnail || '',
        category: parsedData.category || 'Varios',
        ingredients: (parsedData.ingredients || []).map((ing: any) => ({
          ...ing,
          id: Math.random().toString(36).substr(2, 9),
          checked: false
        })),
        steps: (parsedData.steps || []).map((step: any) => ({
          ...step,
          id: Math.random().toString(36).substr(2, 9),
          completed: false
        })),
        prepTime: parsedData.prepTime || 10,
        cookTime: parsedData.cookTime || 20,
        difficulty: parsedData.difficulty as Difficulty || Difficulty.BASIC,
        notes: parsedData.notes || '',
        tags: parsedData.tags || [],
        servings: parsedData.servings || 2,
        createdAt: Date.now()
      };
      addRecipe(newRecipe);
      setImportUrl('');
      setCurrentTab('home');
    } catch (err) {
      alert("Error al importar la receta. Intenta de nuevo.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddIngredientsToShopping = (ingredients: Ingredient[]) => {
    const newItems: ShoppingItem[] = ingredients.map(ing => ({
      id: Math.random().toString(36).substr(2, 9),
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      checked: false
    }));
    addToShoppingList(newItems);
  };

  const categories = useMemo(() => {
    const cats = ['Todos', ...Array.from(new Set(recipes.map(r => r.category)))];
    return cats;
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.ingredients.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = selectedCategory === 'Todos' || r.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [recipes, searchTerm, selectedCategory]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col pb-20 relative overflow-x-hidden pt-safe">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 bg-white border-b border-slate-100 shadow-sm">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Mi Recetario</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pixel Edition</p>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 p-6">
        {currentTab === 'home' && (
          <div className="space-y-6">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="text" 
                placeholder="Buscar por nombre o ingrediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10"
              />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    selectedCategory === cat ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-slate-500 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {filteredRecipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    onClick={setSelectedRecipe} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <i className="fa-solid fa-book-open text-3xl"></i>
                </div>
                <p className="text-slate-400 text-sm">No tienes recetas aún.</p>
                <button 
                  onClick={() => setCurrentTab('capture')}
                  className="mt-4 text-orange-600 font-bold text-sm"
                >
                  Importar mi primera receta
                </button>
              </div>
            )}
          </div>
        )}

        {currentTab === 'capture' && (
          <div className="flex flex-col space-y-6 pt-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-link text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Importar Receta</h2>
              <p className="text-sm text-slate-400 mt-1 px-4">Pega un enlace para que nuestra IA analice el video automáticamente.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">URL del video</label>
                <input 
                  type="text" 
                  placeholder="https://tiktok.com/@chef/video/..." 
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="w-full border-b-2 border-slate-100 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button 
                  onClick={handleImport}
                  disabled={isImporting || !importUrl}
                  className={`w-full mt-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 ${
                    isImporting || !importUrl 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-orange-600 text-white shadow-xl shadow-orange-200 transform active:scale-95'
                  }`}
                >
                  {isImporting ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      <span>Analizar con IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'shopping' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Lista de Compras</h2>
              <button onClick={clearShoppingList} className="text-slate-400 text-xs font-bold">Limpiar</button>
            </div>
            {shoppingList.length > 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                {shoppingList.map((item) => (
                  <div key={item.id} className="flex items-center p-5 border-b border-slate-50 last:border-0" onClick={() => toggleShoppingItem(item.id)}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 ${item.checked ? 'bg-green-500 border-green-500 text-white' : 'border-slate-200'}`}>
                      <i className="fa-solid fa-check text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{item.amount} {item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 opacity-30">
                <i className="fa-solid fa-basket-shopping text-5xl mb-3"></i>
                <p className="text-sm">Lista vacía</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'planner' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Planificador</h2>
            <div className="space-y-3">
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                <div key={day} className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center active:bg-slate-50">
                  <span className="text-sm font-bold text-slate-600">{day}</span>
                  <i className="fa-solid fa-plus text-slate-300 text-xs"></i>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="space-y-8 py-4 text-center">
             <div className="relative inline-block">
                <img src="https://picsum.photos/seed/user/200/200" className="w-24 h-24 rounded-full border-4 border-white shadow-xl mx-auto" alt="Profile" />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 text-white rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-camera text-[10px]"></i>
                </div>
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-800">Usuario Pixel</h2>
                <p className="text-slate-400 text-sm font-medium">Chef Aficionado</p>
             </div>
             <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 text-left">
                {[
                  { icon: 'fa-gear', label: 'Configuración', color: 'text-slate-400' },
                  { icon: 'fa-cloud-arrow-up', label: 'Sincronización Cloud', color: 'text-blue-500' },
                  { icon: 'fa-crown', label: 'Premium Pixel', color: 'text-orange-500' },
                  { icon: 'fa-file-pdf', label: 'Exportar PDF', color: 'text-red-500' }
                ].map((item, idx) => (
                  <button key={idx} className="w-full p-5 flex items-center justify-between border-b border-slate-50 last:border-0 active:bg-slate-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center ${item.color}`}>
                        <i className={`fa-solid ${item.icon}`}></i>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-300 text-xs"></i>
                  </button>
                ))}
             </div>
          </div>
        )}
      </main>

      <BottomNav currentTab={currentTab} setTab={setCurrentTab} />

      {selectedRecipe && (
        <RecipeDetails 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)}
          onUpdate={(updated) => {
            updateRecipe(updated.id, updated);
            setSelectedRecipe(updated);
          }}
          onAddToShopping={handleAddIngredientsToShopping}
        />
      )}
    </div>
  );
};

export default App;
