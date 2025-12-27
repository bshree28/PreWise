
import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { RecipeView } from './components/RecipeView';
import { AppState, AnalysisResponse } from './types';
import { analyzeIngredients, generateDishImage } from './services/geminiService';
// Removed ShutterIcon as it is not exported by lucide-react
import { Camera, Upload, Loader2, Sparkles, X, ImageIcon, Zap, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setState('CAMERA_PREVIEW');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please check permissions or upload a photo instead.");
      setState('IDLE');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
        processImage(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setState('SCANNING');
    setError(null);
    try {
      const data = await analyzeIngredients(base64);
      setResults(data);
      
      setState('GENERATING_IMAGES');
      const recipesWithImages = await Promise.all(
        data.recipes.map(async (recipe) => {
          const imageUrl = await generateDishImage(recipe.name, recipe.description);
          return { ...recipe, imageUrl };
        })
      );

      setResults({
        ...data,
        recipes: recipesWithImages
      });
      
      setState('RESULTS');
    } catch (err: any) {
      console.error(err);
      setError("Analysis failed. Please ensure your ingredients are clearly visible and try again.");
      setState('IDLE');
    }
  };

  const reset = () => {
    stopCamera();
    setState('IDLE');
    setImage(null);
    setResults(null);
    setError(null);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <Layout>
      {state === 'IDLE' && (
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="mb-12 animate-in fade-in zoom-in duration-1000">
            <h2 className="text-5xl md:text-6xl font-black font-outfit mb-6 tracking-tight leading-tight">
              AI Vision for the <br />
              <span className="gradient-text">Connected Kitchen</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Scan your ingredients using your smart device's camera. Lumina AR identifies items and curates professional recipes tailored to your pantry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div 
              onClick={startCamera}
              className="glass-morphism rounded-3xl p-10 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-24 h-24 text-blue-400" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold font-outfit mb-2">Scan Items</h3>
              <p className="text-sm text-slate-400">Launch AR viewfinder to identify ingredients in real-time.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                Start Live Scan <Zap className="w-3 h-3" />
              </div>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="glass-morphism rounded-3xl p-10 border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Upload className="w-24 h-24 text-purple-400" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold font-outfit mb-2">Upload Image</h3>
              <p className="text-sm text-slate-400">Select a high-resolution photo from your device library.</p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
                Browse Files
              </div>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-2 justify-center animate-in shake duration-500 max-w-md mx-auto">
              <X className="w-4 h-4" /> {error}
            </div>
          )}
        </div>
      )}

      {state === 'CAMERA_PREVIEW' && (
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6">
            <button 
              onClick={reset}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" /> Back to menu
            </button>
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-mono font-bold uppercase tracking-[0.2em] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
              Live Feed Active
            </div>
          </div>

          <div className="relative w-full max-w-2xl aspect-[4/3] rounded-3xl overflow-hidden ar-border glass-morphism bg-black shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="scanline" />
            
            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none"></div>
            
            {/* HUD Elements */}
            <div className="absolute top-8 left-8 p-3 bg-black/40 backdrop-blur-md rounded border border-blue-500/30 text-[10px] font-mono text-blue-400 uppercase tracking-wider">
              Mode: OBJECT_RECOGNITION_v2.1<br />
              Status: CALIBRATED<br />
              Coords: 37.7749° N, 122.4194° W
            </div>

            <div className="absolute bottom-8 right-8 p-3 bg-black/40 backdrop-blur-md rounded border border-blue-500/30 text-[10px] font-mono text-blue-400 text-right uppercase tracking-wider">
              Signal: 5G_ENCRYPTED<br />
              Battery: 84%<br />
              LUMINA_CORE: SYNCED
            </div>

            {/* Target Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
              <div className="w-12 h-12 border-2 border-blue-400/50 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              </div>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <button 
            onClick={capturePhoto}
            className="mt-10 group relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/20 p-1 hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-lg">
                <div className="w-16 h-16 rounded-full border-2 border-black/5 flex items-center justify-center">
                   <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white">
                     <Camera className="w-6 h-6" />
                   </div>
                </div>
              </div>
            </div>
            <span className="absolute -bottom-8 text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Capture Ingredients</span>
          </button>
        </div>
      )}

      {state === 'SCANNING' && (
        <div className="flex flex-col items-center justify-center py-20 space-y-12">
          <div className="relative w-full max-w-2xl aspect-[4/3] rounded-3xl overflow-hidden ar-border glass-morphism">
            {image && (
              <img src={image} className="w-full h-full object-cover opacity-60 grayscale" alt="Scanning" />
            )}
            <div className="scanline" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
              <div className="p-4 bg-blue-600/20 rounded-full border border-blue-400/30 animate-pulse">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              </div>
              <div className="text-center space-y-2 px-6">
                <h3 className="text-2xl font-bold font-outfit tracking-wide text-white uppercase">Neural Engine Active</h3>
                <p className="text-blue-400 font-mono text-sm tracking-tighter">IDENTIFYING INGREDIENTS... MAPPING FLAVOR PROFILES...</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center text-slate-500">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <p className="text-sm font-medium italic">"Matching detected elements with 450,000+ culinary pairings..."</p>
          </div>
        </div>
      )}

      {state === 'GENERATING_IMAGES' && (
        <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in fade-in duration-500">
          <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden glass-morphism border border-purple-500/30 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 animate-bounce">
              <ImageIcon className="text-purple-400 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-outfit text-white mb-2">Visualizing Culinary Results</h3>
            <p className="text-slate-400 text-sm">Generating AI visualizations for your personalized recipes...</p>
            <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
            </div>
          </div>
        </div>
      )}

      {state === 'RESULTS' && results && image && (
        <RecipeView data={results} image={image} onReset={reset} />
      )}
    </Layout>
  );
};

export default App;
