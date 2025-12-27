
import React, { useState, useMemo } from 'react';
import { AnalysisResponse, Recipe } from '../types';
import { 
  CheckCircle2, 
  ShoppingCart, 
  Flame, 
  Clock, 
  Gauge, 
  ListChecks, 
  ArrowLeft, 
  Target, 
  Eye, 
  Cookie, 
  Utensils, 
  Sandwich, 
  ChefHat, 
  Sparkles, 
  ChevronRight,
  Info,
  Box,
  Monitor
} from 'lucide-react';

interface RecipeViewProps {
  data: AnalysisResponse;
  image: string;
  onReset: () => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'Sweet': return <Cookie className="w-5 h-5" />;
    case 'Snack': return <Sandwich className="w-5 h-5" />;
    default: return <Utensils className="w-5 h-5" />;
  }
};

const CategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'Sweet': return 'bg-pink-500/80 border-pink-400/30 shadow-pink-500/20';
    case 'Snack': return 'bg-yellow-600/80 border-yellow-400/30 shadow-yellow-500/20';
    default: return 'bg-blue-600/80 border-blue-400/30 shadow-blue-500/20';
  }
};

export const RecipeView: React.FC<RecipeViewProps> = ({ data, image, onReset }) => {
  const [activeCategory, setActiveCategory] = useState<'Main' | 'Snack' | 'Sweet'>('Main');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Filter recipes by active category
  const filteredRecipes = useMemo(() => {
    return data.recipes.filter(r => r.category === activeCategory);
  }, [data.recipes, activeCategory]);

  // Logic to determine which recipe ingredients were in the original scan
  const matchedIngredients = useMemo(() => {
    if (!selectedRecipe) return [];
    const detected = data.detectedIngredients.map(i => i.toLowerCase());
    return selectedRecipe.ingredients.filter(recipeIng => 
      detected.some(d => recipeIng.toLowerCase().includes(d) || d.includes(recipeIng.toLowerCase()))
    );
  }, [selectedRecipe, data.detectedIngredients]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-1000">
      
      {/* LEVEL 1: DETECTED INGREDIENTS (CONFIRMATION LAYER) */}
      <section className="glass-morphism rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-500/30 shadow-inner">
              <ListChecks className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">AR Object Detection</p>
              <h3 className="text-2xl font-black font-outfit text-white">
                {data.detectedIngredients.length} <span className="text-blue-400">Items Identified</span>
              </h3>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 max-w-2xl">
            {data.detectedIngredients.map((ing, i) => (
              <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300 flex items-center gap-2 group hover:bg-white/10 hover:border-blue-400/30 transition-all cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40 group-hover:bg-blue-400 transition-colors"></div>
                {ing}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* VIEWPORT TOGGLE: MENU VS DETAIL */}
      {!selectedRecipe ? (
        <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
          
          {/* LEVEL 2: CATEGORY NAVIGATION */}
          <section className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
              <h4 className="font-outfit font-bold uppercase tracking-widest text-[11px] text-slate-400">Mode Selection</h4>
            </div>
            
            <div className="flex p-1.5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
              {(['Main', 'Snack', 'Sweet'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 font-outfit text-xs font-bold tracking-widest uppercase ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 ring-1 ring-white/20 scale-105' 
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <CategoryIcon category={cat} />
                  {cat}
                </button>
              ))}
            </div>
            
            <button onClick={onReset} className="text-[10px] font-bold text-blue-400/60 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2 group">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Re-scan
            </button>
          </section>

          {/* LEVEL 3: VISUAL RECIPE GRID (THE DEFAULT VIEW) */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe, idx) => (
              <div 
                key={idx}
                className="glass-morphism rounded-[3rem] overflow-hidden border border-white/10 flex flex-col hover:border-blue-500/50 hover:shadow-3xl hover:shadow-blue-900/20 transition-all duration-700 group cursor-pointer"
                onClick={() => setSelectedRecipe(recipe)}
              >
                {/* Image Component */}
                <div className="relative h-64 overflow-hidden">
                  {recipe.imageUrl ? (
                    <img 
                      src={recipe.imageUrl} 
                      alt={recipe.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-slate-800 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                  
                  {/* AR Meta Overlay */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black text-white border shadow-xl ${CategoryBadgeColor(recipe.category)} uppercase tracking-widest`}>
                      <CategoryIcon category={recipe.category} /> {recipe.category}
                    </span>
                  </div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex justify-between items-end">
                      <h5 className="text-2xl font-bold font-outfit text-white group-hover:text-blue-400 transition-colors">{recipe.name}</h5>
                    </div>
                  </div>
                </div>

                {/* Info Block */}
                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{recipe.prepTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Gauge className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{recipe.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{recipe.nutrition.calories} Cal</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{recipe.description}</p>
                  
                  <div className="pt-2">
                    <div className="w-full py-4 bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-600 group-hover:border-blue-400 text-blue-400 group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2">
                      Initialize Recipe <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : (
        /* LEVEL 4: VIEW RECIPE (DETAIL VIEW INTERFACE) */
        <div className="space-y-12 animate-in fade-in slide-in-from-right-12 duration-1000">
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={() => setSelectedRecipe(null)}
              className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.3em] group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> System: Menu Return
            </button>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-blue-400/40 uppercase tracking-[0.3em]">REC_ID: {selectedRecipe.name.substring(0,3).toUpperCase()}94X</span>
              <div className="px-3 py-1 bg-blue-500/20 rounded border border-blue-500/30 text-[9px] font-mono text-blue-400 animate-pulse uppercase">Active Link</div>
            </div>
          </div>

          <div className="glass-morphism rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl">
            {/* Visual Header */}
            <div className="relative h-[500px] w-full bg-slate-800">
              {selectedRecipe.imageUrl ? (
                <img src={selectedRecipe.imageUrl} alt={selectedRecipe.name} className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
              <div className="absolute top-12 left-12 right-12 flex justify-between items-start">
                 <div className={`px-4 py-2 rounded-xl text-xs font-bold text-white border backdrop-blur-md ${CategoryBadgeColor(selectedRecipe.category)} uppercase tracking-widest`}>
                    {selectedRecipe.category}
                 </div>
                 <div className="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Recipe Diff_Index</p>
                    <p className="text-xl font-bold font-outfit text-white">{selectedRecipe.difficulty}</p>
                 </div>
              </div>
              <div className="absolute bottom-12 left-12 right-12">
                <h2 className="text-5xl md:text-8xl font-black font-outfit text-white leading-tight mb-4 drop-shadow-2xl">{selectedRecipe.name}</h2>
                <div className="flex gap-8">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Duration</span>
                      <span className="text-xl font-bold font-outfit text-blue-400">{selectedRecipe.prepTime}</span>
                   </div>
                   <div className="flex flex-col border-l border-white/10 pl-8">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Energy Count</span>
                      <span className="text-xl font-bold font-outfit text-orange-400">{selectedRecipe.nutrition.calories} Cal</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-12 md:p-20 grid grid-cols-1 lg:grid-cols-12 gap-20">
              {/* Left Column: Core Data */}
              <div className="lg:col-span-7 space-y-16">
                <div className="space-y-8">
                  <h4 className="font-outfit font-bold uppercase tracking-[0.4em] text-[11px] text-blue-400 flex items-center gap-6">
                    <span className="flex-shrink-0">Hardware Map: Ingredients</span>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-blue-500/30 to-transparent"></div>
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedRecipe.ingredients.map((ing, idx) => {
                      const isMatched = matchedIngredients.includes(ing);
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-700 ${
                            isMatched 
                            ? 'bg-blue-600/10 border-blue-500/40 text-blue-100 ring-1 ring-blue-500/20' 
                            : 'bg-white/5 border-white/10 text-slate-500 opacity-60'
                          }`}
                        >
                          {isMatched && <Target className="w-4 h-4 text-blue-400" />}
                          <span className={`text-sm ${isMatched ? 'font-bold' : 'font-medium'}`}>{ing}</span>
                          {isMatched && <span className="text-[9px] bg-blue-500/40 text-blue-200 px-2 py-0.5 rounded font-mono uppercase font-black ml-2 tracking-tighter shadow-lg">Stock Match</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-10">
                  <h4 className="font-outfit font-bold uppercase tracking-[0.4em] text-[11px] text-slate-500 flex items-center gap-6">
                    <span className="flex-shrink-0">Action Protocol</span>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent"></div>
                  </h4>
                  <div className="space-y-12 relative">
                    <div className="absolute left-6 top-6 bottom-6 w-px bg-white/5"></div>
                    {selectedRecipe.steps.map((step, i) => (
                      <div key={i} className="flex gap-10 group relative">
                        <div className="flex-shrink-0 w-12 h-12 rounded-[1.25rem] bg-slate-900 border border-white/10 flex items-center justify-center text-sm font-black text-white group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all z-10">
                          {i + 1}
                        </div>
                        <div className="pt-3">
                           <p className="text-slate-300 text-xl leading-relaxed group-hover:text-white transition-colors">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AR Context & Metrics */}
              <div className="lg:col-span-5 space-y-16">
                {/* Visual Reference AR Window */}
                <div className="space-y-6">
                   <h4 className="font-outfit font-bold uppercase tracking-[0.4em] text-[11px] text-slate-500">Scan Reference</h4>
                   <div className="rounded-[3rem] overflow-hidden border border-white/10 bg-slate-900 aspect-[4/3] relative group">
                      <img src={image} alt="Original Scan" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000 scale-105" />
                      <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                         <Monitor className="w-16 h-16 text-blue-400 mb-2 animate-pulse" />
                         <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Tracking Active</span>
                      </div>
                      <div className="absolute top-6 right-6 px-3 py-1 bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 text-[9px] font-mono text-blue-400 uppercase">
                         Frame::4992-K
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                  <h4 className="font-outfit font-bold uppercase tracking-[0.4em] text-[11px] text-purple-400">Nutritional Diagnostics</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'Protein', value: selectedRecipe.nutrition.protein, color: 'text-blue-400', bar: 'bg-blue-500' },
                      { label: 'Carbs', value: selectedRecipe.nutrition.carbs, color: 'text-green-400', bar: 'bg-green-500' },
                      { label: 'Fat', value: selectedRecipe.nutrition.fat, color: 'text-yellow-400', bar: 'bg-yellow-500' },
                      { label: 'Calories', value: selectedRecipe.nutrition.calories, color: 'text-orange-400', bar: 'bg-orange-500' }
                    ].map((n, i) => (
                      <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 group hover:border-white/20 transition-all">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{n.label}</p>
                        <p className={`text-3xl font-black font-outfit mb-4 ${n.color}`}>{n.value}</p>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${n.bar} w-1/2 opacity-30 group-hover:opacity-100 transition-all`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-10 rounded-[3rem] bg-gradient-to-br from-blue-600/30 via-blue-900/10 to-transparent border border-blue-500/30 shadow-3xl text-center space-y-8 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                  <div className="w-20 h-20 bg-blue-600/20 rounded-[2rem] flex items-center justify-center mx-auto border border-blue-500/30 group-hover:rotate-12 transition-transform shadow-2xl">
                     <Monitor className="w-10 h-10 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="text-white font-black font-outfit text-2xl mb-3 uppercase tracking-wider">Sync Environment</h5>
                    <p className="text-sm text-blue-200/60 leading-relaxed px-6 font-medium">Transmit formulation metadata to Lumina Surface Hub for spatial AR cooking guidance.</p>
                  </div>
                  <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.4em] transition-all shadow-2xl shadow-blue-900/50 hover:scale-105 active:scale-95">
                    Initialize Spatial Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 5: GLOBAL LOGISTICS (SHOPPING LIST FOOTER) */}
      <section className="glass-morphism rounded-[3.5rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
          <ShoppingCart className="w-96 h-96 text-white" />
        </div>
        
        <div className="max-w-5xl space-y-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="p-6 bg-blue-600/20 rounded-[2rem] border border-blue-500/30 shadow-2xl">
              <ShoppingCart className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-2">Supply Chain Audit</p>
              <h3 className="text-4xl font-black font-outfit text-white leading-tight">Consolidated Procurement</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.shoppingList.map((item, i) => (
              <div key={i} className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all group cursor-pointer">
                <div className="w-7 h-7 rounded-xl border-2 border-slate-800 flex-shrink-0 group-hover:border-blue-500/50 transition-colors flex items-center justify-center relative">
                  <div className="w-2 h-2 rounded-sm bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-slate-300 text-sm font-bold group-hover:text-white transition-colors uppercase tracking-widest">{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-10 flex flex-col sm:flex-row gap-6">
            <button className="flex-1 py-5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:shadow-xl active:scale-95">
              Transmit to Personal Device
            </button>
            <button className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all active:scale-95">
              Sync with Home Inventory
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER METADATA */}
      <div className="flex flex-col items-center gap-6 pt-16">
         <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900/80 backdrop-blur-xl text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] border border-white/5">
            <Box className="w-4 h-4 text-blue-500/40" /> 
            Protocol: LIFESTYLE_SYNC_v2 • Node: KITCHEN_LUMINA
         </div>
         <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.4em]">Proprietary Interface • Demo Environment</p>
      </div>
    </div>
  );
};
