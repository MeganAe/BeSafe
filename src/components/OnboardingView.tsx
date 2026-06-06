import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { ProfileData } from "../types";
import { translations } from "../lib/translations";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, ArrowLeft, HeartPulse, UserCircle, Activity, 
  MapPin, ClipboardList, Utensils, Award, Sparkles 
} from "lucide-react";

interface OnboardingViewProps {
  user: User;
  onComplete: (profile: ProfileData) => void;
  lang: 'fr' | 'en';
  setLang: (lang: 'fr' | 'en') => void;
}

export default function OnboardingView({ user, onComplete, lang, setLang }: OnboardingViewProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  // États du formulaire
  const [age, setAge] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [country, setCountry] = useState<string>("Sénégal");
  const [diet, setDiet] = useState<string>("");
  const [physicalActivity, setPhysicalActivity] = useState<string>("Modérée");
  const [history, setHistory] = useState<string>("Aucun antécédent");
  const [goal, setGoal] = useState<string>("Perdre du poids et manger équilibré");

  const t = translations[lang];

  // Ajuster le pays et options de base lors du changement de langue
  useEffect(() => {
    if (lang === "en") {
      if (country === "Sénégal") setCountry("Senegal");
      if (physicalActivity === "Modérée") setPhysicalActivity("Modérée"); // value stored matching db values
      if (history === "Aucun antécédent") setHistory("Aucun antécédent");
      if (goal === "Perdre du poids et manger équilibré") setGoal("Perdre du poids et affiner ma silhouette");
    } else {
      if (country === "Senegal") setCountry("Sénégal");
    }
  }, [lang]);

  const commonCountries = lang === "en" ? [
    "Senegal", "Ivory Coast", "Cameroon", "Democratic Republic of Congo", 
    "Gabon", "France", "Benin", "Togo", "Mali", "Guinea", "Congo-Brazzaville", 
    "Burkina Faso", "Belgium", "Canada"
  ] : [
    "Sénégal", "Côte d'Ivoire", "Cameroun", "République Démocratique du Congo", 
    "Gabon", "France", "Bénin", "Togo", "Mali", "Guinée", "Congo-Brazzaville", 
    "Burkina Faso", "Belgique", "Canada"
  ];

  const handleNext = () => {
    if (step < 9) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    setLoadingMsg(t.onboarding.loaderTitle);

    const steps = t.onboarding.loaderSteps;

    let currentStepIndex = 0;
    const interval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setLoadingMsg(steps[currentStepIndex]);
        currentStepIndex++;
      }
    }, 1800);

    try {
      // Appel à l'API de notre serveur Express qui proxy le Gemini SDK (avec langue passée)
      const response = await fetch("/api/gemini/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(age),
          weight: Number(weight),
          height: Number(height),
          country,
          diet,
          physicalActivity,
          history,
          goal,
          language: lang
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (lang === "en" ? "An error occurred with Gemini." : "Une erreur est survenue lors de l'appel Gemini."));
      }

      const lAssement = await response.json();

      // Construction de l'objet profil à enregistrer dans Firestore
      const newProfile: ProfileData & { language: string } = {
        userId: user.uid,
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        country,
        diet,
        physicalActivity,
        history,
        goal,
        healthScore: lAssement.healthScore,
        diabetesRisk: lAssement.diabetesRisk,
        hypertensionRisk: lAssement.hypertensionRisk,
        dietQuality: lAssement.dietQuality,
        recommendations: lAssement.recommendations,
        createdAt: new Date(),
        language: lang,
      };

      // Sauvegarde dans Firestore de l'utilisateur connecté
      const path = `profiles/${user.uid}`;
      try {
        await setDoc(doc(db, "profiles", user.uid), {
          ...newProfile,
          createdAt: serverTimestamp()
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }

      clearInterval(interval);
      onComplete(newProfile);

    } catch (error: any) {
      console.error(error);
      alert((lang === "en" ? "Error during onboarding: " : "Erreur lors de l'onboarding : ") + error.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const progressPercent = (step / 9) * 100;

  return (
    <div className="w-full max-w-xl mx-auto my-8 px-4 font-sans" id="onboarding_section">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="onboarding_loader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel p-8 rounded-3xl shadow-xl border-dashed border border-emerald-300 text-center flex flex-col items-center justify-center min-h-[380px]"
            id="loader_screen"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
              <HeartPulse className="w-8 h-8 text-emerald-500 animate-bounce absolute top-4 left-4" />
            </div>
            <motion.h3 
              key={loadingMsg}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-bold text-slate-800"
            >
              {loadingMsg}
            </motion.h3>
            <p className="text-slate-400 text-xs mt-3 max-w-xs">
              {t.onboarding.loaderSub}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-6 md:p-8 rounded-3xl shadow-lg border border-white"
          >
            {/* Barre de Progression */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold mb-2">
                <span className="text-gradient">{t.onboarding.title}</span>
                <span>{t.onboarding.question} {step} / 9</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                />
              </div>
            </div>

            {/* Questions du Formulaire */}
            <div className="min-h-[220px]">
              
              {/* Étape 1 : Choix de la langue */}
              {step === 1 && (
                <div id="step_language">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-display font-bold text-slate-800">
                      {t.onboarding.stepLangTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    {t.onboarding.stepLangDesc}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setLang('fr')}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                        lang === 'fr' 
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100'
                          : 'border-slate-100 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-3xl mb-2">🇫🇷</span>
                      <span className={`text-xs font-bold ${lang === 'fr' ? 'text-emerald-800' : 'text-slate-600'}`}>Français</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                        lang === 'en' 
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100'
                          : 'border-slate-100 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-3xl mb-2">🇬🇧</span>
                      <span className={`text-xs font-bold ${lang === 'en' ? 'text-emerald-800' : 'text-slate-600'}`}>English</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 2 : Âge */}
              {step === 2 && (
                <div id="step_age">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCircle className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-display font-bold text-slate-800">
                      {t.onboarding.stepAgeTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    {t.onboarding.stepAgeDesc}
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={t.onboarding.stepAgePlaceholder}
                    className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-800 font-sans font-medium text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    id="input_age"
                  />
                </div>
              )}

              {/* Étape 3 : Corpulence */}
              {step === 3 && (
                <div id="step_weight_height">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-display font-bold text-slate-800">
                      {t.onboarding.stepCorpTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    {t.onboarding.stepCorpDesc}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                        {t.onboarding.stepCorpWeight}
                      </label>
                      <input
                        type="number"
                        min="20"
                        max="300"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Ex: 75"
                        className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-800 font-semibold text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                        id="input_weight"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                        {t.onboarding.stepCorpHeight}
                      </label>
                      <input
                        type="number"
                        min="90"
                        max="250"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="Ex: 178"
                        className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-800 font-semibold text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                        id="input_height"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 4 : Pays */}
              {step === 4 && (
                <div id="step_country">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-display font-bold text-slate-800">
                      {t.onboarding.stepCountryTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    {t.onboarding.stepCountryDesc}
                  </p>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-800 font-sans font-semibold text-sm focus:outline-none focus:border-emerald-400"
                    id="input_country"
                  >
                    {commonCountries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Étape 5 : Alimentation typique */}
              {step === 5 && (
                <div id="step_diet">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-display font-bold text-slate-800">
                      {t.onboarding.stepDietTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    {t.onboarding.stepDietDesc}
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1 mb-3">
                    {t.onboarding.suggestedDiets.map((dietOption, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDiet(dietOption.value)}
                        className={`text-left text-xs p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                          diet === dietOption.value 
                            ? "bg-green-50 border-green-500 font-bold text-green-800 shadow-sm shadow-green-100" 
                            : "bg-white/70 border-green-100 hover:bg-green-50/30 text-slate-600 hover:border-green-300"
                        }`}
                      >
                        {dietOption.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    placeholder={t.onboarding.stepDietPlaceholder}
                    className="w-full h-16 p-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-600 text-xs focus:outline-none focus:border-emerald-400 transition-all"
                    id="input_diet_text"
                  />
                </div>
              )}

              {/* Étape 6 : Activité physique */}
              {step === 6 && (
                <div id="step_activity">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-display font-bold text-slate-800">
                      {t.onboarding.stepActTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    {t.onboarding.stepActDesc}
                  </p>
                  <div className="flex flex-col gap-3">
                    {t.onboarding.activities.map((act) => (
                      <button
                        key={act.value}
                        type="button"
                        onClick={() => setPhysicalActivity(act.value)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-sm cursor-pointer ${
                          physicalActivity === act.value 
                            ? "bg-green-50 border-green-500 text-green-800 font-bold shadow-sm shadow-green-100" 
                            : "bg-white/70 border-green-100 hover:bg-green-50/30 text-slate-600 hover:border-green-300"
                        }`}
                      >
                        <span>{act.label}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${physicalActivity === act.value ? "border-green-600 bg-green-500" : "border-slate-300"}`}>
                          {physicalActivity === act.value && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Étape 7 : Antécédents médicaux */}
              {step === 7 && (
                <div id="step_history">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-display font-bold text-slate-800">
                      {t.onboarding.stepHistoryTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    {t.onboarding.stepHistoryDesc}
                  </p>
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto mb-3">
                    {t.onboarding.medicalHistories.map((med, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setHistory(med.value)}
                        className={`text-left text-xs p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          history === med.value 
                            ? "bg-green-50 border-green-500 font-bold text-green-800 shadow-sm shadow-green-100" 
                            : "bg-white/70 border-green-100 hover:bg-green-50/30 text-slate-600 hover:border-green-300"
                        }`}
                      >
                        {med.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={history}
                    onChange={(e) => setHistory(e.target.value)}
                    placeholder={t.onboarding.stepHistoryPlaceholder}
                    className="w-full px-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none"
                    id="input_history_text"
                  />
                </div>
              )}

              {/* Étape 8 : Objectifs bien-être */}
              {step === 8 && (
                <div id="step_goal">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-lg font-display font-bold text-slate-800">
                      {t.onboarding.stepGoalTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    {t.onboarding.stepGoalDesc}
                  </p>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                    {t.onboarding.wellnessGoals.map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGoal(g.value)}
                        className={`text-left text-xs p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          goal === g.value 
                            ? "bg-green-50 border-green-500 font-bold text-green-800 shadow-sm shadow-green-100" 
                            : "bg-white/70 border-green-100 hover:bg-green-50/30 text-slate-600 hover:border-green-300"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Étape 9 : Récapitulatif d'Onboarding */}
              {step === 9 && (
                <div id="step_summary" className="text-center font-sans py-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h2 className="text-base font-display font-bold text-slate-800">
                    {t.onboarding.stepSumTitle}
                  </h2>
                  <p className="text-xs text-slate-500 bg-emerald-50/50 p-4 rounded-2xl border border-dashed border-emerald-200 max-w-sm mx-auto my-4 text-left leading-relaxed">
                    {t.onboarding.stepSumDesc}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <span>{age} {t.onboarding.stepSumYears}</span> • <span>{weight} kg</span> • <span>{t.onboarding.stepSumReside} {country}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons de Navigation inférieure */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-50">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 1}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs border border-slate-200 shadow-sm transition-all duration-200 cursor-pointer ${
                  step === 1 
                    ? "opacity-40 cursor-not-allowed text-slate-300 bg-slate-50" 
                    : "hover:bg-slate-50 text-slate-600 bg-white"
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t.common.back}
              </button>

              {step < 9 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (step === 2 && !age) ||
                    (step === 3 && (!weight || !height)) ||
                    (step === 5 && !diet)
                  }
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-bold text-xs rounded-full shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {t.common.continue}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold text-xs rounded-full shadow-lg transition-all duration-300 animate-pulse cursor-pointer"
                >
                  {t.onboarding.stepSumFinish}
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
