import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, getDocFromServer, deleteDoc } from "firebase/firestore";
import { auth, db, loginWithGoogle, handleFirestoreError, OperationType } from "./firebase";
import { ProfileData } from "./types";
import { translations } from "./lib/translations";
import Header from "./components/Header";
import OnboardingView from "./components/OnboardingView";
import DashboardView from "./components/DashboardView";
import { motion, AnimatePresence } from "motion/react";
import { HeartPulse, ShieldCheck, LogIn, ChevronRight, Apple, Sparkles } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  // Langue de l'application (Bilingue FR/EN)
  const [lang, setLang] = useState<'fr' | 'en'>(() => {
    const saved = localStorage.getItem("besafe_lang");
    if (saved === "fr" || saved === "en") return saved;
    return "fr";
  });

  // États de chargement
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Sauvegarde automatique du choix de langue local
  useEffect(() => {
    localStorage.setItem("besafe_lang", lang);
  }, [lang]);

  // 1. Validation de la connexion à Firestore lors de l'initialisation (requis par la consigne de sécurité)
  const validateFirestoreConnection = async () => {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error: any) {
      if (error instanceof Error && error.message.includes("offline")) {
        console.warn("[BeSafe] Le client Firestore semble être hors-ligne. Veuillez vérifier la connexion.");
      }
    }
  };

  // 2. Écouter le changement d'état d'authentification de Firebase Auth
  useEffect(() => {
    validateFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);

      if (currentUser) {
        setLoadingProfile(true);
        const path = `profiles/${currentUser.uid}`;
        try {
          const profileDoc = await getDoc(doc(db, "profiles", currentUser.uid));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data() as ProfileData;
            setProfile(profileData);
            if (profileData.language === "en" || profileData.language === "fr") {
              setLang(profileData.language);
            }
          } else {
            setProfile(null);
          }
        } catch (error: any) {
          console.error("Erreur de récupération du profil Firestore:", error);
          try {
            handleFirestoreError(error, OperationType.GET, path);
          } catch (e) {
            // Évite de crasher si permissions non appliquées
          }
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Déclenché à la fin de l'onboarding réussi
  const handleOnboardingComplete = (newProfile: ProfileData) => {
    setProfile(newProfile);
    if (newProfile.language === "en" || newProfile.language === "fr") {
      setLang(newProfile.language);
    }
  };

  // Réinitialise le profil de l'utilisateur (permet d'écraser / relancer l'onboarding)
  const handleResetProfile = async () => {
    if (!user) return;
    const confirmMsg = lang === "en" 
      ? "Do you want to reset your health diagnosis? This action will delete your current BeSafe score."
      : "Voulez-vous réinitialiser votre diagnostic de santé ? Cette action supprimera votre score BeSafe actuel.";
    if (window.confirm(confirmMsg)) {
      setLoadingProfile(true);
      const path = `profiles/${user.uid}`;
      try {
        await deleteDoc(doc(db, "profiles", user.uid));
        setProfile(null);
      } catch (error: any) {
        handleFirestoreError(error, OperationType.DELETE, path);
      } finally {
        setLoadingProfile(false);
      }
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      alert("Erreur d'authentification Google : " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-emerald-100 bg-[#f0fdf4]" id="besafe_app_main">
      {/* En-tête globale du site */}
      <Header user={user} loading={loadingUser} lang={lang} setLang={setLang} />

      <main className="flex-grow flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          
          {/* ÉCRAN DE CHARGEMENT GLOBAL */}
          {(loadingUser || loadingProfile) ? (
            <motion.div
              key="global_loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center p-8 text-neutral-500"
              id="global_app_loader"
            >
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
                <HeartPulse className="w-8 h-8 text-emerald-500 animate-bounce absolute top-4 left-4" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {lang === "en" ? "BeSafe is loading..." : "BeSafe s'active..."}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-mono">
                {lang === "en" ? "Secure connection to clinical database" : "Connexion sécurisée aux serveurs de santé"}
              </p>
            </motion.div>
          ) : !user ? (
            
            /* ÉCRAN D'ACCUEIL / LANDING POUR LES USERS NON CONNECTÉS */
            <motion.div
              key="landing_page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-8"
              id="unauthenticated_landing"
            >
              {/* Colonne Gauche Visuelle */}
              <div className="space-y-5 px-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-wider animate-pulse">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {t.landing.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-800 leading-tight">
                  {t.landing.title} <span className="text-gradient font-black">BeSafe</span>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto md:mx-0">
                  {t.landing.desc}
                </p>
                <div className="flex gap-4 items-center justify-center md:justify-start">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-800">Cam</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-250 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-999">Sén</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-350 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-999">RDC</div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{t.landing.adoptedBy}</span>
                </div>
              </div>

              {/* Colonne Droite Métriques & Bouton de connexion */}
              <div className="glass-panel p-8 rounded-3xl shadow-xl border border-white text-center flex flex-col items-center justify-center min-h-[360px]" id="auth_holder_card">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-display font-bold text-slate-800">{t.landing.cardTitle}</h3>
                <p className="text-xs text-slate-400 mt-2 mb-6 max-w-xs leading-relaxed">
                  {t.landing.cardDesc}
                </p>

                <button
                  onClick={handleLogin}
                  className="w-full max-w-xs py-3.5 bg-slate-900 text-white font-sans text-xs font-bold rounded-2xl shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                  id="btn_google_signin"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  {t.landing.button}
                  <ChevronRight className="w-3.5 h-3.5 opacity-55" />
                </button>

                {/* Petites fonctionnalités listées */}
                <div className="flex items-center gap-4 justify-center mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Apple className="w-3.5 h-3.5 text-emerald-500" /> {t.landing.featureScan}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> {t.landing.featureDiagnose}</span>
                </div>
              </div>
            </motion.div>
          ) : !profile ? (
            
            /* ÉCRAN ONBOARDING : L'UTILISATEUR S'EST CONNECTÉ MAIS N'A PAS ENCORE DE PROFIL IA ENREGISTRÉ */
            <motion.div
              key="onboarding_flow"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full"
            >
              <OnboardingView user={user} onComplete={handleOnboardingComplete} lang={lang} setLang={setLang} />
            </motion.div>
          ) : (
            
            /* ÉCRAN COMPLET DIAGNOSTIC DASHBOARD */
            <motion.div
              key="dashboard_flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <DashboardView user={user} profile={profile} onResetProfile={handleResetProfile} lang={lang} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Pied de page humble et discret */}
      <footer className="w-full py-4 px-4 text-center text-[10px] text-slate-400 border-t border-slate-100 font-sans mt-auto">
        <p>
          {lang === "en" 
            ? "© 2026 BeSafe. Personal health & preventive nutrition companion. Does not replace professional clinical consulting." 
            : "© 2026 BeSafe. Accompagnateur personnel de santé & nutrition préventive. Ne remplace pas l'avis d'un médecin agréé."}
        </p>
        <p className="mt-0.5 text-slate-300">
          {lang === "en"
            ? "Powered by Health-tech preventive nutritional assessment platform."
            : "Propulsé par la plateforme d'évaluation nutritionnelle Health-tech."}
        </p>
      </footer>
    </div>
  );
}
