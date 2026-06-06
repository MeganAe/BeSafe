import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { MealData } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud, Sparkles, AlertCircle, Apple, Flame, HelpCircle, UtensilsCrossed } from "lucide-react";

interface MealAnalyzerProps {
  user: User;
  country: string;
  goal: string;
  onMealAnalyzed: () => void;
}

export default function MealAnalyzer({ user, country, goal, onMealAnalyzed }: MealAnalyzerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [analysisResult, setAnalysisResult] = useState<MealData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction utilitaire pour compresser l'image à l'aide de HTML5 Canvas
  const compressAndSetImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Taille maximale raisonnable (ex: 800px)
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Réduction de la qualité JPEG à 0.6 pour une compression efficace ~70-150 Ko
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
          setSelectedImage(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        compressAndSetImage(file);
        setAnalysisResult(null);
      } else {
        alert("Veuillez déposer un fichier image valide (.png, .jpg, .jpeg, .webp)");
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        compressAndSetImage(file);
        setAnalysisResult(null);
      } else {
        alert("Veuillez sélectionner un fichier image valide");
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setLoadingMsg("Identification du plat principal sur l'image...");

    const messages = [
      "Numérisation de la texture et des aliments locaux (foufou, plantain, feuilles)...",
      "Évaluation de l'apport glycémique et des lipides...",
      "Calcul nutritionnel et formulation des conseils personnalisés..."
    ];

    let currentMsgIdx = 0;
    const intervalMsg = setInterval(() => {
      if (currentMsgIdx < messages.length) {
        setLoadingMsg(messages[currentMsgIdx]);
        currentMsgIdx++;
      }
    }, 2000);

    try {
      // Envoyer l'image Base64 compressée à notre proxy Express backend
      const response = await fetch("/api/gemini/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: "image/jpeg",
          country,
          goal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue lors de l'analyse du repas par l'IA.");
      }

      const parsedAnalysis = await response.json();

      const newMeal: MealData = {
        userId: user.uid,
        mealName: parsedAnalysis.mealName,
        calories: Number(parsedAnalysis.calories),
        nutritionalValue: parsedAnalysis.nutritionalValue,
        localIngredients: parsedAnalysis.localIngredients,
        suggestions: parsedAnalysis.suggestions,
        createdAt: new Date(),
        imagePreview: selectedImage // Optionnel, évite d'épuiser le quota firestore
      };

      // Enregistrer le plat analysé dans Firestore 
      const collectionPath = "meals";
      try {
        await addDoc(collection(db, collectionPath), {
          userId: newMeal.userId,
          mealName: newMeal.mealName,
          calories: newMeal.calories,
          nutritionalValue: newMeal.nutritionalValue,
          localIngredients: newMeal.localIngredients,
          suggestions: newMeal.suggestions,
          createdAt: serverTimestamp()
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, collectionPath);
      }

      setAnalysisResult(newMeal);
      onMealAnalyzed(); // Recharge l'historique sur le parent

    } catch (err: any) {
      console.error(err);
      alert("Erreur lors de l'analyse : " + err.message);
    } finally {
      clearInterval(intervalMsg);
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  return (
    <div className="w-full font-sans bg-white/95 p-5 md:p-6 rounded-3xl border border-green-100 shadow-lg shadow-green-200/40" id="meal_analyzer_container">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-display font-bold text-slate-800">
            Analyseur de Repas Intelligent
          </h2>
          <p className="text-xs text-slate-500">
            Prenez votre assiette en photo ! Notre IA BeSafe identifie l'apport calorique et équilibre les féculents locaux.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div
            key="analyzer_loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 px-6 bg-slate-900 text-white rounded-3xl border border-emerald-500/30 text-center relative overflow-hidden"
            id="meals_loading_screen"
          >
            {/* Visual scan container with horizontal sweeping laser bar */}
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-2xl mb-6 bg-black">
              {selectedImage && (
                <img 
                  src={selectedImage} 
                  alt="Scanning meal" 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
              )}
              
              {/* Laser sweeps up and down */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] z-20"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              />

              {/* Glowing overlay pulsation */}
              <motion.div
                className="absolute inset-0 bg-emerald-500/10 z-10 pointer-events-none"
                animate={{ opacity: [0.15, 0.35, 0.15] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />

              {/* Tech background matrix grid lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-widest">
                  Analyse Vision Active
                </span>
              </div>
              <motion.h4 
                key={loadingMsg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold text-slate-100 max-w-sm"
              >
                {loadingMsg}
              </motion.h4>
              <p className="text-[11px] text-emerald-300/70 mt-2 font-mono">
                Gemini explore les doses de manioc, de riz, d'huile et d'aliments locaux...
              </p>
            </div>
          </motion.div>
        ) : !selectedImage ? (
          /* Zone de Drop / Sélection Drag and Drop */
          <motion.div
            key="drag_drop_zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={`cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all duration-300 min-h-[190px] ${
              dragActive 
                ? "border-emerald-500 bg-emerald-50/50 scale-98" 
                : "border-slate-200 bg-white/30 hover:bg-white/60 hover:border-emerald-300"
            }`}
            id="upload_drop_zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="file_input"
            />
            <div className="p-3 bg-white/80 rounded-full border border-slate-100 shadow-sm text-emerald-500 mb-3 animate-pulse">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700 text-center">
              Glissez-déposez la photo de votre repas ici
            </p>
            <p className="text-[10px] text-slate-400 text-center mt-1">
              ou cliquez pour parcourir votre appareil
            </p>
            <div className="flex gap-2 flex-wrap justify-center mt-3.5">
              <span className="text-[9px] font-bold text-slate-500 bg-slate-150 px-2 py-1 rounded-md">Foufou</span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-150 px-2 py-1 rounded-md">Ndole</span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-150 px-2 py-1 rounded-md">Tcheb</span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-150 px-2 py-1 rounded-md">Sombé</span>
            </div>
          </motion.div>
        ) : !analysisResult ? (
          /* Image sélectionnée, prête à être analysée */
          <motion.div
            key="image_preview_state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col md:flex-row gap-5 p-4 bg-white/50 rounded-2xl border border-slate-100"
          >
            <div className="w-full md:w-1/2 aspect-video md:aspect-square rounded-xl overflow-hidden relative border border-slate-100 shadow-inner">
              <img 
                src={selectedImage} 
                alt="Repas à analyser" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                Image chargée avec succès
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                BeSafe est prêt à identifier la composition et les calories de votre repas. Nous intégrerons des ajustements sains liés au <strong>{country}</strong>.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAnalyze}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl shadow-md shadow-green-200 hover:shadow-lg transition-all duration-200"
                  id="btn_launch_analysis"
                >
                  Lancer l'analyse diététique
                </button>
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-medium rounded-xl transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Résultats de l'analyse nutritionnelle Gemini */
          <motion.div
            key="analysis_result"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Cartographie de l'image & Calories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="meals_results">
              <div className="md:col-span-1 aspect-video md:aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative">
                <img 
                  src={selectedImage} 
                  alt="Analyse du repas" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:col-span-2 flex flex-col justify-between bg-white/70 p-4.5 rounded-2xl border border-slate-50 shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                      Analyse Complétée
                    </span>
                    <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2.5 py-1 rounded-xl">
                      <Flame className="w-3.5 h-3.5 fill-orange-500" />
                      <span className="text-xs font-bold leading-none">{analysisResult.calories} kcal</span>
                    </div>
                  </div>
                  <h3 className="text-base font-display font-bold text-slate-800 mb-1">
                    {analysisResult.mealName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-800 underline block mb-1">
                    Valeur nutritionnelle estimée :
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {analysisResult.nutritionalValue}
                  </p>
                </div>
                {analysisResult.localIngredients && (
                  <div className="text-[10px] bg-slate-50 p-2 rounded-xl text-slate-500 border border-slate-100">
                    <span className="font-bold text-slate-700">Ingrédients identifiés : </span>
                    {analysisResult.localIngredients}
                  </div>
                )}
              </div>
            </div>

            {/* Conseils d'optimisation / suggestions saines */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
              <div className="flex gap-2">
                <div className="p-1.5 bg-green-500 text-white h-7 w-7 rounded-lg flex items-center justify-center shadow-md shadow-green-100">
                  <Apple className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    Suggestions d'amélioration BeSafe
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysisResult.suggestions}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-full shadow-md shadow-green-200 hover:shadow-lg transition-all duration-200"
                id="btn_next_analysis"
              >
                Analyser un autre repas
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
