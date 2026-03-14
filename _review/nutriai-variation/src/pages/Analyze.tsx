import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Upload, Camera, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function Analyze() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logged, setLogged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      // Extract base64 data
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            }
          },
          "Analyze this food image. Provide a title, estimated total calories, macronutrients (protein, carbs, fat in grams), and a brief list of visible ingredients. Return ONLY a valid JSON object."
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              ingredients: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "calories", "protein", "carbs", "fat", "ingredients"]
          }
        }
      });

      if (response.text) {
        setResult(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logMeal = () => {
    setLogged(true);
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-md mx-auto"
    >
      <header className="mb-8">
        <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold mb-1">Feature</h2>
        <h1 className="text-3xl font-bold">Analyze Image</h1>
      </header>

      {!image ? (
        <div 
          className="aspect-[4/5] rounded-3xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-4 bg-zinc-900/30 cursor-pointer hover:bg-zinc-900/80 hover:border-zinc-600 transition-all active:scale-[0.98]"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-20 h-20 rounded-3xl bg-zinc-800 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
            <Camera size={40} strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">Tap to upload</p>
            <p className="text-sm text-zinc-500">Take a photo of your meal</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
            <img src={image} alt="Uploaded meal" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <button 
              onClick={() => { setImage(null); setResult(null); }}
              className="absolute top-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <Upload size={20} />
            </button>
          </div>

          {!result && (
            <button 
              onClick={analyzeImage}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20"
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Analyzing...</>
              ) : (
                <><Info /> Analyze Meal</>
              )}
            </button>
          )}

          {result && (
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-6 border border-zinc-800/50 space-y-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
              <div>
                <h3 className="text-3xl font-black">{result.title}</h3>
                <p className="text-emerald-400 font-black text-2xl mt-1">{result.calories} kcal</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Protein</p>
                  <p className="font-bold text-lg text-emerald-400">{result.protein}g</p>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Carbs</p>
                  <p className="font-bold text-lg text-blue-400">{result.carbs}g</p>
                </div>
                <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-1">Fat</p>
                  <p className="font-bold text-lg text-amber-400">{result.fat}g</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3">Detected Ingredients</h4>
                <ul className="space-y-2">
                  {result.ingredients.map((ing: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={logMeal}
                disabled={logged}
                className="w-full py-4 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-80 transition-all"
              >
                {logged ? (
                  <><CheckCircle2 /> Logged Successfully</>
                ) : (
                  <>Log to Journal</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
    </motion.div>
  );
}
